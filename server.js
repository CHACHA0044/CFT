require('dotenv').config();

// core modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const redisClient = require('./RedisClient');

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
app.set('trust proxy', 1);
// routes
const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprint');

// CORS
const allowedOrigins = [
  'http://localhost:3000',             // local dev
  'https://cft-self.vercel.app',       // vercel frontend
  'https://cft-21jftdfuy-chacha0044s-projects.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman & server-side calls
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400, // reduce to 100
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 800, //reduce to 10
  message: 'Too many login/register attempts. Try again later.'
});
app.use('/api/auth', authLimiter);

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// routes
app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);

// test route
app.get('/api', (req, res) => {
  res.send('🌱 Carbon Footprint API is live and secure.');
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
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  dbName: 'carbon-tracker',
  ssl: true,
  autoIndex: false,
})
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server started on ${PORT}`);
      startImapPoller(); 

    cron.schedule('*/14 * * * *', async () => {
    try {
      const url = 'https://cft-cj43.onrender.com/api/auth/ping'; 
      const res = await axios.get(url);
      console.log('⏱️ Pinged self:', res.data.message, res.data.timestamp);
    } catch (err) {
      console.error('❌ Ping failed:', err.message);
    }
  });

    });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

