// backend/test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  try {
    console.log('Testing SMTP connection...');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass length:', process.env.EMAIL_PASS?.length || 0);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from BlueSense',
      html: '<h1>Test</h1><p>If you receive this, email is working!</p>'
    });
    
    console.log('✅ Test email sent:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testEmail();