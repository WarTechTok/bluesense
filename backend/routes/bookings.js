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
  verifyPayment,
  deletePaymentProof,
  cancelBooking,
  cleanupOrphanedSales,
  verifySalesConnection,
  syncBookingsAndSales
} = require("../controllers/bookingController");
const { verifyToken, isStaff } = require("../middleware/auth");

// ============================================
// MULTER FILE UPLOAD CONFIGURATION
// ============================================

// Payment Proof Upload
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

// Refund Proof Upload
const refundProofDir = path.join(__dirname, '../uploads/refund-proofs');
if (!fs.existsSync(refundProofDir)) {
  fs.mkdirSync(refundProofDir, { recursive: true });
}

const refundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, refundProofDir);
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

const refundUpload = multer({
  storage: refundStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// ============================================
// PUBLIC ROUTES - no login required
// ============================================

// POST /api/bookings - magsubmit ng booking (customer) - with optional file upload
router.post("/", upload.single('paymentProof'), (req, res, next) => {
  console.log('📥 POST /bookings - Body:', Object.keys(req.body));
  console.log('📥 POST /bookings - File exists:', !!req.file);
  if (req.file) {
    console.log('📥 File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });
  } else {
    console.log('⚠️ No file received - multer did not process any file');
  }
  next();
}, createBooking);

// GET /api/bookings/booked-dates - kunin ang booked dates with sessions (public)
router.get("/booked-dates", getBookedDatesWithSessions);

// GET /api/bookings/customer/:email - tingnan ang bookings ng customer (no login)
router.get("/customer/:email", getBookingsByCustomerEmail);

// ============================================
// PROTECTED ROUTES - staff/admin only
// ============================================

// GET /api/bookings - kunin lahat ng bookings (staff only)
// ⚠️ MUST be before /:id route or Express will treat "" as an ID
router.get("/", verifyToken, isStaff, getAllBookings);

// GET /api/bookings/:id - tingnan ang booking details (may ID lang)
router.get("/:id", getBookingById);

// PATCH /api/bookings/:id/status - i-update ang status (confirm/cancel)
router.patch("/:id/status", verifyToken, isStaff, updateBookingStatus);

// PATCH /api/bookings/:id/payment - i-update ang payment status
router.patch("/:id/payment", verifyToken, isStaff, updatePaymentStatus);

// PATCH /api/bookings/:id/verify - verify payment and confirm booking
router.patch("/:id/verify", verifyToken, isStaff, verifyPayment);

// PATCH /api/bookings/:id/delete-proof - delete payment proof after verification
router.patch("/:id/delete-proof", verifyToken, isStaff, deletePaymentProof);

// DELETE /api/bookings/:id - magdelete (admin only)
router.delete("/:id", verifyToken, isStaff, deleteBooking);

// ============================================
// DATA SYNC ENDPOINTS - ensure data integrity
// ============================================
// GET /api/bookings/admin/sync - sync bookings & sales (admin only)
router.get("/admin/sync", verifyToken, isStaff, syncBookingsAndSales);

// ============================================
// CUSTOMER CANCELLATION ROUTE (with file upload)
// ============================================
router.post("/:id/cancel", verifyToken, refundUpload.single('proof'), cancelBooking);

// ============================================
// DEBUG ENDPOINT - Check payment proof file
// ============================================
router.get("/debug/payment-proofs/list", verifyToken, isStaff, (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const paymentProofDir = path.join(__dirname, '../uploads/payment-proofs');
    
    if (!fs.existsSync(paymentProofDir)) {
      return res.json({
        success: false,
        message: 'Payment proofs directory does not exist',
        path: paymentProofDir
      });
    }
    
    const files = fs.readdirSync(paymentProofDir);
    res.json({
      success: true,
      message: `Found ${files.length} payment proof files`,
      path: paymentProofDir,
      files: files.slice(0, 20) // Show first 20 files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;