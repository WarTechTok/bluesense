// backend/utils/sendEmail.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `"Catherine's Oasis" <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Email sent to ${options.email}: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error(`❌ Email failed to ${options.email}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;