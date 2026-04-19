const mongoose = require('mongoose');

/**
 * Room Model
 * Represents a room or private pool area in the resort
 * Used for: Room Management module - CRUD operations on rooms
 */
const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Room/Pool name (e.g., "Deluxe Pool Room")
  capacity: { type: Number, required: true }, // Maximum number of guests
  price: { type: Number, required: true }, // Price per night in USD
  description: { type: String }, // Detailed description of the room
  status: { 
    type: String, 
    enum: ['Available', 'Maintenance', 'Booked'], 
    default: 'Available' // Current status of the room
  },
  // ============================================
  // PACKAGE & AMENITIES
  // ============================================
  oasis: {
    type: String,
    enum: ['Oasis 1', 'Oasis 2'],
    default: 'Oasis 1'
  },
  packageName: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null // Path to room image
  },
  appliances: [{
    type: String,
    default: ''
  }], // List of appliances/amenities (e.g., "Air Conditioning", "WiFi", "Smart TV")
  // ============================================
  // STAFF ASSIGNMENT FEATURE
  // ============================================
  assignedStaff: [
    {
      staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }, // Staff member assigned to check this room
      assignedDate: { type: Date, default: Date.now }, // When staff was assigned
      notes: { type: String } // Additional notes about the assignment
    }
  ], // Array of staff members responsible for checking/maintaining this room
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);