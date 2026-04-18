// backend/routes/maintenance.js
// ============================================
// MAINTENANCE ROUTES
// ============================================
// All routes require authentication - Admin access only
// NOTE: Specific routes MUST come before dynamic :id routes

const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/role');

/**
 * GET /api/admin/maintenance/stats/summary
 * Get maintenance expense summary statistics
 * Auth: Admin required
 */
router.get('/stats/summary', authenticate, authorize('admin'), maintenanceController.getMaintenanceStats);

/**
 * GET /api/admin/maintenance/category/breakdown
 * Get expense breakdown by category
 * Auth: Admin required
 */
router.get('/category/breakdown', authenticate, authorize('admin'), maintenanceController.getExpenseBreakdown);

/**
 * GET /api/admin/maintenance
 * Fetch all maintenance records
 * Query params: status, priority, category, room, dateFrom, dateTo
 * Auth: Admin required
 */
router.get('/', authenticate, authorize('admin'), maintenanceController.getAllMaintenance);

/**
 * POST /api/admin/maintenance
 * Create a new maintenance record
 * Auth: Admin required
 */
router.post('/', authenticate, authorize('admin'), maintenanceController.createMaintenance);

/**
 * GET /api/admin/maintenance/:id
 * Fetch a specific maintenance record
 * Auth: Admin required
 */
router.get('/:id', authenticate, authorize('admin'), maintenanceController.getMaintenanceById);

/**
 * PUT /api/admin/maintenance/:id
 * Update a maintenance record
 * Auth: Admin required
 */
router.put('/:id', authenticate, authorize('admin'), maintenanceController.updateMaintenance);

/**
 * DELETE /api/admin/maintenance/:id
 * Delete a maintenance record
 * Auth: Admin required
 */
router.delete('/:id', authenticate, authorize('admin'), maintenanceController.deleteMaintenance);

/**
 * PUT /api/admin/maintenance/:id/mark-complete
 * Mark maintenance as completed
 * Auth: Admin required
 */
router.put('/:id/mark-complete', authenticate, authorize('admin'), maintenanceController.markMaintenanceComplete);

module.exports = router;
