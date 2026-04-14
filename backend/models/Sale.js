const mongoose = require('mongoose');

/**
 * Sale Model
 * Records all financial transactions from room reservations and event bookings
 * Used for: Sales Tracking module - revenue tracking and financial reporting
 * Created when a reservation or booking is confirmed
 */
const SaleSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }, // Link to reservation (legacy)
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }, // Link to event booking
  amount: { type: Number, required: true }, // Sale amount (room price or total booking amount)
  date: { type: Date, default: Date.now } // Transaction date/time
});

module.exports = mongoose.model('Sale', SaleSchema);