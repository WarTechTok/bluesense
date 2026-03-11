// backend/models/Booking.js
// ============================================
// BOOKING MODEL - para sa online reservations
// ============================================

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // Customer details
  customerName: {
    type: String,
    required: true
  },
  customerContact: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String  // optional
  },
  
  // Booking details
  oasis: {
    type: String,
    enum: ["Oasis 1", "Oasis 2"],
    required: true
  },
  package: {
    type: String,
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  pax: {
    type: Number,
    required: true
  },
  
  // Payment
  downpayment: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["GCash", "Maya", "GoTyme", "SeaBank", "Cash"],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Partial"],
    default: "Pending"
  },
  
  // Status
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
    default: "Pending"
  },
  
  // Staff who confirmed (if any)
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);