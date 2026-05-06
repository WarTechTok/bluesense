// backend/routes/notifications.js
// ============================================
// NOTIFICATIONS ROUTES - Handle sending notifications
// ============================================

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { sendEmail } = require('../services/emailService');
const Notification = require('../models/Notification');

// ============================================
// SEND NOTIFICATION (Admin only)
// ============================================
router.post('/send', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId, email, subject, message, type } = req.body;

    if (!userId || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save notification to database
    const notification = new Notification({
      userId,
      subject,
      message,
      type: type || 'general',
      isRead: false
    });

    await notification.save();

    // Send email notification
    try {
      await sendEmail({
        to: email,
        subject: subject,
        html: `
          <h2>${subject}</h2>
          <p>${message}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated notification from Bluesense Resort Management System.</p>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails - notification is saved in DB
    }

    return res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      notification
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({ error: 'Error sending notification' });
  }
});

// ============================================
// GET NOTIFICATIONS FOR USER
// ============================================
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
router.put('/:notificationId/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ error: 'Error updating notification' });
  }
});

module.exports = router;
