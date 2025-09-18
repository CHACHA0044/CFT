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
const nodemailer = require('nodemailer');

let transporter;

function createTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 993,
      secure: true, // use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password required
      },
    });

    // Verify connection at startup
    transporter.verify()
      .then(() => {
        console.log('✅ SMTP connection verified, ready to send emails');
      })
      .catch(err => {
        console.error('❌ SMTP connection failed:', err.message);
      });
  }
  return transporter;
}

const sendEmail = async (to, subject, html) => {
  try {
    console.log(`📧 Attempting to send email to: ${to} | Subject: ${subject}`);

    const result = await Promise.race([
      createTransporter().sendMail({
        from: `"Carbon Footprint Tracker" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('SMTP sendMail timeout')), 10000)
      )
    ]);

    console.log(`✅ Email sent successfully to ${to}, MessageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Email sending failed for ${to}:`, error.message);
    throw error;
  }
};


module.exports = sendEmail;
