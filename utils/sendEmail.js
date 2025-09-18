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

    // Try multiple Gmail configurations with different approaches
    const configs = [
      // Config 1: Use aspmx.l.google.com (Gmail's MX server)
      {
        host: 'aspmx.l.google.com',
        port: 25,
        secure: false,
        requireTLS: false,
        tls: { rejectUnauthorized: false }
      },
      // Config 2: Direct IP approach (Google's SMTP IP)
      {
        host: '74.125.133.109', // One of Gmail's SMTP IPs
        port: 25,
        secure: false,
        requireTLS: false,
        tls: { rejectUnauthorized: false }
      },
      // Config 3: Try port 2525 (sometimes less filtered)
      {
        host: 'smtp.gmail.com',
        port: 2525,
        secure: false,
        tls: { rejectUnauthorized: false }
      },
      // Config 4: Original approach as fallback
      {
        service: 'gmail'
      }
    ];

    for (let i = 0; i < configs.length; i++) {
      try {
        console.log(`📧 Trying config ${i + 1}:`, configs[i].host || 'gmail service');
        
        const transporter = nodemailer.createTransport({
          ...configs[i],
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          connectionTimeout: 3000, // Very short timeout
          socketTimeout: 3000,
          greetingTimeout: 3000,
          // Ignore certificate errors
          tls: {
            rejectUnauthorized: false,
            ...configs[i].tls
          }
        });

        const info = await transporter.sendMail({
          from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html
        });

        console.log(`✅ Email sent successfully with config ${i + 1}`);
        console.log('✅ Message ID:', info.messageId);
        return info;

      } catch (configError) {
        console.log(`❌ Config ${i + 1} failed:`, configError.code || configError.message);
        if (i === configs.length - 1) {
          throw configError;
        }
        // Wait a bit before trying next config
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
  } catch (error) {
    console.error('❌ All Gmail configurations failed:');
    console.error('Error message:', error.message);
    throw error;
  }
};

module.exports = sendEmail;