const mongoose = require('mongoose');

/**
 * Notification Model
 * Stores all notifications for staff members
 * Used for real-time alerts when admin assigns tasks
 */
const NotificationSchema = new mongoose.Schema({
  // Staff member who receives this notification
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },

  // User who receives this notification (linked to User model)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Type of notification
  type: {
    type: String,
    enum: ['Task Assignment', 'Task Update', 'Inspection Request', 'System Alert', 'Schedule Change'],
    default: 'Task Assignment'
  },

  // Notification title
  title: {
    type: String,
    required: true
  },

  // Detailed message
  message: {
    type: String,
    required: true
  },

  // Reference to related data (e.g., room ID, task ID)
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  // Type of related entity
  relatedType: {
    type: String,
    enum: ['Room', 'Task', 'Inspection', 'Schedule'],
    default: null
  },

  // Priority level
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false
  },

  // Read timestamp
  readAt: {
    type: Date,
    default: null
  },

  // Additional data (JSON object for flexibility)
  data: {
    type: Object,
    default: {}
  },

  // Created timestamp
  createdAt: {
    type: Date,
    default: Date.now
  },

  // Auto-delete after 30 days
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000),
    index: { expireAfterSeconds: 0 }
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
