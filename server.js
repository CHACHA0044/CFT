require('dotenv').config();

// core modules
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// Security + Middleware
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// express app
const app = express();

// routes
const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprint');

// CORS
const allowedOrigins = [
  'http://localhost:3000', // local frontend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests

    if (process.env.NODE_ENV === 'production') {
      // In production, frontend + backend share the same origin
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
};



app.use(cors(corsOptions));
app.use(cookieParser());

// 🛡️ Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // reduce to 100
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 1000, //reduce to 10
  message: 'Too many login/register attempts. Try again later.'
});
app.use('/api/auth', authLimiter);

// 🔐 Force HTTPS in production (Render / Vercel etc.)
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

app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// mongoDB 
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'carbon-tracker',
  ssl: true,
 // useNewUrlParser: true,
 // useUnifiedTopology: true,
  autoIndex: false,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// serve frontend in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../client/build')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
//   });
// }
