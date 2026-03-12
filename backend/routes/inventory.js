// ============================================
// INVENTORY MANAGEMENT ROUTES
// ============================================
// Pool cleaning supplies and equipment tracking
// READ operations for authenticated users
// Admin can CREATE/UPDATE/DELETE items
// Staff can RECORD USAGE

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET ALL INVENTORY - retrieve all stock items
// ============================================
router.get('/', authenticate, inventoryController.getAllInventory);

// ============================================
// GET INVENTORY BY ID - retrieve item details
// ============================================
router.get('/:id', authenticate, inventoryController.getInventoryById);

// ============================================
// CREATE INVENTORY ITEM - add new supply/equipment (Admin only)
// ============================================
router.post('/', authenticate, authorize('Admin'), inventoryController.createInventoryItem);

// ============================================
// UPDATE INVENTORY QUANTITY - adjust stock levels (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('Admin'), inventoryController.updateInventoryQuantity);

// ============================================
// RECORD USAGE - log item usage with staff attribution (Authenticated)
// ============================================
router.put('/:id/usage', authenticate, inventoryController.recordUsage);

// ============================================
// GET LOW STOCK ALERTS - filter items below minimum threshold
// ============================================
router.get('/alerts/low-stock', authenticate, inventoryController.getLowStockItems);

// ============================================
// DELETE INVENTORY ITEM - remove supply/equipment (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('Admin'), inventoryController.deleteInventoryItem);

module.exports = router;
