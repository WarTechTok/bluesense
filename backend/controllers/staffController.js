const Staff = require('../models/Staff');
const bcrypt = require('bcrypt');

/**
 * Staff Controller
 * Manages staff accounts, roles, and access control
 * Admins can create, edit, disable, and reset passwords for staff
 */

/**
 * GET /api/admin/staff
 * Get all staff members with their roles and status (Admin only)
 * Passwords are excluded from response
 */
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-password');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/admin/staff/:id
 * Get specific staff member by ID (Admin only)
 */
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/staff
 * Create a new staff account (Admin only)
 * Body: { name, email, role, password }
 * Password is hashed with bcryptjs before storage
 * Default status: Active
 */
exports.createStaffAccount = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    
    // Check if email already exists (unique constraint)
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) return res.status(400).json({ error: 'Email already in use' });

    // Hash password with bcryptjs (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new Staff({
      name,
      email,
      role: role || 'Staff',
      password: hashedPassword,
      status: 'Active'
    });

    await staff.save();
    // Don't return password in response
    res.status(201).json({ _id: staff._id, name: staff.name, email: staff.email, role: staff.role, status: staff.status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/staff/:id
 * Update staff details (Admin only)
 * Can update: name, email, role
 */
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/staff/:id/disable
 * Disable a staff account (Admin only)
 * Changes status to 'Disabled' - account cannot login
 */
exports.disableStaffAccount = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, { status: 'Disabled' }, { new: true }).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/staff/:id/activate
 * Activate/Enable a staff account (Admin only)
 * Changes status to 'Active' - account can login again
 */
exports.activateStaffAccount = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, { status: 'Active' }, { new: true }).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/staff/:id/reset-password
 * Reset staff member's password (Admin only)
 * Body: { newPassword }
 * New password is hashed before storage
 */
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const staff = await Staff.findByIdAndUpdate(req.params.id, { password: hashedPassword }, { new: true }).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: 'Password reset successfully', staff });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/admin/staff/:id
 * Delete/Remove a staff account (Admin only)
 */
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ message: 'Staff account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
