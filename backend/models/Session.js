// backend/models/Session.js
// ============================================
// SESSION MODEL - Dynamic session time management
// ============================================

const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Day', 'Night', '22hrs'],
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    description: 'Format: HH:MM (24-hour)'
  },
  endTime: {
    type: String,
    required: true,
    description: 'Format: HH:MM (24-hour)'
  },
  description: {
    type: String,
    default: ''
  },
  downpaymentAmount: {
    type: Number,
    required: true,
    default: 3000
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);