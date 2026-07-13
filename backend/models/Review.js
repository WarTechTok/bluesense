// backend/models/Review.js
// ============================================
// REVIEW MODEL - Customer reviews after Completed bookings
// ============================================

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Reference to the booking (ensures only one review per booking)
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  },

  // Customer info (denormalized for display even if user is deleted)
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },

  // Booking context (for filtering)
  oasis: {
    type: String,
    enum: ['Oasis 1', 'Oasis 2'],
    required: true,
  },
  package: {
    type: String,
    required: true,
  },

  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 500,
  },

  // Media
  photos: {
    type: [
      {
        url: String,
        publicId: String,
      },
    ],
    default: [],
    validate: {
      validator: (arr) => arr.length <= 5,
      message: 'Maximum 5 photos allowed.',
    },
  },
  video: {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },

  // Anonymous toggle
  isAnonymous: {
    type: Boolean,
    default: false,
  },

  // Moderation
  status: {
    type: String,
    enum: ['approved', 'hidden'],
    default: 'approved',
  },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);