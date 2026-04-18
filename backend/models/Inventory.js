const mongoose = require('mongoose');

/**
 * Inventory Model
 * Tracks pool cleaning supplies and maintenance items
 * Used for: Inventory Management module - stock tracking and usage logging
 * Items include: Chlorine, pH solution, cleaning brushes, pool filters, testing kits
 */
const InventorySchema = new mongoose.Schema({
  itemId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  }, // Auto-generated sequential ID (ITM-0001, ITM-0002, etc.)
  item: { type: String, required: true }, // Name of inventory item (e.g., "Chlorine")
  quantity: { type: Number, required: true }, // Current stock quantity
  unit: { type: String }, // Unit of measurement (e.g., "Liters", "Units", "Boxes")
  lowStockAlert: { type: Number, default: 5 }, // Threshold for low stock warnings
  price: { type: Number, default: 0 }, // Price per unit of the item
  arrivalDate: { type: Date }, // Date when item arrived/was received
  expirationDate: { type: Date }, // Date when item expires (optional)
  usageRecords: [{ // Array of usage logs for tracking consumption
    date: { type: Date }, // When the item was used
    usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Staff member who used it
    quantityUsed: { type: Number } // Amount consumed
  }],
  createdAt: { type: Date, default: Date.now } // Timestamp for sequential ID generation
});

module.exports = mongoose.model('Inventory', InventorySchema);