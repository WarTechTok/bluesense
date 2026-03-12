// ============================================
// RESERVATIONS MANAGEMENT ROUTES
// ============================================
// Guest booking and reservation workflow
// Any authenticated user can CREATE
// Admin can CONFIRM/CANCEL/UPDATE/DELETE

const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET ALL RESERVATIONS - retrieve all bookings
// ============================================
router.get('/', authenticate, reservationController.getAllReservations);

// ============================================
// GET RESERVATION BY ID - retrieve booking details
// ============================================
router.get('/:id', authenticate, reservationController.getReservationById);

// ============================================
// CREATE RESERVATION - guest books a room (Authenticated)
// ============================================
router.post('/', authenticate, reservationController.createReservation);

// ============================================
// UPDATE RESERVATION - modify booking details (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('Admin'), reservationController.updateReservation);

// ============================================
// CONFIRM RESERVATION - approve booking & create sale record (Admin only)
// ============================================
router.put('/:id/confirm', authenticate, authorize('Admin'), reservationController.confirmReservation);

// ============================================
// CANCEL RESERVATION - cancel booking (Admin only)
// ============================================
router.put('/:id/cancel', authenticate, authorize('Admin'), reservationController.cancelReservation);

// ============================================
// DELETE RESERVATION - remove booking (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('Admin'), reservationController.deleteReservation);

module.exports = router;
