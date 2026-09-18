// backend/utils/sendEmail.js
// ============================================
// EMAIL UTILITY - Brevo HTTP API (not SMTP)
// SMTP port 587 is blocked on Render's free tier.
// HTTP API calls are never blocked - works 100% on Render.
//
// IMPORTANT: accepts BOTH field names for the recipient address:
//   options.email  — used by the new email calls (booking received, check-in, etc.)
//   options.to     — used by the original verifyPayment email call
// Both work identically.
// ============================================

const https = require('https');

const sendEmail = async (options) => {
  // Normalise recipient: support both options.email and options.to
  const recipient = options.email || options.to;

  if (!recipient) {
    console.error('❌ sendEmail called with no recipient (options.email and options.to are both missing)');
    return { success: false, error: 'No recipient address provided' };
  }

  try {
    const payload = JSON.stringify({
      sender: {
        name: "Catherine's Oasis",
        email: process.env.EMAIL_FROM  // Must be verified sender in Brevo
      },
      to: [{ email: recipient }],
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

    console.log(`✅ Email sent to ${recipient} | MessageID: ${result.messageId}`);
    return result;

  } catch (error) {
    console.error(`❌ Email failed to ${recipient}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Validate required env vars on startup
const missingVars = [];
if (!process.env.BREVO_API_KEY)  missingVars.push('BREVO_API_KEY');
if (!process.env.EMAIL_FROM)     missingVars.push('EMAIL_FROM');

if (missingVars.length > 0) {
  console.error(`❌ Missing email env vars: ${missingVars.join(', ')}`);
} else {
  console.log('✅ Brevo HTTP API ready');
  console.log('   Sending from:', process.env.EMAIL_FROM);
}

module.exports = sendEmail;