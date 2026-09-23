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
    type: String  // optional
  },
  customerEmail: {
    type: String,
    required: true
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
  
  // Special requests & add-ons
  specialRequests: {
    type: String,
    default: ""
  },
  addons: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Payment
  downpayment: {
    type: Number,
    // NOTE: Not required at the top level because "Reserved" bookings are created
    // before the customer reaches the payment step. The confirmBooking controller
    // validates this before upgrading to "Pending".
  },
  totalAmount: {
    type: Number,
    // Same as above — not required here; validated on confirm.
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "GCash", "Maya", "GoTyme", "SeaBank"],
    // Not required at model level — Reserved bookings don't have payment yet.
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
  // "Reserved" = internal placeholder, hidden from admin, auto-created on Step 2 Continue.
  //              Expires after 30 minutes (enforced by cron + reservedUntil field).
  //              Graduates to "Pending" when customer clicks Confirm Booking on Step 4.
  // All other statuses = real bookings visible to admin.
  status: {
    type: String,
    enum: ["Reserved", "Pending", "Confirmed", "Checked-in", "Cancelled", "Completed"],
    default: "Pending"
  },

  // ============================================
  // RESERVATION EXPIRY (for "Reserved" status only)
  // ============================================
  // Set to now + 30 minutes when a Reserved booking is created.
  // The cron job in bookingController.js deletes expired Reserved bookings.
  // Null for all other statuses.
  reservedUntil: {
    type: Date,
    default: null
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
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  checkedInAt: {
    type: Date,
    default: null
  },
  checkedOutBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  checkedOutAt: {
    type: Date,
    default: null
  },
  
  // ============================================
  // CANCELLATION & REFUND FIELDS
  // ============================================
  
  cancellationReason: {
    type: String,
    enum: ['user_cancelled', 'emergency', 'admin_cancelled'],
    default: null
  },
  cancellationNote: {
    type: String,
    default: ''
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: String,
    default: null
  },
  
  refundRequested: {
    type: Boolean,
    default: false
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  refundReason: {
    type: String,
    default: ''
  },
  refundProof: {
    type: String,
    default: null
  },
  refundReviewedAt: {
    type: Date,
    default: null
  },
  refundReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  refundAdminNotes: {
    type: String,
    default: ''
  }
  
}, { timestamps: true });

// ============================================
// PREVENT DOUBLE BOOKING - Compound Index
// ============================================
// IMPORTANT: "Reserved" is included in the blocking set alongside "Pending" and
// "Confirmed". This is what makes the slot-hold mechanism work atomically —
// a second customer who clicks Continue on the same date/oasis/package/session
// will hit a duplicate-key error (409) because the first customer's Reserved
// booking already occupies the unique index slot.
//
// "Cancelled" and "Completed" are still excluded so those slots can be re-booked.
// "Checked-in" is excluded for the same legacy reason as before.
bookingSchema.index(
  { bookingDate: 1, session: 1, oasis: 1, package: 1 },
  { 
    unique: true,
    partialFilterExpression: {
      status: { $nin: ['Cancelled', 'Completed', 'Checked-in'] }
    },
    name: "no_double_booking"
  }
);

module.exports = mongoose.model("Booking", bookingSchema);