// ============================================
// SALES TRACKING ROUTES
// ============================================
// Revenue tracking and sales reporting
// Auto-created when reservations are confirmed
// Admin-only access for all operations
// Supports daily/weekly/monthly aggregation

const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET ALL SALES - retrieve all transactions (Admin only)
// ============================================
router.get('/', authenticate, authorize('Admin'), salesController.getAllSales);

// ============================================
// GET DAILY SALES - today's revenue (Admin only)
// ============================================
router.get('/daily', authenticate, authorize('Admin'), salesController.getDailySales);

// ============================================
// GET WEEKLY SALES - this week's revenue (Admin only)
// ============================================
router.get('/weekly', authenticate, authorize('Admin'), salesController.getWeeklySales);

// ============================================
// GET MONTHLY SALES - this month's revenue (Admin only)
// ============================================
router.get('/monthly', authenticate, authorize('Admin'), salesController.getMonthlySales);

// ============================================
// RECORD SALE - manually create sale record (Admin only)
// Usually auto-created with reservation confirmation
// ============================================
router.post('/', authenticate, authorize('Admin'), salesController.recordSale);

// ============================================
// DELETE SALE - remove sale record (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('Admin'), salesController.deleteSale);

module.exports = router;
