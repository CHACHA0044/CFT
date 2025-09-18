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

    // Use explicit SMTP settings instead of 'Gmail' service
    const transporter = nodemailer.createTransporter({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Additional options for better reliability
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5,
      connectionTimeout: 60000,
      socketTimeout: 60000,
      greetingTimeout: 30000,
      tls: {
        // Don't fail on invalid certs
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    console.log('📧 Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully');

    console.log('📧 Sending email to:', to);
    
    const info = await transporter.sendMail({
      from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      // Add some additional headers
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'X-Mailer': 'Carbon Tracker Bot'
      }
    });

    console.log('✅ Email sent successfully. Message ID:', info.messageId);
    console.log('✅ Response:', info.response);
    
    // Close the transporter
    transporter.close();
    
    return info;
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    if (error.responseCode) {
      console.error('SMTP Response Code:', error.responseCode);
    }
    console.error('Full error:', error);
    throw error;
  }
};

module.exports = sendEmail;