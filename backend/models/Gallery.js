// backend/models/Gallery.js
// ============================================
// GALLERY IMAGE MODEL
// ============================================

const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
    default: '',
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publicId: {
    type: String, // Cloudinary public_id for deletion
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Sort by order ascending by default
GallerySchema.index({ order: 1 });

module.exports = mongoose.model('Gallery', GallerySchema);