// ============================================
// STAFF MANAGEMENT ROUTES
// ============================================
// Staff account lifecycle and access control
// ALL operations restricted to Admin role
// Includes account creation, password reset, and status management

const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET ALL STAFF - retrieve all staff accounts (Admin only)
// ============================================
router.get('/', authenticate, authorize('Admin'), staffController.getAllStaff);

// ============================================
// GET STAFF BY ID - retrieve staff member details (Admin only)
// ============================================
router.get('/:id', authenticate, authorize('Admin'), staffController.getStaffById);

// ============================================
// CREATE STAFF ACCOUNT - add new staff member (Admin only)
// Password automatically hashed with bcryptjs
// ============================================
router.post('/', authenticate, authorize('Admin'), staffController.createStaffAccount);

// ============================================
// UPDATE STAFF - modify staff member info (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('Admin'), staffController.updateStaff);

// ============================================
// DISABLE STAFF ACCOUNT - deactivate user login (Admin only)
// ============================================
router.put('/:id/disable', authenticate, authorize('Admin'), staffController.disableStaffAccount);

// ============================================
// ACTIVATE STAFF ACCOUNT - re-enable user login (Admin only)
// ============================================
router.put('/:id/activate', authenticate, authorize('Admin'), staffController.activateStaffAccount);

// ============================================
// RESET PASSWORD - reset staff password (Admin only)
// New password hashed before saving
// ============================================
router.put('/:id/reset-password', authenticate, authorize('Admin'), staffController.resetPassword);

// ============================================
// DELETE STAFF - remove staff account (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('Admin'), staffController.deleteStaff);

module.exports = router;
