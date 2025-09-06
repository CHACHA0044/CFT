const nodemailer = require('nodemailer');

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
// ✅ FIXED CODE
const sendEmail = async (to, subject, html, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: `"Carbon Tracker" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });

      console.log(`✅ Email sent successfully to: ${to} (attempt ${attempt})`);
      return { success: true, attempt };
      
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw new Error(`Failed to send email after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

module.exports = sendEmail;
