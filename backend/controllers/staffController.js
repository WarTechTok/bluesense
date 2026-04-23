const Staff = require('../models/Staff');
const User = require('../models/User');
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
 * Body: { name, email, role, password, position, address }
 * Password is hashed with bcryptjs before storage
 * Default status: Active
 * Validation: name and email required, password min 6 chars
 */
exports.createStaffAccount = async (req, res) => {
  try {
    const { name, email, role, password, position, address, permissions } = req.body;

    console.log('📝 Creating staff account - File info:');
    console.log('  File received:', req.file ? `Yes - ${req.file.filename}` : 'No');
    if (req.file) console.log('  File details:', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, path: req.file.path });

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
    // Get last staff record with same role
    const lastStaffWithRole = await Staff.findOne({ role: role }).sort({ createdAt: -1 });
    
    // Extract sequence number from lastStaffId or start at 0
    const lastSequence = lastStaffWithRole ? parseInt(lastStaffWithRole.staffId.slice(4)) : 0;
    const newSequence = lastSequence + 1;
    
    // Generate new staffId with role prefix (ADM-001 or STF-001)
    const rolePrefix = role === 'admin' ? 'ADM' : 'STF';
    const newStaffId = `${rolePrefix}-${String(newSequence).padStart(3, '0')}`;

    // Hash password with bcryptjs (salt rounds: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse permissions if admin
    let staffPermissions = null;
    if (role === 'admin' && permissions) {
      try {
        staffPermissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
      } catch (e) {
        console.error('Error parsing permissions:', e);
      }
    }

    const staff = new Staff({
      staffId: newStaffId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'Staff',
      position: role === 'admin' ? null : (position || 'Housekeeper'),
      address: address || null,
      permissions: staffPermissions,
      password: hashedPassword,
      status: 'Active',
      profilePicture: req.file ? `/uploads/staff-avatars/${req.file.filename}` : null
    });

    await staff.save();
    console.log('✅ Staff created successfully:', staff.staffId);

    // ============================================
    // ALSO CREATE USER RECORD FOR AUTHENTICATION
    // ============================================
    // Check if User already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    let user;
    if (!existingUser) {
      user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'staff', // Staff login uses 'staff' role
        phone: address || null,
        address: address || null,
        isEmailVerified: true, // Admin-created accounts are auto-verified
      });
      await user.save();
      console.log('✅ User created successfully for staff:', email);
    } else {
      console.log('⚠️ User already exists for:', email);
      user = existingUser;
    }
    
    // Don't return password in response
    res.status(201).json({ 
      _id: staff._id, 
      staffId: staff.staffId, 
      name: staff.name, 
      email: staff.email, 
      role: staff.role, 
      position: staff.position, 
      address: staff.address, 
      status: staff.status, 
      profilePicture: staff.profilePicture, 
      permissions: staff.permissions,
      message: '✅ Staff account created successfully. Account is ready to use.' 
    });
  } catch (error) {
    console.error('❌ Error creating staff:', error.message);
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
    const { name, email, role, position, address, permissions } = req.body;

    console.log('📝 Updating staff account - File info:');
    console.log('  File received:', req.file ? `Yes - ${req.file.filename}` : 'No');
    if (req.file) console.log('  File details:', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size, path: req.file.path });

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

    const updateData = {};
    
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (role) updateData.role = role.trim();
    if (position) updateData.position = position;
    if (address) updateData.address = address;
    
    // Handle permissions for admin role
    if (permissions) {
      try {
        updateData.permissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
      } catch (e) {
        console.error('Error parsing permissions:', e);
      }
    }
    
    // Handle file upload
    if (req.file) {
      updateData.profilePicture = `/uploads/staff-avatars/${req.file.filename}`;
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    
    // ============================================
    // SYNC CHANGES TO USER MODEL
    // ============================================
    const userUpdateData = {};
    if (name) userUpdateData.name = name.trim();
    if (email) userUpdateData.email = email.toLowerCase().trim();
    if (address) userUpdateData.address = address;
    
    // Update corresponding User record
    const updatedUser = await User.findOneAndUpdate(
      { email: staff.email }, // Find by old email
      userUpdateData,
      { new: true }
    );
    if (updatedUser) {
      console.log('✅ User record also updated:', staff.email);
    }
    
    res.json(staff);
  } catch (error) {
    console.error('Staff update error:', error);
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

/**
 * POST /api/staff/sync-user-email
 * Sync User email with Staff email - for fixing email mismatches
 * This endpoint helps when User and Staff have different emails
 * Body: { staffEmail, staffPassword }
 * No authentication required (for setup/recovery)
 */
exports.syncUserEmailWithStaff = async (req, res) => {
  try {
    const { staffEmail, staffPassword } = req.body;
    
    if (!staffEmail || !staffPassword) {
      return res.status(400).json({ error: 'Staff email and password required' });
    }

    // Find staff record by email
    const staff = await Staff.findOne({ email: staffEmail });
    if (!staff) {
      return res.status(404).json({ error: 'Staff record not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(staffPassword, staff.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Now find any User with a different email but same name
    // This handles cases where User email is 'mhikejoshua@gmail.com' but Staff is 'mikejoshua@gmail.com'
    const users = await require('../models/User').find({ name: staff.name });
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'No User found with matching name' });
    }

    const User = require('../models/User');
    let updated = false;

    for (const user of users) {
      if (user.email !== staffEmail) {
        console.log(`🔄 Syncing email for ${user.name}: ${user.email} → ${staffEmail}`);
        user.email = staffEmail;
        await user.save();
        updated = true;
      }
    }

    if (updated) {
      res.json({
        message: 'Email synced successfully',
        staffEmail: staff.email,
        staffName: staff.name,
        staffId: staff.staffId
      });
    } else {
      res.json({
        message: 'Emails already match',
        staffEmail: staff.email
      });
    }
  } catch (error) {
    console.error('Error syncing email:', error);
    res.status(500).json({ error: error.message });
  }
};
