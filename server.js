// require('dotenv').config();

// // core modules
// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');

// // Security + Middleware
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');
// const cookieParser = require('cookie-parser');

// // express app
// const app = express();

// // routes
// const authRoutes = require('./routes/auth');
// const footprintRoutes = require('./routes/footprint');

// // CORS
// const allowedOrigins = [
//   'http://localhost:3000',             // local dev
//   'https://cft-self.vercel.app',       // vercel frontend
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true); // allow Postman & server-side calls
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     return callback(new Error(`Not allowed by CORS: ${origin}`));
//   },
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization'],
// };

// app.use(cors(corsOptions));
// app.use(cookieParser());

// // 🛡️ Security Middleware
// app.use(helmet({ contentSecurityPolicy: false }));
// app.use(mongoSanitize());
// app.use(xss());
// app.use(hpp());
// app.disable('x-powered-by');
// app.use(express.json({ limit: '10kb' }));
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1500, // reduce to 100
//   message: 'Too many requests, please try again later.'
// });
// app.use('/api', generalLimiter);

// const authLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 100, //reduce to 10
//   message: 'Too many login/register attempts. Try again later.'
// });
// app.use('/api/auth', authLimiter);

// // 🔐 Force HTTPS in production (Render / Vercel etc.)
// if (process.env.NODE_ENV === 'production') {
//   app.use((req, res, next) => {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect('https://' + req.headers.host + req.url);
//     }
//     next();
//   });
// }

// // routes
// app.use('/api/auth', authRoutes);
// app.use('/api/footprint', footprintRoutes);

// // test route
// app.get('/api', (req, res) => {
//   res.send('🌱 Carbon Footprint API is live and secure.');
// });

// app.use((err, req, res, next) => {
//   console.error('❌ Unhandled error:', err.stack);
//   res.status(500).json({ error: 'Something went wrong' });
// });

// // mongoDB 
// mongoose.connect(process.env.MONGO_URI, {
//   dbName: 'carbon-tracker',
//   ssl: true,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   autoIndex: false,
// })
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err.message));

// // server startup
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// // // serve frontend in production
// // // if (process.env.NODE_ENV === 'production') {
// // //   app.use(express.static(path.join(__dirname, 'client/build')));
// // //   app.get('*', (req, res) => {
// // //     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
// // //   });
// // // }

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Security + Middleware
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const app = express();

// ===== ROUTES =====
const authRoutes = require('./routes/auth');
const footprintRoutes = require('./routes/footprint');

// ===== FILE PATHS =====
const cspLogFile = path.join(__dirname, 'csp-violations.log');
const mongoLogFile = path.join(__dirname, 'mongo-sanitize.log');

// ===== CSP BATCH SETTINGS =====
const CSP_BATCH_INTERVAL = (Number(process.env.CSP_BATCH_INTERVAL_HOURS) || 4) * 60 * 60 * 1000;
let cspReportBuffer = [];

// ===== Nodemailer =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email
transporter.verify().then(() => {
  console.log('📧 Nodemailer ready');
}).catch(err => {
  console.warn('⚠️ Nodemailer verification failed:', err.message || err);
});

// ===== CORS =====
const allowedOrigins = [
  'http://localhost:3000',
  'https://cft-self.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// ===== Helmet (CSP + headers) =====
const frontendOrigin = 'https://cft-self.vercel.app';
const backendOrigin = process.env.BACKEND_URL || '';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", frontendOrigin],
      styleSrc: ["'self'", "'unsafe-inline'", frontendOrigin, "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", frontendOrigin, backendOrigin, "https:"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      reportUri: ['/csp-report'] // send CSP violations here
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : undefined,
}));

// ===== Permissions-Policy =====
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), fullscreen=(), payment=()'
  );
  next();
});

// ===== CSP REPORTING ENDPOINT =====
app.post(
  '/csp-report',
  express.json({ type: ['json', 'application/csp-report'], limit: '50kb' }),
  (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || '';

    const entry = { timestamp, ip, userAgent, report: req.body };

    // Append to file
    fs.appendFile(cspLogFile, JSON.stringify(entry) + '\n', (err) => {
      if (err) console.error('❌ Failed to write CSP log:', err);
    });

    // Add to batch buffer
    cspReportBuffer.push(entry);

    res.status(204).end();
  }
);

// ===== SEND CSP BATCH EMAILS =====
setInterval(() => {
  if (cspReportBuffer.length === 0) return;

  const batch = [...cspReportBuffer];
  cspReportBuffer = [];

  const bodyText = batch.map(e =>
    `[${e.timestamp}] IP: ${e.ip}\nUA: ${e.userAgent}\n${JSON.stringify(e.report, null, 2)}`
  ).join('\n---\n');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `🚨 CSP Violation Batch (${batch.length} reports)`,
    text: bodyText
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('❌ Failed to send CSP batch email:', err);
    else console.log(`📧 CSP batch email sent: ${info.messageId}`);
  });
}, CSP_BATCH_INTERVAL);

// ===== Security Middleware =====
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const time = new Date().toISOString();

    const logLine = `[${time}] Removed key "${key}" from IP ${ip} | URL: ${req.originalUrl}\n`;
    fs.appendFile(mongoLogFile, logLine, err => {
      if (err) console.error('❌ Failed to write mongo sanitize log:', err);
    });

    // Email alert for sanitize attempt
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `⚠️ Mongo Sanitize Triggered - ${ip}`,
      text: logLine
    };
    transporter.sendMail(mailOptions, err => {
      if (err) console.error('❌ Failed to send sanitize email:', err);
    });
  }
}));

app.use(xss());
app.use(hpp());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// ===== Rate Limits =====
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'Too many login/register attempts. Try again later.'
});
app.use('/api/auth', authLimiter);

// ===== Force HTTPS =====
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}

// ===== Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);

app.get('/api', (req, res) => {
  res.send('🌱 Carbon Footprint API is live and secure.');
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', process.env.NODE_ENV === 'production' ? err.message : err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// ===== MongoDB Connect =====
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'carbon-tracker',
  ssl: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV})`);
});
