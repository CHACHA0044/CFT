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

// Security + Middleware + others
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
const startFeedbackScanner = require('./utils/feedbackPoller');

// express app
const app = express();
// procy for prod, needed when different domains for frontend and backend
if (isProd) {
  app.set('trust proxy', 1); // for Vercel proxie
}

// routes
const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprint');
// CORS(Cross-Origin Resource Sharing)
app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server, cron, curl, postman
    if (!origin) return callback(null, true);

    // DEV
    if (!isProd && origin === 'http://localhost:3000') {
      return callback(null, true);
    }

    // PROD
    if (
      isProd &&
      (origin === 'https://carbonft.app' || origin === 'https://www.carbonft.app')
    ) {
      return callback(null, true);
    }

    console.log('❌ CORS blocked:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'x-admin-secret', 'x-admin-code'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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
  max: isProd ? 50 : 200, // reduce to 50
  standardHeaders: true, //for better visibility and exposing rate limit info in headers
  legacyHeaders: false, //to avoid deprecated headers
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isProd ? 20 : 100, //reduce to 20
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
// test route
app.get('/api', (req, res) => {
  res.send('CFT API is live son!');
});

app.get('/api/redis-test', async (req, res) => {
  try {
    let visits = await redisClient.get("visits");
    visits = visits ? parseInt(visits) + 1 : 1;
    await redisClient.set("visits", visits);
    res.json({ message: "Redis is working!!!!!", visits });
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
    startFeedbackScanner();
    cron.schedule('*/3 * * * *', async () => {
    try {
      const url = `https://api.carbonft.app/api/auth/ping?ts=${Date.now()}`; 
      const res = await axios.get(url);
      console.log(`⏱️ Pinged self: ${res.data.message}`);
    } catch (err) {
      console.error('❌ Ping failed:', err.message);
    }
  });
  cron.schedule("*/30 * * * *", async () => { // Runs every day at midnight
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

