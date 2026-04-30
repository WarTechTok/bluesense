// backend/utils/sendEmail.js
// ============================================
// EMAIL UTILITY - Brevo HTTP API (not SMTP)
// SMTP port 587 is blocked on Render's free tier.
// HTTP API calls are never blocked - works 100% on Render.
// ============================================

const https = require('https');

const sendEmail = async (options) => {
  try {
    const payload = JSON.stringify({
      sender: {
        name: "Catherine's Oasis",
        email: process.env.EMAIL_FROM  // Must be verified sender in Brevo
      },
      to: [{ email: options.email }],
      subject: options.subject,
      htmlContent: options.html
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, messageId: JSON.parse(data).messageId });
          } else {
            reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    console.log(`✅ Email sent to ${options.email} | MessageID: ${result.messageId}`);
    return result;

  } catch (error) {
    console.error(`❌ Email failed to ${options.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Test API key on startup
const testKey = process.env.BREVO_API_KEY;
if (!testKey) {
  console.error('❌ BREVO_API_KEY is not set in environment variables');
} else {
  console.log('✅ Brevo HTTP API ready - SMTP ports bypassed');
  console.log('   Sending from:', process.env.EMAIL_FROM);
}

module.exports = sendEmail;