require('dotenv').config();
const isProd = process.env.NODE_ENV === 'production';

// env check
if (isProd) { 
  ['MONGO_URI', 'JWT_SECRET'].forEach((key) => {
    if (!process.env[key]) {
      console.error(`❌ Missing required environment variable: ${key}`);
      process.exit(1); // Stop server immediately
    }
  });
}

// core modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const redisClient = require('./RedisClient');
const user = require('./models/user');

// Security + Middleware
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const startImapPoller = require('./utils/imapPoller');
const cron = require('node-cron');
const axios = require('axios');

// express app
const app = express();
// procy for prod
if (isProd) {
  app.set('trust proxy', 1); // for Vercel proxie
}

// routes
const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprint');
const adminRoutes = require('./routes/admin');
// CORS(Cross-Origin Resource Sharing)
const allowedOrigins = [
  'http://localhost:3000',             // local dev
  'http://localhost:4950',
  'https://cft-self.vercel.app',       // vercel frontend
  'https://cft-21jftdfuy-chacha0044s-projects.vercel.app',
  'https://carbonft.app',   // name.com domain
  'https://www.carbonft.app',
  'https://api.carbonft.app',
  'https://accounts.google.com',       // google accounts
   /https:\/\/cft-.*\.vercel\.app$/,   // any subdomain matching cft-*.vercel.app
];

const corsOptions = {
  origin: (origin, callback) => { // called for every request to check if the request's Origin header is allowed
    // requests with no origin (mobile apps, Postman, curl, etc.) server-to-server or testing 
    if (!origin) return callback(null, true);
    
    // Vercel
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-admin-secret', 'x-admin-code'],
  exposedHeaders: ['Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser()); //Reading the token cookie after login
if (isProd) {
  app.use(helmet({ //Prevents clickjacking, downgrade attacks, and data leaks
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "img-src": ["'self'", "data:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'", "https:"],
        "style-src": ["'self'", "'unsafe-inline'", "https:"],
        "connect-src": ["'self'", "https:", "http:", "*.vercel.app"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "no-referrer" }, //Stops other sites from knowing the URL of my pages when a user clicks outbound links
    frameguard: { action: "deny" }, //never allow iframe embedding
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },//prevents downgrade attacks and protects against (MITM) attacks where an attacker tries to force HTTP (1 year, including all sub domains)
  }));
  app.use(helmet.permittedCrossDomainPolicies());//Protects against attacks that try to load my resources cross-domain
} else {
  app.use(helmet({ contentSecurityPolicy: false }));
}
app.use(mongoSanitize()); //Removes $ and . from keys in req.body, req.query, and req.params
app.use(xss());
app.use(hpp());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' })); //For APIs sending JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' })); //HTML <form> submissions

//limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 50 : 200, // reduce to 100
  standardHeaders: true, //for better visibility and exposing rate limit info in headers
  legacyHeaders: false, //to avoid deprecated headers
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProd ? 8 : 100, //reduce to 10
  standardHeaders: true, 
  legacyHeaders: false,  
  message: 'Too many login/register attempts. Try again later.'
});
app.use('/api/auth', authLimiter);

if (isProd) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {  //Forces HTTPS on first HTTP request, works with hsts to never allow http requests in prod
      return res.redirect(301, 'https://' + req.headers.host + req.url);
    }
    next();
  });
}

// routes
app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/admin', adminRoutes);
// test route
app.get('/api', (req, res) => {
  res.send('CFT API is live!');
});

app.get('/api/redis-test', async (req, res) => {
  try {
    let visits = await redisClient.get("visits");
    visits = visits ? parseInt(visits) + 1 : 1;
    await redisClient.set("visits", visits);
    res.json({ message: "Redis is working!", visits });
  } catch (err) {
    console.error("❌ Redis route error:", err);
    res.status(500).json({ error: "Redis error" });
  }
});

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack || err); // global error handler , show error in dev , generic msg in prod
  if (!isProd) {
    // Dev
    return res.status(500).json({ error: err.message, stack: err.stack, });
  }
  // Prod
  res.status(500).json({
    error: 'Something went wrong. Please try again later.',
  });
});

//const PORT = process.env.PORT || 5000;
const PORT = process.env.PORT || 4950;
mongoose.connect(process.env.MONGO_URI, { //SSL enabled, autoIndex false in prod → prevents performance issues
  dbName: 'carbon-tracker',
  ssl: true,
  autoIndex: false,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
    console.log(`✅ Server started on ${PORT}`);
    startImapPoller(); 
    cron.schedule('*/3 * * * *', async () => {
    try {
      const url = `https://cft-cj43.onrender.com/api/auth/ping?ts=${Date.now()}`; 
      const res = await axios.get(url);
      console.log(`⏱️ Pinged self: ${res.data.message}`);
    } catch (err) {
      console.error('❌ Ping failed:', err.message);
    }
  });
  cron.schedule('0 0 * * *', async () => { // Runs every day at midnight
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = await user.updateMany(
      {
        provider: 'google',
        $or: [
          { tempPasswordCreatedAt: { $lte: threeDaysAgo } },
          { passwordTokenCreatedAt: { $lte: threeDaysAgo } },
        ],
      },
      {
        $unset: {
          tempPassword: "",
          tempPasswordCreatedAt: "",
          passwordToken: "",
          passwordTokenCreatedAt: "",
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`🧹 Cleaned ${result.modifiedCount} expired temp/password fields for Google users`);
    } else {
      //console.log('🧹 No expired temp/password fields found for Google users');
    }
  } catch (err) {
    console.error('❌ Cron cleanup error:', err);
  }
});

    });
  })
  .catch(err => console.error('❌ MongoDB error:', err));

