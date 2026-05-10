// ============================================
// INVENTORY MANAGEMENT ROUTES
// ============================================
// Pool cleaning supplies and equipment tracking
// READ operations for authenticated users
// Admin and Staff/Receptionist can CREATE/UPDATE/DELETE items
// Authenticated users can RECORD USAGE

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// GET ALL INVENTORY - retrieve all stock items
// ============================================
router.get('/', authenticate, inventoryController.getAllInventory);

// ============================================
// GET LOW STOCK ALERTS - filter items below minimum threshold
// MUST come BEFORE /:id route to avoid routing conflicts
// ============================================
router.get('/alerts/low-stock', authenticate, inventoryController.getLowStockItems);

// ============================================
// GET INVENTORY BY ID - retrieve item details
// ============================================
router.get('/:id', authenticate, inventoryController.getInventoryById);

// ============================================
// CREATE INVENTORY ITEM - add new supply/equipment (Admin or Staff/Receptionist)
// ============================================
router.post('/', authenticate, authorize('admin', 'staff'), inventoryController.createInventoryItem);

// ============================================
// UPDATE INVENTORY QUANTITY - adjust stock levels (Admin or Staff/Receptionist)
// ============================================
router.put('/:id', authenticate, authorize('admin', 'staff'), inventoryController.updateInventoryQuantity);

// ============================================
// RECORD USAGE - log item usage with staff attribution (Authenticated)
// ============================================
router.put('/:id/usage', authenticate, inventoryController.recordUsage);

// ============================================
// DELETE INVENTORY ITEM - remove supply/equipment (Admin or Staff/Receptionist)
// ============================================
router.delete('/:id', authenticate, authorize('admin', 'staff'), inventoryController.deleteInventoryItem);

module.exports = router;
