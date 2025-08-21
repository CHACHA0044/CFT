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
  'http://localhost:3000',             // local dev
  'https://cft-self.vercel.app',       // vercel frontend
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

// 🛡️ Security Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500, // reduce to 100
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100, //reduce to 10
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
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
//   app.use(express.static(path.join(__dirname, 'client/build')));
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
//   });
// }

// // server.js (mailing fixed + batch reporting preserved)
// // ----------------------------------------------------
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const path = require('path');
// const fs = require('fs');

// // Security + Middleware
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
// const hpp = require('hpp');
// const cookieParser = require('cookie-parser');
// const nodemailer = require('nodemailer');

// const app = express();

// // ===== ROUTES =====
// const authRoutes = require('./routes/auth');
// const footprintRoutes = require('./routes/footprint');

// // ===== FILE PATHS =====
// const cspLogFile = path.join(__dirname, 'csp-violations.log');
// const mongoLogFile = path.join(__dirname, 'mongo-sanitize.log');
// const emailErrLog = path.join(__dirname, 'email-errors.log');

// // ===== BATCH / MAIL SETTINGS =====
// const BATCH_INTERVAL = (Number(process.env.CSP_BATCH_INTERVAL_HOURS) || 4) * 60 * 60 * 1000;
// let cspReportBuffer = [];
// let sanitizeReportBuffer = [];

// // ===== Mailer setup (robust, single transporter) =====
// // Priority:
// // 1) If SENDGRID_API_KEY present -> use SendGrid SMTP
// // 2) If SMTP_HOST provided -> use that
// // 3) Else if EMAIL_SERVICE present (e.g. 'gmail') -> use service
// // 4) Otherwise fall back to smtp.gmail.com (may be blocked on some hosts)
// let transporter;
// (async function initTransporter() {
//   try {
//     let transportOptions = null;

//     if (process.env.SENDGRID_API_KEY) {
//       // Use SendGrid SMTP credentials (user 'apikey')
//       transportOptions = {
//         host: 'smtp.sendgrid.net',
//         port: 587,
//         secure: false,
//         auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
//       };
//       console.log('ℹ️ Mailer: configuring SendGrid SMTP');
//     } else if (process.env.SMTP_HOST) {
//       transportOptions = {
//         host: process.env.SMTP_HOST,
//         port: Number(process.env.SMTP_PORT) || 587,
//         secure: process.env.SMTP_SECURE === 'true',
//         auth: {
//           user: process.env.SMTP_USER || process.env.EMAIL_USER,
//           pass: process.env.SMTP_PASS || process.env.EMAIL_PASS
//         }
//       };
//       console.log('ℹ️ Mailer: configuring custom SMTP host');
//     } else if (process.env.EMAIL_SERVICE) {
//       // nodemailer service (e.g., 'gmail')
//       transportOptions = {
//         service: process.env.EMAIL_SERVICE,
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS
//         }
//       };
//       console.log(`ℹ️ Mailer: configuring service ${process.env.EMAIL_SERVICE}`);
//     } else {
//       // fallback to Gmail SMTP (explicit)
//       transportOptions = {
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true,
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//       };
//       console.log('⚠️ Mailer: no provider configured explicitly — falling back to smtp.gmail.com (may be blocked)');
//     }

//     transporter = nodemailer.createTransport(transportOptions);

//     await transporter.verify();
//     console.log('📧 Nodemailer transporter verified and ready');

//   } catch (err) {
//     transporter = null;
//     const msg = `❌ Nodemailer init failed: ${err && err.message ? err.message : String(err)}`;
//     console.warn(msg);
//     // persist the transporter init problem to file for postmortem
//     try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) {}
//   }

//   // Expose helper that routes should use
//   app.locals.transporter = transporter;
//   app.locals.sendMailAsync = async function(mailOptions) {
//     // mailOptions: { from, to, subject, text, html }
//     if (!app.locals.transporter) {
//       const err = new Error('No mail transporter configured');
//       try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] sendMail error: ${err.message}\n${JSON.stringify(mailOptions)}\n`); } catch (e) {}
//       throw err;
//     }
//     try {
//       const info = await app.locals.transporter.sendMail(mailOptions);
//       // log success
//       try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] sent: ${info.messageId} -> ${mailOptions.to}\n`); } catch (e) {}
//       return info;
//     } catch (err) {
//       // write error details to file
//       try {
//         fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] sendMail failed: ${err && err.message}\n${JSON.stringify(mailOptions)}\n${err.stack || ''}\n`);
//       } catch (e) {}
//       throw err;
//     }
//   };
// })();

// // ===== CORS =====
// const allowedOrigins = [
//   'http://localhost:3000',
//   'https://cft-self.vercel.app',
// ];

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true); // allow Postman & server-to-server
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(new Error(`Not allowed by CORS: ${origin}`));
//   },
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization'],
// };
// app.use(cors(corsOptions));
// app.use(cookieParser());

// // ===== Helmet (CSP + headers) =====
// const frontendOrigin = 'https://cft-self.vercel.app';
// const backendOrigin = process.env.BACKEND_URL || '';

// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https:"],
//       imgSrc: ["'self'", "data:", "https:"],
//       fontSrc: ["'self'", "data:", "https:", "https://fonts.gstatic.com"],
//       connectSrc: ["'self'", "https:", frontendOrigin, backendOrigin],
//       objectSrc: ["'none'"],
//       frameAncestors: ["'none'"],
//       baseUri: ["'self'"],
//       formAction: ["'self'"]
//     }
//   },
//   referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
//   frameguard: { action: 'deny' },
//   crossOriginEmbedderPolicy: true,
//   crossOriginOpenerPolicy: true,
//   crossOriginResourcePolicy: { policy: 'same-origin' },
//   hsts: process.env.NODE_ENV === 'production'
//     ? { maxAge: 31536000, includeSubDomains: true, preload: true }
//     : undefined,
// }));

