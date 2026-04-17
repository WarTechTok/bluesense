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
 * Validation: guestName and guestEmail required, checkOut must be after checkIn
 */
exports.createReservation = async (req, res) => {
  try {
    const { room, guestName, guestEmail, checkIn, checkOut, bookingDetails } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (!guestName || guestName.trim() === '') {
      return res.status(400).json({ error: 'Guest Name is required' });
    }
    if (guestName.trim().length < 2) {
      return res.status(400).json({ error: 'Guest Name must be at least 2 characters' });
    }

    if (!guestEmail || guestEmail.trim() === '') {
      return res.status(400).json({ error: 'Guest Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      return res.status(400).json({ error: 'Guest Email must be valid' });
    }

    if (!checkIn) {
      return res.status(400).json({ error: 'Check-In date is required' });
    }

    if (!checkOut) {
      return res.status(400).json({ error: 'Check-Out date is required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Check-Out date must be after Check-In date' });
    }

    const reservation = new Reservation({
      room,
      guestName: guestName.trim(),
      guestEmail: guestEmail.trim(),
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
 * Validation: guestEmail must be valid, checkOut must be after checkIn
 */
exports.updateReservation = async (req, res) => {
  try {
    const { guestName, guestEmail, checkIn, checkOut } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (guestName !== undefined && guestName !== null) {
      if (guestName.trim() === '') {
        return res.status(400).json({ error: 'Guest Name is required' });
      }
      if (guestName.trim().length < 2) {
        return res.status(400).json({ error: 'Guest Name must be at least 2 characters' });
      }
    }

    if (guestEmail !== undefined && guestEmail !== null) {
      if (guestEmail.trim() === '') {
        return res.status(400).json({ error: 'Guest Email is required' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        return res.status(400).json({ error: 'Guest Email must be valid' });
      }
    }

    if ((checkIn !== undefined && checkIn !== null) || (checkOut !== undefined && checkOut !== null)) {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) return res.status(404).json({ error: 'Reservation not found' });

      const inDate = checkIn || reservation.checkIn;
      const outDate = checkOut || reservation.checkOut;
      const checkInDate = new Date(inDate);
      const checkOutDate = new Date(outDate);
      if (checkOutDate <= checkInDate) {
        return res.status(400).json({ error: 'Check-Out date must be after Check-In date' });
      }
    }

    const updateData = { guestName, guestEmail, checkIn, checkOut, bookingDetails: req.body.bookingDetails };
    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const reservation = await Reservation.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
      amount: reservation.room.price,
      location: reservation.room.roomNumber || reservation.room.name, // Room number or name as location
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
