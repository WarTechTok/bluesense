// backend/utils/sendEmail.js
// ============================================
// EMAIL UTILITY - REAL Gmail sending
// ============================================

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Debug: tingnan kung may laman ang env variables
    console.log('📧 Checking email configuration:');
    console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
    console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
    console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
    console.log('EMAIL_PASS exists:', process.env.EMAIL_PASS ? '✅ YES' : '❌ NO');

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false // Para sa Gmail
      }
    });

    const mailOptions = {
      from: `"Catherine's Oasis" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.email}:`, info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error details:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Command:', error.command);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;