// // ===== Permissions-Policy =====
// app.use((req, res, next) => {
//   res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), fullscreen=(), payment=()');
//   next();
// });

// // ===== CSP REPORTING ENDPOINT (collects reports into buffer) =====
// app.post('/csp-report', express.json({ type: ['json', 'application/csp-report'], limit: '50kb' }), (req, res) => {
//   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
//   const timestamp = new Date().toISOString();
//   const userAgent = req.headers['user-agent'] || '';

//   const report = req.body['csp-report'] || req.body || {};
//   const entry = {
//     timestamp,
//     ip,
//     userAgent,
//     violatedDirective: report['violated-directive'] || 'unknown',
//     blockedURI: report['blocked-uri'] || 'unknown',
//     originalPolicy: report['original-policy'] || ''
//   };

//   fs.appendFile(cspLogFile, JSON.stringify(entry) + '\n', (err) => {
//     if (err) console.error('❌ Failed to write CSP log:', err);
//   });

//   cspReportBuffer.push(entry);
//   return res.status(204).end();
// });

// // ===== BATCH SENDER (CSP + sanitize merged) =====
// setInterval(async () => {
//   try {
//     const violations = [...cspReportBuffer];
//     const sanitizes = [...sanitizeReportBuffer];
//     cspReportBuffer = [];
//     sanitizeReportBuffer = [];

//     if (violations.length === 0 && sanitizes.length === 0) return;

//     let bodyText = '';
//     if (violations.length > 0) {
//       bodyText += `🚨 CSP Violations (${violations.length})\n\n`;
//       bodyText += violations.map(e => `[${e.timestamp}] IP: ${e.ip}\nUA: ${e.userAgent}\nDirective: ${e.violatedDirective}\nBlocked: ${e.blockedURI}`).join('\n---\n');
//       bodyText += '\n\n';
//     }
//     if (sanitizes.length > 0) {
//       bodyText += `⚠️ Mongo Sanitize Attempts (${sanitizes.length})\n\n`;
//       bodyText += sanitizes.map(e => `[${e.time}] IP: ${e.ip} | URL: ${e.url} | Removed key: "${e.key}"`).join('\n---\n');
//     }

//     // Only send email if transporter ready
//     if (app.locals && typeof app.locals.sendMailAsync === 'function') {
//       await app.locals.sendMailAsync({
//         from: process.env.EMAIL_USER,
//         to: process.env.EMAIL_USER,
//         subject: `🛡 Security Report - ${violations.length} CSP & ${sanitizes.length} Sanitize`,
//         text: bodyText
//       });
//       console.log('📧 Security batch email sent (if transporter accepted it).');
//     } else {
//       // transporter not ready; write to error log
//       fs.appendFile(emailErrLog, `[${new Date().toISOString()}] Batch email skipped - transporter not ready\n${bodyText}\n`, () => {});
//       console.warn('⚠️ Batch skipped: mailer not ready');
//     }
//   } catch (err) {
//     console.error('❌ Error in batch sender:', err);
//     try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] Batch sender error: ${err && err.stack || err}\n`); } catch (e) {}
//   }
// }, BATCH_INTERVAL);

// // ===== Security Middleware =====
// app.use(mongoSanitize({
//   replaceWith: '_',
//   onSanitize: ({ req, key }) => {
//     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
//     const time = new Date().toISOString();
//     const logLine = `[${time}] Removed key "${key}" from IP ${ip} | URL: ${req.originalUrl}\n`;
//     fs.appendFile(mongoLogFile, logLine, (err) => { if (err) console.error('❌ Failed to write mongo sanitize log:', err); });

//     sanitizeReportBuffer.push({ time, ip, key, url: req.originalUrl });
//   }
// }));
// app.use(xss());
// app.use(hpp());
// app.disable('x-powered-by');
// app.use(express.json({ limit: '10kb' }));

// // ===== Rate Limits =====
// const generalLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   keyGenerator: (req) => req.ip,
//   message: 'Too many requests, please try again later.'
// });
// app.use('/api', generalLimiter);

// const authLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 10,
//   keyGenerator: (req) => req.ip,
//   message: 'Too many login/register attempts. Try again later.'
// });
// app.use('/api/auth', authLimiter);

// // ===== Force HTTPS =====
// if (process.env.NODE_ENV === 'production') {
//   app.use((req, res, next) => {
//     if (req.headers['x-forwarded-proto'] !== 'https') {
//       return res.redirect('https://' + req.headers.host + req.url);
//     }
//     next();
//   });
// }

// // ===== Routes =====
// app.use('/api/auth', authRoutes);
// app.use('/api/footprint', footprintRoutes);

// app.get('/api', (req, res) => {
//   res.send('🌱 Carbon Footprint API is live and secure.');
// });

// // ===== Error Handler =====
// app.use((err, req, res, next) => {
//   console.error('❌ Unhandled error:', process.env.NODE_ENV === 'production' ? err.message : err.stack);
//   res.status(500).json({ error: 'Something went wrong' });
// });

// // ===== MongoDB Connect =====
// mongoose.connect(process.env.MONGO_URI, {
//   dbName: 'carbon-tracker',
//   ssl: true,
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   autoIndex: false,
// })
//   .then(() => console.log('✅ MongoDB connected'))
//   .catch(err => console.error('❌ MongoDB connection error:', err.message));

// // ===== Start Server =====
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV})`);
// });
