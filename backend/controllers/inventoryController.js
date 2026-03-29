const Inventory = require('../models/Inventory');

/**
 * Inventory Controller
 * Handles pool cleaning supply inventory management
 * Tracks stock, usage, and low-stock alerts
 * Items: Chlorine, pH solution, brushes, filters, testing kits
 */

/**
 * GET /api/admin/inventory
 * Get all inventory items
 */
exports.getAllInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/inventory/:id
 * Get specific inventory item by ID
 */
exports.getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/inventory
 * Create a new inventory item (Admin only)
 * Body: { item, quantity, unit, lowStockAlert }
 * Validation: quantity and lowStockAlert cannot be negative
 */
exports.createInventoryItem = async (req, res) => {
  try {
    const { item, quantity, unit, lowStockAlert } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (!item || item.trim() === '') {
      return res.status(400).json({ error: 'Item Name is required' });
    }
    if (item.trim().length < 2) {
      return res.status(400).json({ error: 'Item Name must be at least 2 characters' });
    }

    if (quantity === undefined || quantity === null || quantity === '') {
      return res.status(400).json({ error: 'Quantity is required' });
    }
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity)) {
      return res.status(400).json({ error: 'Quantity must be a valid number' });
    }
    if (parsedQuantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    if (!unit || unit.trim() === '') {
      return res.status(400).json({ error: 'Unit is required' });
    }

    if (lowStockAlert === undefined || lowStockAlert === null || lowStockAlert === '') {
      return res.status(400).json({ error: 'Low Stock Alert is required' });
    }
    const parsedLowStockAlert = parseInt(lowStockAlert);
    if (isNaN(parsedLowStockAlert)) {
      return res.status(400).json({ error: 'Low Stock Alert must be a valid number' });
    }
    if (parsedLowStockAlert < 0) {
      return res.status(400).json({ error: 'Low Stock Alert cannot be negative' });
    }

    // ============================================
    // GENERATE SEQUENTIAL ITEM ID
    // ============================================
    // Get last inventory item ordered by creation date
    const lastItem = await Inventory.findOne().sort({ createdAt: -1 });
    
    // Extract sequence number from last itemId or start at 0
    const lastSequence = lastItem ? parseInt(lastItem.itemId.slice(4)) : 0;
    const newSequence = lastSequence + 1;
    
    // Generate new itemId (ITM-0001, ITM-0002, etc.)
    const newItemId = `ITM-${String(newSequence).padStart(4, '0')}`;

    const newItem = new Inventory({ 
      itemId: newItemId,  // Auto-generated sequential ID
      item: item.trim(), 
      quantity: parsedQuantity, 
      unit: unit.trim(), 
      lowStockAlert: parsedLowStockAlert 
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/inventory/:id
 * Update inventory quantity (Admin only)
 * Body: { quantity }
 * Validation: quantity cannot be negative
 */
exports.updateInventoryQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (quantity === undefined || quantity === null || quantity === '') {
      return res.status(400).json({ error: 'Quantity is required' });
    }
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity)) {
      return res.status(400).json({ error: 'Quantity must be a valid number' });
    }
    if (parsedQuantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const item = await Inventory.findByIdAndUpdate(req.params.id, { quantity: parsedQuantity }, { new: true });
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/inventory/:id/usage
 * Record usage of an inventory item
 * Deducts quantity and creates usage log with staff member and timestamp
 * Body: { quantityUsed, usedBy (staff ID) }
 * Validation: quantityUsed must be greater than 0 and not exceed available quantity
 */
exports.recordUsage = async (req, res) => {
  try {
    const { quantityUsed, usedBy } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (quantityUsed === undefined || quantityUsed === null || quantityUsed === '') {
      return res.status(400).json({ error: 'Quantity Used is required' });
    }
    const parsedQuantityUsed = parseInt(quantityUsed);
    if (isNaN(parsedQuantityUsed)) {
      return res.status(400).json({ error: 'Quantity Used must be a valid number' });
    }
    if (parsedQuantityUsed <= 0) {
      return res.status(400).json({ error: 'Quantity Used must be greater than 0' });
    }
    if (parsedQuantityUsed > item.quantity) {
      return res.status(400).json({ error: `Cannot use more than available quantity (${item.quantity} available)` });
    }

    if (!usedBy || usedBy.trim() === '') {
      return res.status(400).json({ error: 'Used By field is required' });
    }

    // Deduct from quantity
    item.quantity -= parsedQuantityUsed;

    // Record usage in logs
    item.usageRecords.push({
      date: new Date(),
      usedBy,
      quantityUsed: parsedQuantityUsed
    });

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * GET /api/admin/inventory/alerts/low-stock
 * Get all items with stock below their lowStockAlert threshold
 * Used for dashboard alerts
 */
exports.getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lt: ['$quantity', '$lowStockAlert'] }
    });
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/inventory/:id
 * Delete an inventory item (Admin only)
 */
exports.deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
