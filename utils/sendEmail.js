// backend/utils/sendEmail.js
const axios = require("axios");

async function sendEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Carbon Tracker", // change as needed
          email: "noreply@carbontracker.com", // must be verified in Brevo
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
