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
    console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET (length: ' + process.env.EMAIL_PASS.length + ')' : 'NOT SET');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email credentials not configured properly');
    }

    console.log('📧 Creating transporter...');
    
    // Simplified configuration - try the service approach first
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Shorter timeouts to fail faster
      connectionTimeout: 10000,
      socketTimeout: 10000,
      greetingTimeout: 5000
    });

    console.log('📧 Sending email to:', to);
    console.log('📧 Subject:', subject);
    
    // Skip verification for now and try to send directly
    const info = await transporter.sendMail({
      from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log('✅ Email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    
    return info;
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Log more details for specific error types
    if (error.code === 'EAUTH') {
      console.error('🔑 Authentication failed - check your Gmail App Password');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 DNS lookup failed - network issue');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timed out - network/firewall issue');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused - wrong host/port');
    }
    
    throw error;
  }
};

module.exports = sendEmail;