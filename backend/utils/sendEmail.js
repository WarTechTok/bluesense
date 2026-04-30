// backend/utils/sendEmail.js
// ============================================
// EMAIL UTILITY - Brevo SMTP
// Gmail CANNOT be used on Render (port 587 is blocked at network level)
// Brevo works reliably on Render's free and paid tiers
// ============================================

const nodemailer = require('nodemailer');

// ✅ Transporter created ONCE at startup - avoids reconnect delay on every email
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',   // Brevo's SMTP relay - works on Render
  port: 587,
  secure: false,                   // STARTTLS on 587
  auth: {
    user: process.env.BREVO_SMTP_USER,  // Format: xxxxxxx@smtp-brevo.com (from Brevo SMTP tab)
    pass: process.env.BREVO_SMTP_PASS   // The long xsmtpsib-... key from Brevo
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000
});

// Verify connection at startup - you'll see this immediately in Render logs
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ Brevo SMTP connection failed:', error.message);
    console.error('   Check BREVO_SMTP_USER and BREVO_SMTP_PASS in your Render env vars');
  } else {
    console.log('✅ Brevo SMTP ready - emails will deliver');
  }
});

const sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail({
      // ✅ CRITICAL: "from" must be a verified sender in your Brevo account
      // Brevo → Senders & IP → Senders → Add a Sender → verify it
      from: `"Catherine's Oasis" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      headers: {
        'X-Mailer': "Catherine's Oasis",
        'X-Priority': '1',
        'Importance': 'high',
        'X-Entity-Ref-ID': `${Date.now()}-${options.email}`
      }
    });

    console.log(`✅ Email sent to ${options.email} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`❌ Email failed to ${options.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;