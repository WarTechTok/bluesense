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
 */
exports.createInventoryItem = async (req, res) => {
  try {
    const { item, quantity, unit, lowStockAlert } = req.body;
    const newItem = new Inventory({ item, quantity, unit, lowStockAlert });
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
 */
exports.updateInventoryQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await Inventory.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
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
 */
exports.recordUsage = async (req, res) => {
  try {
    const { quantityUsed, usedBy } = req.body;
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Inventory item not found' });

    // Deduct from quantity
    item.quantity -= quantityUsed;

    // Record usage in logs
    item.usageRecords.push({
      date: new Date(),
      usedBy,
      quantityUsed
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
