// backend/services/emailService.js
// ============================================
// EMAIL SERVICE - Send verification emails
// ============================================

const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification email
const sendVerificationEmail = async (email, name, verificationToken) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"Catherine's Oasis" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Catherine\'s Oasis',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Catherine's Oasis</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome, ${name}! 👋</h2>
            <p style="color: #475569; line-height: 1.6;">Please verify your email address to complete your registration and start booking your stay at Catherine's Oasis.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="display: inline-block; padding: 12px 32px; background: #0284c7; color: white; text-decoration: none; border-radius: 40px; font-weight: 600;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">This link will expire in <strong>24 hours</strong>.</p>
            <p style="color: #64748b; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Catherine's Oasis - 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, name) => {
  const loginLink = `${process.env.FRONTEND_URL}/login`;
  
  const mailOptions = {
    from: `"Catherine's Oasis" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Catherine\'s Oasis! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Catherine's Oasis</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Welcome to Catherine's Oasis, ${name}! 🎉</h2>
            <p style="color: #475569; line-height: 1.6;">Your email has been successfully verified. You can now log in and start booking your stay!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginLink}" style="display: inline-block; padding: 12px 32px; background: #0284c7; color: white; text-decoration: none; border-radius: 40px; font-weight: 600;">
                Log In Now
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Catherine's Oasis - 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendWelcomeEmail };