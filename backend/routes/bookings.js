// backend/routes/bookings.js
// ============================================
// BOOKING ROUTES (Cloudinary version)
// Payment proofs and refund proofs go to Cloudinary,
// NOT local disk. No more ephemeral storage issues.
// ============================================

const express = require('express');
const router  = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByCustomerEmail,
  updateBooking,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  getBookedDatesWithSessions,
  verifyPayment,
  checkIn,
  deletePaymentProof,
  cancelBooking,
  cleanupOrphanedSales,
  verifySalesConnection,
  syncBookingsAndSales,
} = require('../controllers/bookingController');
const { verifyToken, isStaff } = require('../middleware/auth');
const { uploadPaymentProof, uploadRefundProof } = require('../middleware/upload');

// ============================================
// PUBLIC ROUTES — no login required
// ============================================

// POST /api/bookings — create booking with optional payment proof
router.post(
  '/',
  uploadPaymentProof, // multer memoryStorage, field name: 'paymentProof'
  (req, res, next) => {
    console.log('📥 POST /bookings - Body keys:', Object.keys(req.body));
    console.log('📥 POST /bookings - File exists:', !!req.file);
    if (req.file) {
      console.log('📥 File details:', {
        originalname: req.file.originalname,
        size:         req.file.size,
        mimetype:     req.file.mimetype,
      });
    }
    next();
  },
  createBooking
);

// GET /api/bookings/booked-dates
router.get('/booked-dates', getBookedDatesWithSessions);

// GET /api/bookings/customer/:email
router.get('/customer/:email', getBookingsByCustomerEmail);

// ============================================
// PROTECTED ROUTES — staff/admin only
// ============================================

router.get('/',    verifyToken, isStaff, getAllBookings);
router.get('/:id', getBookingById);

router.put('/:id', verifyToken, isStaff, updateBooking);
router.patch('/:id/status',  verifyToken, isStaff, updateBookingStatus);
router.patch('/:id/payment', verifyToken, isStaff, updatePaymentStatus);
router.patch('/:id/verify',  verifyToken, isStaff, verifyPayment);
router.patch('/:id/checkin', verifyToken, isStaff, checkIn);
router.patch('/:id/delete-proof', verifyToken, isStaff, deletePaymentProof);

router.delete('/:id', verifyToken, isStaff, deleteBooking);

// ============================================
// DATA SYNC
// ============================================
router.get('/admin/sync', verifyToken, isStaff, syncBookingsAndSales);

// ============================================
// CUSTOMER CANCELLATION — with optional refund proof
// ============================================
router.post(
  '/:id/cancel',
  verifyToken,
  uploadRefundProof, // multer memoryStorage, field name: 'proof'
  cancelBooking
);

module.exports = router;