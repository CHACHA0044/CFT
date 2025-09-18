// backend/utils/sendEmail.js
const axios = require("axios");

async function sendEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { 
          email: process.env.BREVO_SENDER_EMAIL || "carbontracker.noreply@gmail.com", 
          name: process.env.BREVO_SENDER_NAME || "Carbon Footprint Tracker" 
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
      }
    );

    console.log(`✅ Email sent to ${to}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Failed to send email to ${to}:`,
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = sendEmail;
