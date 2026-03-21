const mongoose = require('mongoose');

/**
 * Reservation Model
 * Stores guest reservation data
 * Used for: Reservation Management module - booking tracking and status updates
 */
const ReservationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, // Reference to booked room
  guestName: { type: String, required: true }, // Guest's full name
  guestEmail: { type: String, required: true }, // Guest's email for notifications
  checkIn: { type: Date, required: true }, // Check-in date/time
  checkOut: { type: Date, required: true }, // Check-out date/time
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled'], 
    default: 'Pending' // Reservation status - Pending reservations can be Confirmed by Admin
  },
  bookingDetails: { type: String }, // Special requests or additional booking information
  createdAt: { type: Date, default: Date.now } // Booking creation timestamp
});

module.exports = mongoose.model('Reservation', ReservationSchema);