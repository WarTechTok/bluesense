const mongoose = require('mongoose');

/**
 * Sale Model
 * Records all financial transactions from room reservations
 * Used for: Sales Tracking module - revenue tracking and financial reporting
 * Created when a reservation is confirmed
 */
const SaleSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }, // Link to the reservation that generated the sale
  amount: { type: Number, required: true }, // Sale amount in USD (typically room price)
  date: { type: Date, default: Date.now } // Transaction date/time
});

module.exports = mongoose.model('Sale', SaleSchema);