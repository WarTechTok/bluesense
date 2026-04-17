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
  session: {
    type: String,
    enum: ['Day', 'Night', '22hrs'],
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
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "GCash", "Maya", "GoTyme", "SeaBank"],
    required: true
  },
  paymentType: {
    type: String,
    enum: ["downpayment", "fullpayment"],
    default: "downpayment"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Partial", "Rejected"],
    default: "Pending"
  },
  paymentProof: {
    type: String,  // URL or file path
    default: null
  },
  
  // Booking reference (like 6879D0)
  bookingReference: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Sequential booking number (1, 2, 3, 4, 5...)
  bookingNumber: {
    type: Number,
    unique: true,
    sparse: true
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
  },
  paymentVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  paymentVerifiedAt: {
    type: Date,
    default: null
  }
  
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);