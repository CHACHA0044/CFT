// // const nodemailer = require('nodemailer');

// // const sendEmail = async (to, subject, html) => {
// //   try {
// //     const transporter = nodemailer.createTransport({
// //       service: 'Gmail', // Or use SMTP settings
// //       auth: {
// //         user: process.env.EMAIL_USER, // Your Gmail/SMTP user
// //         pass: process.env.EMAIL_PASS  // Your Gmail/SMTP app password
// //       }
// //     });

// //     await transporter.sendMail({
// //       from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
// //       to,
// //       subject,
// //       html
// //     });

// //     console.log('✅ Verification email sent to:', to);
// //   } catch (error) {
// //     console.error('❌ Email sending failed:', error);
// //     throw error;
// //   }
// // };

// // module.exports = sendEmail;
// // // utils/sendEmail.js
// // const nodemailer = require('nodemailer');

// // let transporter;

// // function createTransporter() {
// //   if (!transporter) {
// //     transporter = nodemailer.createTransport({
// //       host: 'smtp.gmail.com',
// //       port: 465,
// //       secure: true, // use TLS
// //       auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS, // Gmail App Password required
// //       },
// //     });

// //     // Verify connection at startup
// //     transporter.verify()
// //       .then(() => {
// //         console.log('✅ SMTP connection verified, ready to send emails');
// //       })
// //       .catch(err => {
// //         console.error('❌ SMTP connection failed:', err.message);
// //       });
// //   }
// //   return transporter;
// // }

// // const sendEmail = async (to, subject, html) => {
// //   try {
// //     console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);

// //     const result = await Promise.race([
// //       createTransporter().sendMail({
// //         from: `"Carbon Footprint Tracker" <${process.env.EMAIL_USER}>`,
// //         to,
// //         subject,
// //         html,
// //       }),
// //       new Promise((_, reject) =>
// //         setTimeout(() => reject(new Error('SMTP sendMail timeout')), 10000)
// //       )
// //     ]);

// //     console.log(`✅ Email sent successfully to ${to}, MessageId: ${result.messageId}`);
// //     return result;
// //   } catch (error) {
// //     console.error(`❌ Email sending failed for ${to}:`, error.message);
// //     throw error;
// //   }
// // };


// // module.exports = sendEmail;
// const nodemailer = require("nodemailer");

// const sendEmail = async (to, subject, html) => {
//   try {
//     console.log("📧 EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "NOT SET");
//     console.log("📧 EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");

//     if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//       throw new Error("Email credentials not configured properly");
//     }

//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,   // smtp-relay.brevo.com
//       port: process.env.EMAIL_PORT,   // 587
//       secure: false,                  // Brevo works on TLS (not SSL)
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const info = await transporter.sendMail({
//       from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("✅ Email sent:", info.messageId);
//     return info;

//   } catch (error) {
//     console.error("❌ Email send failed:", error.message);
//     throw error;
//   }
// };

// module.exports = sendEmail;
// utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.BREVO_USER || !process.env.BREVO_PASS) {
      throw new Error("Brevo SMTP credentials not set");
    }

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: process.env.BREVO_PORT,
  secure: false, 
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});


    const info = await transporter.sendMail({
      from: `"Carbon Tracker" <noreply@carbontracker.com>`,
      to,
      subject,
      html,
      replyTo: process.env.IMAP_USER, // replies go to your normal inbox
    });

    console.log("✅ Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
