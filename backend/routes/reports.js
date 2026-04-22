// ============================================
// REPORTS GENERATION ROUTES
// ============================================
// Multi-format report generation (PDF, Excel, JSON)
// Supports date range filtering for all reports
// Admin-only access (except inventory usage for staff)

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET RESERVATION REPORT - bookings & occupancy data (Admin only)
// Query params: startDate, endDate
// Returns PDF or data object
// ============================================
router.get('/reservation', authenticate, authorize('admin'), reportController.getReservationReport);

// ============================================
// GET SALES REPORT - revenue & transaction analysis (Admin only)
// Query params: startDate, endDate
// Returns PDF or data object
// ============================================
router.get('/sales', authenticate, authorize('admin'), reportController.getSalesReport);

// ============================================
// GET INVENTORY USAGE REPORT - supply consumption tracking
// Query params: startDate, endDate
// Accessible to authenticated users (staff can see usage)
// ============================================
router.get('/inventory-usage', authenticate, reportController.getInventoryUsageReport);

// ============================================
// GET STAFF ACTIVITY REPORT - staff performance metrics (Admin only)
// Query params: startDate, endDate
// Returns PDF or data object
// ============================================
router.get('/staff-activity', authenticate, authorize('admin'), reportController.getStaffActivityReport);

// ============================================
// EXPORT REPORT - download report in JSON format (Admin only)
// Query params: reportType, startDate, endDate
// ============================================
router.get('/export', authenticate, authorize('admin'), reportController.exportReportAsJSON);

// ============================================
// DEBUG ENDPOINT - Check sales status (Admin only)
// For troubleshooting why sales aren't appearing
// ============================================
router.get('/debug/sales-status', authenticate, authorize('admin'), reportController.debugSalesStatus);

module.exports = router;
