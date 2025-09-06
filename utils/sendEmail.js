const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // Or use SMTP settings
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail/SMTP user
        pass: process.env.EMAIL_PASS  // Your Gmail/SMTP app password
      }
    });

    await transporter.sendMail({
      from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log('✅ Verification email sent to:', to);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;
