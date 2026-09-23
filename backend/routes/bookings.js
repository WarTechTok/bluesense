// backend/routes/bookings.js

const express = require('express');
const router  = express.Router();
const {
  reserveSlot,
  releaseSlot,
  confirmBooking,
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
  checkOut,
  deletePaymentProof,
  cancelBooking,
  cleanupOrphanedSales,
  verifySalesConnection,
  syncBookingsAndSales,
} = require('../controllers/bookingController');
const { verifyToken, isStaff } = require('../middleware/auth');
const { uploadPaymentProof, uploadRefundProof } = require('../middleware/upload');

// ============================================
// PUBLIC ROUTES
// ============================================

// POST /api/bookings/reserve — Step 2 Continue (no file upload needed here)
router.post('/reserve', verifyToken, reserveSlot);

// DELETE /api/bookings/reserve/:id — FIX 2: Release a Reserved slot immediately
// Called by: in-app Back button (FIX 3) and beforeunload keepalive fetch (FIX 4).
// Idempotent: returns 200 if already gone. Returns 400 if booking is not Reserved.
router.delete('/reserve/:id', verifyToken, releaseSlot);

// PATCH /api/bookings/:id/confirm — Step 4 Confirm Booking (uploads payment proof)
router.patch(
  '/:id/confirm',
  verifyToken,
  uploadPaymentProof,
  confirmBooking
);

// POST /api/bookings — legacy full-create (kept for any admin tooling)
router.post(
  '/',
  uploadPaymentProof,
  (req, res, next) => {
    console.log('📥 POST /bookings - Body keys:', Object.keys(req.body));
    console.log('📥 POST /bookings - File exists:', !!req.file);
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
router.patch('/:id/status',       verifyToken, isStaff, updateBookingStatus);
router.patch('/:id/payment',      verifyToken, isStaff, updatePaymentStatus);
router.patch('/:id/verify',       verifyToken, isStaff, verifyPayment);
router.patch('/:id/checkin',      verifyToken, isStaff, checkIn);
router.patch('/:id/checkout',     verifyToken, isStaff, checkOut);
router.patch('/:id/delete-proof', verifyToken, isStaff, deletePaymentProof);

router.delete('/:id', verifyToken, isStaff, deleteBooking);

// ============================================
// DATA SYNC
// ============================================
router.get('/admin/sync', verifyToken, isStaff, syncBookingsAndSales);

// ============================================
// CUSTOMER CANCELLATION
// ============================================
router.post('/:id/cancel', verifyToken, uploadRefundProof, cancelBooking);

module.exports = router;