const Reservation = require('../models/Reservation');
const Sale = require('../models/Sale');
const Room = require('../models/Room');

/**
 * Reservation Controller
 * Handles booking management, confirmation, and cancellation
 * Endpoints: GET, POST, PUT, DELETE reservations
 */

/**
 * GET /api/admin/reservations
 * Get all reservations with room details
 */
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('room');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/reservations/:id
 * Get a specific reservation by ID with room details
 */
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('room');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/reservations
 * Create a new reservation (initially in Pending status)
 */
exports.createReservation = async (req, res) => {
  try {
    const { room, guestName, guestEmail, checkIn, checkOut, bookingDetails } = req.body;
    const reservation = new Reservation({
      room,
      guestName,
      guestEmail,
      checkIn,
      checkOut,
      bookingDetails,
      status: 'Pending'
    });
    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/reservations/:id
 * Update reservation details (Admin only)
 */
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/reservations/:id/confirm
 * Confirm a pending reservation and create a sale record (Admin only)
 * This changes status from Pending to Confirmed and generates revenue tracking
 */
exports.confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('room');
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    // Update reservation status
    reservation.status = 'Confirmed';
    await reservation.save();

    // Create sale record for revenue tracking
    const sale = new Sale({
      reservation: reservation._id,
      amount: reservation.room.price
    });
    await sale.save();

    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/reservations/:id/cancel
 * Cancel a reservation (Admin only)
 * Changes status to Cancelled
 */
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

    reservation.status = 'Cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/reservations/:id
 * Delete a reservation (Admin only)
 */
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: 'Reservation not found' });
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
