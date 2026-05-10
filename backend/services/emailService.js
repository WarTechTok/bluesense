// backend/services/emailService.js
// ============================================
// EMAIL SERVICE - Send verification emails
// ============================================

const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail');

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

// ── Send contact form message to admin ──────────────────
// Called by POST /api/contact/send (public — no auth required).
// Uses sendEmail utility (Brevo HTTP API via https.request) — the same
// method used by verification and forgot-password emails.
const sendContactEmail = async ({ name, email, phone, subject, message }) => {
  const ADMIN_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || 'admin@catherineoasis.com';

  // ── Email to admin ────────────────────────────────────
  // Visitor's email address is embedded in the HTML so admin can reply directly.
  const adminResult = await sendEmail({
    email: ADMIN_EMAIL,
    subject: `[Contact Form] ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 28px 30px;">
            <h1 style="color: white; margin: 0; font-size: 20px;">New Contact Form Message</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Catherine's Oasis</p>
          </div>
          <div style="padding: 28px 30px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569; width: 30%;">Name</td>
                <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Email</td>
                <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">
                  <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Phone</td>
                <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b;">${phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: 600; color: #475569;">Subject</td>
                <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #1e293b;">${subject}</td>
              </tr>
            </table>
          </div>
          <div style="padding: 24px 30px;">
            <p style="font-size: 13px; font-weight: 600; color: #475569; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${message}</div>
          </div>
          <div style="padding: 0 30px 28px; text-align: center;">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
               style="display: inline-block; padding: 11px 28px; background: #0284c7; color: white; text-decoration: none; border-radius: 40px; font-size: 14px; font-weight: 600;">
              Reply to ${name}
            </a>
          </div>
          <div style="padding: 16px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              Catherine's Oasis · 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  });

  // sendEmail catches its own errors and returns { success: false } instead of throwing,
  // so we check the result and throw manually so the contact route returns 500.
  if (!adminResult.success) {
    throw new Error(adminResult.error || 'Failed to send admin notification email');
  }

  // ── Auto-reply to visitor ─────────────────────────────
  // Non-fatal: a failed auto-reply is logged but does not fail the request.
  await sendEmail({
    email: email,
    subject: `We received your message — Catherine's Oasis`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Catherine's Oasis</h1>
          </div>
          <div style="padding: 32px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 12px;">Hi ${name}!</h2>
            <p style="color: #475569; line-height: 1.7; margin: 0 0 20px;">
              Thank you for reaching out. We've received your message and our team will get back to you as soon as possible — usually within <strong>24 hours</strong>.
            </p>
            <div style="background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 0 8px 8px 0; padding: 16px 18px; margin-bottom: 24px;">
              <p style="font-size: 12px; font-weight: 600; color: #0284c7; margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.05em;">Your message</p>
              <p style="font-size: 13px; font-weight: 600; color: #1e293b; margin: 0 0 8px;">${subject}</p>
              <p style="font-size: 13px; color: #475569; margin: 0; line-height: 1.6;">${message.length > 300 ? message.slice(0, 300) + '...' : message}</p>
            </div>
            <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 8px;">In the meantime, you can reach us directly:</p>
            <ul style="color: #475569; font-size: 14px; line-height: 2; padding-left: 20px; margin: 0 0 24px;">
              <li>Phone: +63 912 345 6789</li>
              <li>Email: info@catherinesoasis.com</li>
              <li>Address: 1106 Cordero Subdivision, Lambakin, Marilao, Bulacan</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 0 20px;">
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              This is an automated confirmation. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendContactEmail };