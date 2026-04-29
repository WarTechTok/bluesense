const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  // ✅ FORCE IPv4 - fixes ENETUNREACH error
  family: 4
});

// Verify transporter
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready');
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Catherine's Oasis" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      headers: {
        'X-Priority': '1',
        'Importance': 'high'
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