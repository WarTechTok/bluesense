// backend/routes/reviews.js
// ============================================
// REVIEW ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, isAdmin } = require('../middleware/auth');
const {
  submitReview,
  getPublicReviews,
  checkReviewed,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/reviewController');

// Multer: memory storage, accepts photos (images) + video
const storage = multer.memoryStorage();

const mediaFilter = (req, file, cb) => {
  if (file.fieldname === 'photos') {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Photos must be image files.'), false);
  }
  if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    return cb(new Error('Video must be a video file.'), false);
  }
  cb(null, false);
};

const uploadReviewMedia = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 6 }, // 100 MB per file, max 6 (5 photos + 1 video)
  fileFilter: mediaFilter,
}).fields([
  { name: 'photos', maxCount: 5 },
  { name: 'video',  maxCount: 1 },
]);

// ============================================
// PUBLIC
// ============================================
// GET /api/reviews — home page reviews (with optional filters)
router.get('/', getPublicReviews);

// ============================================
// CUSTOMER (authenticated)
// ============================================
// POST /api/reviews — submit a review
router.post('/', verifyToken, uploadReviewMedia, submitReview);

// GET /api/reviews/check/:bookingId — check if booking already has a review
router.get('/check/:bookingId', verifyToken, checkReviewed);

// ============================================
// ADMIN
// ============================================
// GET /api/reviews/admin — all reviews
router.get('/admin', verifyToken, isAdmin, getAllReviewsAdmin);

// PATCH /api/reviews/:id/status — approve or hide
router.patch('/:id/status', verifyToken, isAdmin, updateReviewStatus);

// DELETE /api/reviews/:id — delete review
router.delete('/:id', verifyToken, isAdmin, deleteReview);

module.exports = router;