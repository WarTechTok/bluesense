// backend/routes/gallery.js
// ============================================
// GALLERY ROUTES
// Public:  GET /api/gallery
// Admin:   GET|POST|PUT|DELETE /api/gallery/...
// ============================================

const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const {
  getAllImages,
  getAllImagesAdmin,
  uploadImage,
  updateImage,
  reorderImages,
  deleteImage,
} = require('../controllers/galleryController');

// ── Public ──────────────────────────────────
// Returns only active images, sorted by order
router.get('/', getAllImages);

// ── Admin ───────────────────────────────────
// All images including inactive
router.get('/admin', verifyToken, isAdmin, getAllImagesAdmin);

// Upload a new image (multipart: field name "image")
router.post('/', verifyToken, isAdmin, uploadSingle('image'), uploadImage);

// Batch reorder  — must come BEFORE /:id routes
router.put('/reorder', verifyToken, isAdmin, reorderImages);

// Update title / description / isActive
router.put('/:id', verifyToken, isAdmin, updateImage);

// Delete image + remove from Cloudinary
router.delete('/:id', verifyToken, isAdmin, deleteImage);

module.exports = router;