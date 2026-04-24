// backend/models/AddOn.js
// ============================================
// ADD-ON MODEL - Dynamic add-on management
// ============================================

const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // Which sessions this add-on is available for
  availableForSessions: [{
    type: String,
    enum: ['Day', 'Night', '22hrs', 'All'],
    default: 'All'
  }],
  // Which packages this add-on is available for (empty = all)
  availableForPackages: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AddOn', addOnSchema);