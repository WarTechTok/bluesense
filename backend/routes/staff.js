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
// DEBUG - TOKEN VERIFICATION (remove after testing)
// ============================================
router.get('/debug/verify-token', authenticate, (req, res) => {
  res.json({
    message: '✅ Token is valid!',
    decoded: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      all_fields: req.user
    },
    isAdmin: req.user.role === 'admin',
    roleComparison: {
      token_role: req.user.role,
      expected_roles: ['admin', 'staff', 'customer'],
      is_admin_check: req.user.role === 'admin',
      will_pass_authorize_admin: req.user.role === 'admin'
    }
  });
});

// ============================================
// GET ALL STAFF - retrieve all staff accounts (Admin only)
// ============================================
router.get('/', authenticate, authorize('admin'), staffController.getAllStaff);

// ============================================
// GET STAFF BY ID - retrieve staff member details (Admin only)
// ============================================
router.get('/:id', authenticate, authorize('admin'), staffController.getStaffById);

// ============================================
// CREATE STAFF ACCOUNT - add new staff member (Admin only)
// Password automatically hashed with bcryptjs
// ============================================
router.post('/', authenticate, authorize('admin'), staffController.createStaffAccount);

// ============================================
// UPDATE STAFF - modify staff member info (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('admin'), staffController.updateStaff);

// ============================================
// DISABLE STAFF ACCOUNT - deactivate user login (Admin only)
// ============================================
router.put('/:id/disable', authenticate, authorize('admin'), staffController.disableStaffAccount);

// ============================================
// ACTIVATE STAFF ACCOUNT - re-enable user login (Admin only)
// ============================================
router.put('/:id/activate', authenticate, authorize('admin'), staffController.activateStaffAccount);

// ============================================
// RESET PASSWORD - reset staff password (Admin only)
// New password hashed before saving
// ============================================
router.put('/:id/reset-password', authenticate, authorize('admin'), staffController.resetPassword);

// ============================================
// DELETE STAFF - remove staff account (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('admin'), staffController.deleteStaff);

module.exports = router;
