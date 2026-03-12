const mongoose = require('mongoose');

/**
 * Staff Model
 * Represents a staff member account in the system
 * Used for: Staff Account Management module - user authentication and role-based access control
 * Roles: Admin (full access), Staff (limited access)
 */
const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Staff member's full name
  email: { type: String, required: true, unique: true }, // Unique email for login
  role: { 
    type: String, 
    enum: ['Admin', 'Staff'], 
    default: 'Staff' // Admin: full system access, Staff: limited permissions
  },
  status: { 
    type: String, 
    enum: ['Active', 'Disabled'], 
    default: 'Active' // Disabled accounts cannot login
  },
  password: { type: String, required: true } // Hashed password (using bcryptjs)
});

module.exports = mongoose.model('Staff', StaffSchema);