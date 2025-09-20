// backend/utils/sendEmail.js
const SibApiV3Sdk = require('@getbrevo/brevo');
const axios = require('axios');

const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'carbontracker.noreply@gmail.com';
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Carbon Footprint Tracker';

function getApiKey() {
  return process.env.BREVO_API_KEY || null;
}

// Configure brevo SDK client
function createBrevoClient() {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Brevo API key not configured (BREVO_API_KEY).');

 // const defaultClient = Brevo.ApiClient.instance;
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKeyAuth = defaultClient.authentications['api-key'];
  apiKeyAuth.apiKey = apiKey;

  return {
    transactionalApi: new Brevo.TransactionalEmailsApi(),
    SendSmtpEmail: Brevo.SendSmtpEmail,
  };
}

async function sendEmail(to, subject, htmlContent, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Brevo API key not set (env BREVO_API_KEY).');
  }

  console.log('📧 Preparing Brevo email -> to:', to, 'subject:', subject, 'brevo_key_set:', !!apiKey);

  // Use SDK
  try {
    const { transactionalApi, SendSmtpEmail } = createBrevoClient();

    const payload = new SendSmtpEmail({
      sender: { email: SENDER_EMAIL, name: SENDER_NAME },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    if (options.replyTo) payload.replyTo = { email: options.replyTo };
    if (options.cc) payload.cc = options.cc;
    if (options.bcc) payload.bcc = options.bcc;

    const resp = await transactionalApi.sendTransacEmail(payload);
    console.log('✅ Brevo SDK send success:', resp);
    return resp;
  } catch (sdkErr) {
    // If SDK fails due to authentication, bubble up useful info and try axios fallback
    console.error('⚠️ Brevo SDK send failed:', sdkErr.response?.data || sdkErr.message || sdkErr);

    // If error clearly unauthorized, fail fast
    if (sdkErr.response?.status === 401 || (sdkErr.response?.data && sdkErr.response.data.code === 'unauthorized')) {
      throw new Error('Brevo API unauthorized: check BREVO_API_KEY (make sure it starts with xkeysib-) and that it is active.');
    }

    // Fallback to axios POST
    try {
      const axiosResp = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { email: SENDER_EMAIL, name: SENDER_NAME },
          to: [{ email: to }],
          subject,
          htmlContent,
          replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        },
        {
          headers: {
            'api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log('✅ Brevo axios send success:', axiosResp.data);
      return axiosResp.data;
    } catch (axErr) {
      console.error('❌ Brevo axios send failed:', axErr.response?.data || axErr.message);
      // If unauthorized from axios, provide explicit guidance
      if (axErr.response?.status === 401 || (axErr.response?.data && axErr.response.data.code === 'unauthorized')) {
        throw new Error('Brevo API unauthorized (axios): check BREVO_API_KEY environment variable and the key value.');
      }
      throw axErr;
    }
  }
}

module.exports = sendEmail;
