// backend/routes/bookings.js
// ============================================
// BOOKING ROUTES - endpoints for reservations
// ============================================

const express = require("express");
const router = express.Router();
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking
} = require("../controllers/bookingController");
const { verifyToken, isStaff } = require("../middleware/auth");

// ============================================
// PUBLIC ROUTES - no login required
// ============================================

// POST /api/bookings - magsubmit ng booking (customer)
router.post("/", createBooking);

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

// DELETE /api/bookings/:id - magdelete (admin only)
router.delete("/:id", verifyToken, isStaff, deleteBooking);

module.exports = router;