// backend/controllers/bookingController.js
// ============================================
// BOOKING CONTROLLER - create, read, update bookings
// ============================================

const Booking = require("../models/Booking");

// ============================================
// CREATE BOOKING - magsubmit ng reservation
// ============================================
const createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    
    res.status(201).json({
      message: "Booking submitted successfully",
      booking: newBooking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// GET ALL BOOKINGS - para sa staff/admin
// ============================================
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("confirmedBy", "name email");
      
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET BOOKING BY ID - para sa details
// ============================================
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("confirmedBy", "name email");
      
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// UPDATE BOOKING STATUS - confirm or cancel
// ============================================
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, confirmedBy } = req.body;
    
    const updateData = { status };
    if (confirmedBy) {
      updateData.confirmedBy = confirmedBy;
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    res.json({
      message: `Booking ${status}`,
      booking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// UPDATE PAYMENT STATUS - for partial payments
// ============================================
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { paymentStatus },
      { new: true }
    );
    
    res.json({
      message: `Payment ${paymentStatus}`,
      booking
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ============================================
// DELETE BOOKING - admin only (optional)
// ============================================
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking
};