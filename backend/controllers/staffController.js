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
 * Validation: name and email required, password min 6 chars
 */
exports.createStaffAccount = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email must be valid' });
    }

    // Check if email already exists (unique constraint)
    const existingStaff = await Staff.findOne({ email: email.toLowerCase() });
    if (existingStaff) return res.status(400).json({ error: 'Email already in use' });

    if (!role || role.trim() === '') {
      return res.status(400).json({ error: 'Role is required' });
    }

    if (!password || password === '') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // ============================================
    // GENERATE SEQUENTIAL STAFF ID
    // ============================================
    // Get last staff record ordered by creation date
    const lastStaff = await Staff.findOne().sort({ createdAt: -1 });
    
    // Extract sequence number from last staffId or start at 0
    const lastSequence = lastStaff ? parseInt(lastStaff.staffId.slice(4)) : 0;
    const newSequence = lastSequence + 1;
    
    // Generate new staffId (STF-0001, STF-0002, etc.)
    const newStaffId = `STF-${String(newSequence).padStart(4, '0')}`;

    // Hash password with bcryptjs (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new Staff({
      staffId: newStaffId,  // Auto-generated sequential ID
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'Staff',
      password: hashedPassword,
      status: 'Active'
    });

    await staff.save();
    // Don't return password in response
    res.status(201).json({ _id: staff._id, staffId: staff.staffId, name: staff.name, email: staff.email, role: staff.role, status: staff.status });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/admin/staff/:id
 * Update staff details (Admin only)
 * Can update: name, email, role
 * Validation: name and email must be valid format
 */
exports.updateStaff = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (name !== undefined && name !== null) {
      if (name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
      }
      if (name.trim().length < 2) {
        return res.status(400).json({ error: 'Name must be at least 2 characters' });
      }
    }

    if (email !== undefined && email !== null) {
      if (email.trim() === '') {
        return res.status(400).json({ error: 'Email is required' });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email must be valid' });
      }

      // Check if new email is already taken by another staff member
      const existingStaff = await Staff.findOne({ email: email.toLowerCase(), _id: { $ne: req.params.id } });
      if (existingStaff) return res.status(400).json({ error: 'Email already in use' });
    }

    if (role !== undefined && role !== null) {
      if (role.trim() === '') {
        return res.status(400).json({ error: 'Role is required' });
      }
    }

    const updateData = { name, email, role };
    if (email) updateData.email = email.toLowerCase().trim();
    if (name) updateData.name = name.trim();
    if (role) updateData.role = role.trim();

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const staff = await Staff.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
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
 * Validation: password min 6 chars
 */
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // ============================================
    // BACKEND VALIDATION
    // ============================================
    if (!newPassword || newPassword === '') {
      return res.status(400).json({ error: 'New Password is required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

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
