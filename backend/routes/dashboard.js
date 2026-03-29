const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/role');

// Dashboard Overview Routes
// All routes require authentication - Admin Dashboard access only

/**
 * GET /api/admin/dashboard/stats
 * Fetches key statistics for the dashboard overview
 * Returns: Total reservations, available rooms, active staff, monthly revenue, etc.
 * Auth: Required (any authenticated user)
 */
router.get('/stats', authenticate, dashboardController.getDashboardStats);

/**
 * GET /api/admin/dashboard/daily-chart
 * Fetches sales data for the last 7 days
 * Used for: Daily sales chart visualization
 * Auth: Required
 */
router.get('/daily-chart', authenticate, dashboardController.getDailyChartData);

/**
 * GET /api/admin/dashboard/monthly-chart
 * Fetches sales data for the last 12 months
 * Used for: Monthly sales chart visualization
 * Auth: Required
 */
router.get('/monthly-chart', authenticate, dashboardController.getMonthlyChartData);

/**
 * GET /api/admin/dashboard/staff-inspections
 * Fetches all staff inspection records
 * Query params: staffId, roomId, status, startDate, endDate
 * Auth: Admin Required
 */
router.get('/staff-inspections', authenticate, authorize('admin'), dashboardController.getStaffInspections);

/**
 * GET /api/admin/dashboard/staff-inspections/:inspectionId
 * Fetches a specific staff inspection record detail
 * Auth: Admin Required
 */
router.get('/staff-inspections/:inspectionId', authenticate, authorize('admin'), dashboardController.getStaffInspectionDetails);

module.exports = router;
