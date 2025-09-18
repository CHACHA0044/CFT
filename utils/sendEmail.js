// // utils/sendEmail.js
const nodemailer = require('nodemailer');

let transporter;

function createTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
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

    const mailOptions = {
      from: `"Carbon Footprint Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await createTransporter().sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to}, MessageId: ${result.messageId}`);
    return result;
  } catch (error) {
    console.error(`❌ Email sending failed for ${to}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;
