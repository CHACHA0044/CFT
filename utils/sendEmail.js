// const nodemailer = require('nodemailer');

// const sendEmail = async (to, subject, html) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail', // Or use SMTP settings
//       auth: {
//         user: process.env.EMAIL_USER, // Your Gmail/SMTP user
//         pass: process.env.EMAIL_PASS  // Your Gmail/SMTP app password
//       }
//     });

//     await transporter.sendMail({
//       from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html
//     });

//     console.log('✅ Verification email sent to:', to);
//   } catch (error) {
//     console.error('❌ Email sending failed:', error);
//   }
// };

// module.exports = sendEmail;
// utils/sendEmail.js
const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER / EMAIL_PASS not set');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,               // reuse connections (better reliability)
    maxConnections: 5,
    maxMessages: 100,
    logger: process.env.NODE_ENV !== 'production', // helpful in dev
    debug: process.env.NODE_ENV !== 'production',
  });
};

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  // verify connection config first
  await transporter.verify();

  const mailOptions = {
    from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  // simple retry loop for transient errors
  const maxAttempts = Number(process.env.EMAIL_MAX_ATTEMPTS) || 3;
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent to:', to, 'messageId:', info.messageId);
      return info;
    } catch (err) {
      lastErr = err;
      console.error(`Attempt ${attempt} - failed to send email to ${to}:`, err && err.message ? err.message : err);
      if (attempt < maxAttempts) {
        // exponential backoff
        const wait = attempt * 1000;
        await new Promise((r) => setTimeout(r, wait));
      } else {
        // exhausted
        break;
      }
    }
  }

  // rethrow so caller can decide what to do (rollback, notify user, enqueue, etc.)
  throw lastErr || new Error('Failed to send email');
};

module.exports = sendEmail;
