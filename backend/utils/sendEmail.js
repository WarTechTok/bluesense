// backend/utils/sendEmail.js
// ============================================
// EMAIL UTILITY - Brevo SMTP (optimized)
// ============================================

const nodemailer = require('nodemailer');

// ✅ Create transporter ONCE at startup (not on every email call)
// This avoids the ~100s connection handshake delay per request
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // ✅ Keep connection alive - avoids reconnect overhead on each email
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  // ✅ Faster TLS handshake
  tls: {
    rejectUnauthorized: false
  },
  // ✅ Shorter timeout so failures don't hang the process
  connectionTimeout: 10000,  // 10s to connect
  greetingTimeout: 10000,    // 10s for SMTP greeting
  socketTimeout: 15000       // 15s per socket operation
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      // ✅ Use a real sender name + verified Brevo sender address
      // The "from" display name can be anything, but the address must match
      // your verified sender in Brevo dashboard
      from: `"Catherine's Oasis" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      // ✅ These headers significantly improve inbox delivery (reduce spam score)
      headers: {
        // Tells mail clients this is a transactional email, not bulk
        'X-Mailer': "Catherine's Oasis Mailer",
        // Priority hint - transactional emails should be high priority
        'X-Priority': '1',
        'Importance': 'high',
        // Helps with threading in Gmail
        'X-Entity-Ref-ID': `${Date.now()}-${options.email}`
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`❌ Email failed to ${options.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;