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
//     throw error;
//   }
// };

// module.exports = sendEmail;
// // utils/sendEmail.js
// const nodemailer = require('nodemailer');

// let transporter;

// function createTransporter() {
//   if (!transporter) {
//     transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 465,
//       secure: true, // use TLS
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS, // Gmail App Password required
//       },
//     });

//     // Verify connection at startup
//     transporter.verify()
//       .then(() => {
//         console.log('✅ SMTP connection verified, ready to send emails');
//       })
//       .catch(err => {
//         console.error('❌ SMTP connection failed:', err.message);
//       });
//   }
//   return transporter;
// }

// const sendEmail = async (to, subject, html) => {
//   try {
//     console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);

//     const result = await Promise.race([
//       createTransporter().sendMail({
//         from: `"Carbon Footprint Tracker" <${process.env.EMAIL_USER}>`,
//         to,
//         subject,
//         html,
//       }),
//       new Promise((_, reject) =>
//         setTimeout(() => reject(new Error('SMTP sendMail timeout')), 10000)
//       )
//     ]);

//     console.log(`✅ Email sent successfully to ${to}, MessageId: ${result.messageId}`);
//     return result;
//   } catch (error) {
//     console.error(`❌ Email sending failed for ${to}:`, error.message);
//     throw error;
//   }
// };


// module.exports = sendEmail;
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
    console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured properly');
    }

    // Try different port configurations in order
    const configs = [
      { host: 'smtp.gmail.com', port: 25, secure: false },   // Sometimes works on servers
      { host: 'smtp.gmail.com', port: 2587, secure: false }, // Alternative port
      { service: 'gmail' }  // Fallback to service
    ];

    for (let i = 0; i < configs.length; i++) {
      try {
        console.log(`📧 Trying config ${i + 1}:`, configs[i]);
        
        const transporter = nodemailer.createTransport({
          ...configs[i],
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          connectionTimeout: 5000,
          socketTimeout: 5000,
          greetingTimeout: 5000
        });

        const info = await transporter.sendMail({
          from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html
        });

        console.log('✅ Email sent successfully with config', i + 1);
        console.log('✅ Message ID:', info.messageId);
        return info;

      } catch (configError) {
        console.log(`❌ Config ${i + 1} failed:`, configError.code || configError.message);
        if (i === configs.length - 1) {
          throw configError; // Re-throw the last error
        }
      }
    }
    
  } catch (error) {
    console.error('❌ All email configurations failed:');
    console.error('Error message:', error.message);
    throw error;
  }
};

module.exports = sendEmail;