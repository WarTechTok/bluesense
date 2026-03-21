const mongoose = require('mongoose');

/**
 * Inventory Model
 * Tracks pool cleaning supplies and maintenance items
 * Used for: Inventory Management module - stock tracking and usage logging
 * Items include: Chlorine, pH solution, cleaning brushes, pool filters, testing kits
 */
const InventorySchema = new mongoose.Schema({
  item: { type: String, required: true }, // Name of inventory item (e.g., "Chlorine")
  quantity: { type: Number, required: true }, // Current stock quantity
  unit: { type: String }, // Unit of measurement (e.g., "Liters", "Units", "Boxes")
  lowStockAlert: { type: Number, default: 5 }, // Threshold for low stock warnings
  usageRecords: [{ // Array of usage logs for tracking consumption
    date: { type: Date }, // When the item was used
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Staff member who used it
    quantityUsed: { type: Number } // Amount consumed
  }]
});

module.exports = mongoose.model('Inventory', InventorySchema);