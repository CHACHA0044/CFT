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
app.set('trust proxy', 1);
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
  max: 100, // reduce to 100
  message: 'Too many requests, please try again later.'
});
app.use('/api', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10, //reduce to 10
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
// server.js
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
// app.set('trust proxy', 1);
// // ===== ROUTES =====
// const authRoutes = require('./routes/auth');
// const footprintRoutes = require('./routes/footprint');

// // ===== FILE PATHS =====
// const cspLogFile = path.join(__dirname, 'csp-violations.log');
// const mongoLogFile = path.join(__dirname, 'mongo-sanitize.log');
// const emailErrLog = path.join(__dirname, 'email-errors.log');

// // ===== BATCH SETTINGS =====
// const BATCH_INTERVAL = (Number(process.env.CSP_BATCH_INTERVAL_HOURS) || 4) * 60 * 60 * 1000;
// let cspReportBuffer = [];
// let sanitizeReportBuffer = [];

// // ===== CSP-only Mailer setup (for batch emails only) =====
// // This transporter is used ONLY for sending the periodic CSP/sanitize batch reports.
// // Registration emails should be sent by routes/auth (they'll make their own transporter).
// let cspTransporter = null;
// (function initCspTransporter() {
//   try {
//     let transportOptions;

//     if (process.env.SENDGRID_API_KEY) {
//       transportOptions = {
//         host: 'smtp.sendgrid.net',
//         port: 587,
//         secure: false,
//         auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
//       };
//       console.log('ℹ️ CSP mailer: configuring SendGrid SMTP');
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
//       console.log('ℹ️ CSP mailer: configuring custom SMTP host');
//     } else if (process.env.EMAIL_SERVICE) {
//       transportOptions = {
//         service: process.env.EMAIL_SERVICE,
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//       };
//       console.log(`ℹ️ CSP mailer: configuring service ${process.env.EMAIL_SERVICE}`);
//     } else {
//       // fallback to Gmail SMTP (explicit). Note: may be blocked on some hosts.
//       transportOptions = {
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true,
//         auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//       };
//       console.log('⚠️ CSP mailer: falling back to smtp.gmail.com (may be blocked)');
//     }

//     cspTransporter = nodemailer.createTransport(transportOptions);

//     cspTransporter.verify()
//       .then(() => console.log('📧 CSP transporter verified and ready'))
//       .catch(err => {
//         const msg = `⚠️ CSP transporter verify failed: ${err && err.message ? err.message : String(err)}`;
//         console.warn(msg);
//         try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) {}
//         // keep transporter even if verify failed; send attempts will show errors which get logged
//       });
//   } catch (err) {
//     cspTransporter = null;
//     const msg = `❌ CSP transporter init failed: ${err && err.message ? err.message : String(err)}`;
//     console.warn(msg);
//     try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] ${msg}\n`); } catch (e) {}
//   }

//   // helper to send CSP batch mails; available as app.locals.sendCspMailAsync
//   app.locals.sendCspMailAsync = async function (mailOptions) {
//     // mailOptions: { from, to, subject, text, html }
//     if (!cspTransporter) {
//       const err = new Error('CSP mail transporter not configured');
//       try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] sendCspMail error: ${err.message}\n${JSON.stringify(mailOptions)}\n`); } catch (e) {}
//       throw err;
//     }
//     try {
//       const info = await cspTransporter.sendMail(mailOptions);
//       try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] CSP sent: ${info.messageId} -> ${mailOptions.to}\n`); } catch (e) {}
//       return info;
//     } catch (err) {
//       try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] CSP send failed: ${err && err.message}\n${JSON.stringify(mailOptions)}\n${err.stack || ''}\n`); } catch (e) {}
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
//     if (!origin) return callback(null, true); // allow Postman & server-side calls
//     if (allowedOrigins.includes(origin)) return callback(null, true);
//     return callback(new Error(`Not allowed by CORS: ${origin}`));
//   },
//   credentials: true,
//   methods: ['GET','POST','PUT','DELETE'],
//   allowedHeaders: ['Content-Type','Authorization'],
// };

// app.use(cors(corsOptions));
// app.use(cookieParser());

// // Keep CSP disabled like your old working file to avoid breaking frontend assets
// app.use(helmet({ contentSecurityPolicy: false }));

// // ===== Permissions-Policy =====
// app.use((req, res, next) => {
//   res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), fullscreen=(), payment=()');
//   next();
// });

// // ===== CSP REPORTING ENDPOINT =====
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

// // ===== BATCH SENDER =====
// setInterval(async () => {
//   try {
//     const violations = [...cspReportBuffer];
//     const sanitizes = [...sanitizeReportBuffer];
//     // clear buffers
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

//     // Send only if transporter is configured; otherwise log to emailErrLog
//     if (typeof app.locals.sendCspMailAsync === 'function') {
//       try {
//         await app.locals.sendCspMailAsync({
//           from: process.env.EMAIL_USER,
//           to: process.env.EMAIL_USER,
//           subject: `🛡 Security Report - ${violations.length} CSP & ${sanitizes.length} Sanitize`,
//           text: bodyText
//         });
//         console.log('📧 CSP/Sanitize batch email sent (if transporter accepted it).');
//       } catch (err) {
//         console.error('❌ CSP batch send failed:', err && err.message);
//       }
//     } else {
//       // transporter not ready; write to error log
//       try { fs.appendFileSync(emailErrLog, `[${new Date().toISOString()}] Batch email skipped - transporter missing\n${bodyText}\n`); } catch (e) {}
//       console.warn('⚠️ Batch skipped: CSP transporter not configured');
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
//     fs.appendFile(mongoLogFile, logLine, err => {
//       if (err) console.error('❌ Failed to write mongo sanitize log:', err);
//     });

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
//   message: 'Too many requests, please try again later.'
// });
// app.use('/api', generalLimiter);

// const authLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000,
//   max: 10,
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
// app.use('/api/auth', authRoutes);      // auth routes should create/send their own registration emails
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
//   console.log(`Server is running on port ${PORT} (${process.env.NODE_ENV})`);
// });
