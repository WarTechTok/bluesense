// ============================================
// ROOMS MANAGEMENT ROUTES
// ============================================
// All room/pool management endpoints
// READ operations for authenticated users
// CREATE/UPDATE/DELETE operations for Admin only

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET ALL ROOMS - retrieve all available rooms/pools
// ============================================
router.get('/', authenticate, roomController.getAllRooms);

// ============================================
// GET ROOM BY ID - retrieve specific room details
// ============================================
router.get('/:id', authenticate, roomController.getRoomById);

// ============================================
// CREATE ROOM - add new room/pool (Admin only)
// ============================================
router.post('/', authenticate, authorize('Admin'), roomController.createRoom);

// ============================================
// UPDATE ROOM - modify room/pool details (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('Admin'), roomController.updateRoom);

// ============================================
// STAFF ASSIGNMENT ROUTES (Admin only)
// ============================================

// ============================================
// ASSIGN STAFF TO ROOM - add staff member to check room
// ============================================
router.put('/:id/assign-staff', authenticate, authorize('Admin'), roomController.assignStaffToRoom);

// ============================================
// REMOVE STAFF FROM ROOM - unassign staff from room
// ============================================
router.delete('/:id/remove-staff/:staffId', authenticate, authorize('Admin'), roomController.removeStaffFromRoom);

// ============================================
// GET ROOM STAFF - retrieve all assigned staff for a room
// ============================================
router.get('/:id/staff', authenticate, roomController.getRoomStaff);

// ============================================
// DELETE ROOM - remove room/pool from system (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('Admin'), roomController.deleteRoom);

module.exports = router;
