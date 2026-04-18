const mongoose = require('mongoose');

/**
 * Maintenance Model
 * Represents maintenance expenses and records for rooms/facilities
 * Used for: Maintenance Management module - tracking maintenance costs and tasks
 */
const maintenanceSchema = new mongoose.Schema({
  // ============================================
  // BASIC INFORMATION
  // ============================================
  maintenanceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  }, // Auto-generated sequential ID (MNT-0001)

  title: {
    type: String,
    required: true
  }, // Maintenance task title (e.g., "Pool Filter Replacement")

  description: {
    type: String,
    default: ''
  }, // Detailed description of the maintenance work

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  }, // Reference to room if applicable

  // ============================================
  // EXPENSE TRACKING
  // ============================================
  amount: {
    type: Number,
    required: true
  }, // Cost of maintenance in PHP

  currency: {
    type: String,
    default: 'PHP'
  }, // Currency code

  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Cleaning', 'Equipment', 'Furniture', 'General', 'Emergency', 'Other'],
    default: 'General'
  }, // Category of maintenance

  vendor: {
    type: String,
    default: null
  }, // Vendor or contractor name

  invoiceNumber: {
    type: String,
    default: null
  }, // Invoice/receipt number for tracking

  // ============================================
  // STATUS & PRIORITY
  // ============================================
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  }, // Current status of the maintenance task

  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent', 'Emergency'],
    default: 'Medium'
  }, // Priority level

  // ============================================
  // DATES & SCHEDULING
  // ============================================
  reportedDate: {
    type: Date,
    default: Date.now
  }, // When the maintenance issue was reported

  scheduledDate: {
    type: Date,
    default: null
  }, // When maintenance is scheduled

  completedDate: {
    type: Date,
    default: null
  }, // When maintenance was completed

  dueDate: {
    type: Date,
    default: null
  }, // Due date for completion

  // ============================================
  // RESPONSIBLE PARTIES
  // ============================================
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  }, // Staff member who reported the issue

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  }, // Staff member assigned to complete the task

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    default: null
  }, // Admin who approved the expense

  // ============================================
  // PARTS & MATERIALS
  // ============================================
  partsNeeded: [
    {
      name: String,
      quantity: Number,
      unitCost: Number,
      supplier: String
    }
  ], // List of parts/materials needed

  inventoryUsed: [
    {
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory'
      }, // Reference to inventory item
      itemName: String, // Name of the inventory item
      quantityUsed: Number, // Quantity used from inventory
      unitPrice: Number, // Price per unit at time of use
      totalCost: Number // Total cost (quantityUsed * unitPrice)
    }
  ], // Inventory items used in this maintenance task

  laborHours: {
    type: Number,
    default: 0
  }, // Hours spent on labor

  // ============================================
  // DOCUMENTATION
  // ============================================
  notes: {
    type: String,
    default: ''
  }, // Additional notes

  photosPath: [
    {
      type: String
    }
  ], // Photos before/after maintenance

  attachmentPath: {
    type: String,
    default: null
  }, // Invoice or other document

  // ============================================
  // PAYMENT TRACKING
  // ============================================
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending'
  }, // Payment status

  paymentDate: {
    type: Date,
    default: null
  }, // Date payment was made

  receiptNumber: {
    type: String,
    default: null
  }, // Payment receipt number

  // ============================================
  // RECURRING MAINTENANCE
  // ============================================
  isRecurring: {
    type: Boolean,
    default: false
  }, // Is this a recurring maintenance task?

  recurringFrequency: {
    type: String,
    enum: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'As-Needed'],
    default: 'As-Needed'
  }, // How often the maintenance occurs

  lastMaintenanceDate: {
    type: Date,
    default: null
  }, // Last time this maintenance was performed

  nextMaintenanceDate: {
    type: Date,
    default: null
  }, // Next scheduled maintenance

  // ============================================
  // TIMESTAMPS
  // ============================================
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
