// backend/controllers/reviewController.js
// ============================================
// REVIEW CONTROLLER
// ============================================

const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const REVIEW_FOLDER = 'bluesense/reviews';

// ============================================
// SUBMIT REVIEW (customer)
// POST /api/reviews
// Auth: verifyToken
// Body: multipart/form-data
// ============================================
const submitReview = async (req, res) => {
  try {
    const { bookingId, rating, text, isAnonymous } = req.body;

    if (!bookingId || !rating || !text) {
      return res.status(400).json({ success: false, message: 'bookingId, rating, and text are required.' });
    }

    // Validate booking exists and belongs to this customer
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only the customer who made the booking can review it
    if (booking.customerEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: 'You can only review your own bookings.' });
    }

    // Only Completed bookings
    if (booking.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Only completed bookings can be reviewed.' });
    }

    // One review per booking
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking.' });
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1–5.' });
    }

    // Validate text length
    if (text.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Review text must be at least 10 characters.' });
    }
    if (text.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Review text must not exceed 500 characters.' });
    }

    // Upload photos (field name: "photos", max 5)
    const photoFiles = req.files?.photos || [];
    if (photoFiles.length > 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 photos allowed.' });
    }

    const uploadedPhotos = [];
    for (const file of photoFiles) {
      const result = await uploadToCloudinary(file.buffer, `${REVIEW_FOLDER}/photos`, {
        transformation: [{ width: 1600, height: 1200, crop: 'limit', quality: 'auto:good' }],
      });
      uploadedPhotos.push({ url: result.url, publicId: result.publicId });
    }

    // Upload video (field name: "video", max 1)
    let uploadedVideo = { url: null, publicId: null };
    const videoFile = req.files?.video?.[0];
    if (videoFile) {
      const result = await uploadToCloudinary(videoFile.buffer, `${REVIEW_FOLDER}/videos`, {
        resource_type: 'video',
      });
      uploadedVideo = { url: result.url, publicId: result.publicId };
    }

    const review = await Review.create({
      booking: bookingId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      oasis: booking.oasis,
      package: booking.package,
      rating: ratingNum,
      text: text.trim(),
      photos: uploadedPhotos,
      video: uploadedVideo,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
    });

    console.log(`✅ Review submitted for booking ${booking.bookingReference}`);
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('❌ Submit review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET PUBLIC REVIEWS (home page)
// GET /api/reviews
// Query: ?rating=5&oasis=Oasis 1&package=Package 1&media=true&page=1&limit=20
// ============================================
const getPublicReviews = async (req, res) => {
  try {
    const { rating, oasis, package: pkg, media } = req.query;

    const filter = { status: 'approved' };

    if (rating) filter.rating = parseInt(rating);
    if (oasis) filter.oasis = oasis;
    if (pkg) filter.package = pkg;
    if (media === 'true') {
      filter.$or = [
        { 'photos.0': { $exists: true } },
        { 'video.url': { $ne: null } },
      ];
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    // Calculate average rating from all approved reviews (not filtered)
    const allApproved = await Review.find({ status: 'approved' });
    const avgRating =
      allApproved.length > 0
        ? (allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length).toFixed(1)
        : '0.0';

    // Build rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allApproved.forEach((r) => distribution[r.rating]++);

    res.json({
      success: true,
      reviews,
      total: reviews.length,
      averageRating: parseFloat(avgRating),
      totalReviews: allApproved.length,
      distribution,
    });
  } catch (error) {
    console.error('❌ Get reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// CHECK IF BOOKING IS ALREADY REVIEWED
// GET /api/reviews/check/:bookingId
// Auth: verifyToken
// ============================================
const checkReviewed = async (req, res) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId });
    res.json({ success: true, reviewed: !!review, review: review || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// GET ALL REVIEWS (admin)
// GET /api/reviews/admin
// Auth: verifyToken + isAdmin
// ============================================
const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('booking', 'bookingReference bookingNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews, total: reviews.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// TOGGLE REVIEW STATUS (admin: approve / hide)
// PATCH /api/reviews/:id/status
// Auth: verifyToken + isAdmin
// Body: { status: 'approved' | 'hidden' }
// ============================================
const updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'hidden'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'approved' or 'hidden'." });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// DELETE REVIEW (admin)
// DELETE /api/reviews/:id
// Auth: verifyToken + isAdmin
// ============================================
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    // Cleanup Cloudinary assets
    for (const photo of review.photos) {
      await deleteFromCloudinary(photo.publicId);
    }
    if (review.video?.publicId) {
      await deleteFromCloudinary(review.video.publicId);
    }

    await review.deleteOne();
    console.log(`🗑️ Review ${review._id} deleted by admin`);
    res.json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  submitReview,
  getPublicReviews,
  checkReviewed,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
};