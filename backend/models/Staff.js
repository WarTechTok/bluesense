const mongoose = require('mongoose');

/**
 * Staff Model
 * Represents a staff member account in the system
 * Used for: Staff Account Management module - user authentication and role-based access control
 * Roles: Admin (full access), Staff (limited access)
 * Positions: Receptionist, Housekeeper (for staff role)
 */
const StaffSchema = new mongoose.Schema({
  staffId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  }, // Auto-generated sequential ID (STF-0001, STF-0002, etc.)
  name: { type: String, required: true }, // Staff member's full name
  email: { type: String, required: true, unique: true }, // Unique email for login
  role: { 
    type: String, 
    enum: ['admin', 'staff'], 
    default: 'staff' // admin: full system access, staff: limited permissions
  },
  position: {
    type: String,
    enum: ['Receptionist', 'Housekeeper', 'Manager', 'Maintenance', 'Chef', 'Other'],
    default: 'Housekeeper' // Job position for staff members
  },
  status: { 
    type: String, 
    enum: ['Active', 'Disabled'], 
    default: 'Active' // Disabled accounts cannot login
  },
  password: { type: String, required: true }, // Hashed password (using bcryptjs)
  createdAt: { type: Date, default: Date.now } // Timestamp for sequential ID generation
});

module.exports = mongoose.model('Staff', StaffSchema);