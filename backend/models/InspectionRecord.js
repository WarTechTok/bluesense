// backend/models/InspectionRecord.js
// ============================================
// INSPECTION RECORD MODEL
// ============================================
// Tracks staff inspection reports for assigned rooms
// Includes property condition, damages, and maintenance needs
// Links to Room and Staff for accountability
// Automatically notifies admin if damages are found

const mongoose = require('mongoose');

const inspectionRecordSchema = new mongoose.Schema({
  // ============================================
  // BASIC INFORMATION
  // ============================================
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  
  inspectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  
  inspectionDate: {
    type: Date,
    default: Date.now
  },
  
  // ============================================
  // INSPECTION DETAILS
  // ============================================
  cleanliness: {
    type: String,
    enum: ['Poor', 'Fair', 'Good', 'Excellent'],
    default: 'Good'
  },
  
  furnitureCondition: {
    type: String,
    enum: ['Poor', 'Fair', 'Good', 'Excellent'],
    default: 'Good'
  },
  
  electricityStatus: {
    type: String,
    enum: ['Not Working', 'Partial', 'Working', 'Excellent'],
    default: 'Working'
  },
  
  plumbingStatus: {
    type: String,
    enum: ['Not Working', 'Partial', 'Working', 'Excellent'],
    default: 'Working'
  },
  
  // ============================================
  // DAMAGES & ISSUES
  // ============================================
  damagesFound: {
    type: Boolean,
    default: false
  },
  
  damageDescription: {
    type: String,
    default: ''
  },
  
  maintenanceRequired: {
    type: Boolean,
    default: false
  },
  
  maintenanceNotes: {
    type: String,
    default: ''
  },
  
  itemsNeeded: [{
    type: String,
    default: ''
  }],
  
  // ============================================
  // INSPECTION STATUS
  // ============================================
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Reviewed', 'Action-Required'],
    default: 'Submitted'
  },
  
  // ============================================
  // PHOTOS/EVIDENCE (optional - store paths)
  // ============================================
  photosPath: [{
    type: String,
    default: ''
  }],
  
  // ============================================
  // ADDITIONAL NOTES
  // ============================================
  notes: {
    type: String,
    default: ''
  },
  
  // ============================================
  // TIMESTAMPS
  // ============================================
}, { timestamps: true });

module.exports = mongoose.model('InspectionRecord', inspectionRecordSchema);
