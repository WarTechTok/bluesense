// backend/routes/contact.js
// ============================================
// CONTACT ROUTE - Public endpoint (no auth required)
// POST /api/contact/send
// ============================================

const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../services/emailService');

// Rate-limit state (simple in-memory: 3 submissions per IP per 15 min)
const submissionLog = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_PER_WINDOW = 3;

function rateLimit(req, res, next) {
  // x-forwarded-for can be a comma-separated list of proxies —
  // the first entry is always the original client IP.
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (forwarded ? forwarded.split(',')[0] : null)
    || req.ip
    || req.connection.remoteAddress;
  const now = Date.now();

  if (!submissionLog.has(ip)) {
    submissionLog.set(ip, []);
  }

  // Clear entries older than the window
  const times = submissionLog.get(ip).filter(t => now - t < WINDOW_MS);
  submissionLog.set(ip, times);

  if (times.length >= MAX_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'Too many messages submitted. Please wait a few minutes and try again.'
    });
  }

  times.push(now);
  next();
}

// ── POST /api/contact/send ───────────────────────────────
router.post('/send', rateLimit, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // ── Validate required fields ─────────────────────────
    const errors = [];
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('A valid email address is required.');
    }
    if (!subject || subject.trim().length < 3) {
      errors.push('Subject must be at least 3 characters.');
    }
    if (!message || message.trim().length < 10) {
      errors.push('Message must be at least 10 characters.');
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    // ── Send email ───────────────────────────────────────
    await sendContactEmail({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      phone:   phone?.trim() || 'Not provided',
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact us directly.'
    });
  }
});

module.exports = router;