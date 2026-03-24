// backend/utils/sendEmail.js
const axios = require('axios');

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'carbontracker.noreply@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Carbon Footprint Tracker';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send transactional email via Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email body
 * @param {Object} options - Additional options (replyTo, cc, bcc, attachments)
 * @returns {Promise<Object>} Brevo API response
 */
async function sendEmail(to, subject, htmlContent, options = {}) {
  const apiKey = process.env.BREVO_API_KEY;
  
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new Error(`Invalid recipient email: ${to}`);
  }

  console.log(`📧 [EMAIL] Preparing Brevo email`);
  console.log(`   → To: ${to}`);
  console.log(`   → Subject: ${subject}`);
  console.log(`   → API Key Set: ${!!apiKey}`);

  const payload = {
    sender: { 
      email: SENDER_EMAIL, 
      name: SENDER_NAME 
    },
    to: [{ email: to }],
    subject,
    htmlContent,
  };

  // Optional fields
  if (options.replyTo) {
    payload.replyTo = { email: options.replyTo };
  }
  if (options.cc && Array.isArray(options.cc)) {
    payload.cc = options.cc.map(email => ({ email }));
  }
  if (options.bcc && Array.isArray(options.bcc)) {
    payload.bcc = options.bcc.map(email => ({ email }));
  }
  if (options.attachments) {
    payload.attachment = options.attachments;
  }

  try {
    const response = await axios.post(
      BREVO_API_URL,
      payload,
      {
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey
        },
        timeout: 15000, // 15 second timeout
      }
    );

    console.log('✅ [EMAIL] Brevo send success');
    console.log(`   → Message ID: ${response.data.messageId}`);
    
    return {
      success: true,
      messageId: response.data.messageId,
      data: response.data
    };

  } catch (error) {
    // Detailed error logging
    console.error('❌ [EMAIL] Brevo send failed');
    
    if (error.response) {
      // Brevo API returned an error
      const status = error.response.status;
      const data = error.response.data;
      
      console.error(`   → Status: ${status}`);
      console.error(`   → Error:`, data);

      // Handle specific error cases
      if (status === 401) {
        throw new Error('Brevo API authentication failed. Check your BREVO_API_KEY.');
      }
      if (status === 400) {
        throw new Error(`Brevo API validation error: ${data.message || JSON.stringify(data)}`);
      }
      if (status === 402) {
        throw new Error('Brevo account issue: insufficient credits or plan limitation.');
      }
      
      throw new Error(`Brevo API error (${status}): ${data.message || JSON.stringify(data)}`);
      
    } else if (error.request) {
      // Request made but no response
      console.error('   → No response from Brevo API');
      throw new Error('No response from Brevo API. Check your internet connection.');
      
    } else {
      // Error setting up the request
      console.error(`   → Request setup error: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

/**
 * Send email with retry logic
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email body
 * @param {Object} options - Additional options
 * @param {number} retries - Number of retry attempts (default: 2)
 * @returns {Promise<Object>} Brevo API response
 */
async function sendEmailWithRetry(to, subject, htmlContent, options = {}, retries = 2) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 [EMAIL] Retry attempt ${attempt}/${retries}`);
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
      
      return await sendEmail(to, subject, htmlContent, options);
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors (401)
      if (error.message.includes('authentication failed')) {
        throw error;
      }
      
      // Don't retry on validation errors (400)
      if (error.message.includes('validation error')) {
        throw error;
      }
      
      console.warn(`⚠️ [EMAIL] Attempt ${attempt + 1} failed: ${error.message}`);
    }
  }
  
  throw lastError;
}

module.exports = sendEmail;
module.exports.sendEmailWithRetry = sendEmailWithRetry;