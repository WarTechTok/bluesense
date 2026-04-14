// backend/routes/bookings.js
// ============================================
// BOOKING ROUTES - endpoints for reservations
// ============================================

const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByCustomerEmail,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  getBookedDatesWithSessions,
  verifyPayment
} = require("../controllers/bookingController");
const { verifyToken, isStaff } = require("../middleware/auth");

// ============================================
// MULTER FILE UPLOAD CONFIGURATION
// ============================================
const paymentProofDir = path.join(__dirname, '../uploads/payment-proofs');
if (!fs.existsSync(paymentProofDir)) {
  fs.mkdirSync(paymentProofDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, paymentProofDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ============================================
// PUBLIC ROUTES - no login required
// ============================================

// POST /api/bookings - magsubmit ng booking (customer) - with optional file upload
router.post("/", upload.single('paymentProof'), (req, res, next) => {
  console.log('📥 POST /bookings - Body:', req.body);
  console.log('📥 POST /bookings - File:', req.file);
  next();
}, createBooking);

// GET /api/bookings/booked-dates - kunin ang booked dates with sessions (public)
router.get("/booked-dates", getBookedDatesWithSessions);

// GET /api/bookings/customer/:email - tingnan ang bookings ng customer (no login)
router.get("/customer/:email", getBookingsByCustomerEmail);

// GET /api/bookings/:id - tingnan ang booking details (may ID lang)
router.get("/:id", getBookingById);

// ============================================
// PROTECTED ROUTES - staff/admin only
// ============================================

// GET /api/bookings - kunin lahat ng bookings (staff only)
router.get("/", verifyToken, isStaff, getAllBookings);

// PATCH /api/bookings/:id/status - i-update ang status (confirm/cancel)
router.patch("/:id/status", verifyToken, isStaff, updateBookingStatus);

// PATCH /api/bookings/:id/payment - i-update ang payment status
router.patch("/:id/payment", verifyToken, isStaff, updatePaymentStatus);

// PATCH /api/bookings/:id/verify - verify payment and confirm booking
router.patch("/:id/verify", verifyToken, isStaff, verifyPayment);

// DELETE /api/bookings/:id - magdelete (admin only)
router.delete("/:id", verifyToken, isStaff, deleteBooking);

module.exports = router;