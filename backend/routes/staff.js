// ============================================
// STAFF MANAGEMENT ROUTES
// ============================================
// Staff account lifecycle and access control
// ALL operations restricted to Admin role
// Includes account creation, password reset, and status management

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const staffController = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/role');

// ============================================
// MULTER CONFIGURATION FOR PROFILE PICTURES
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/staff-avatars');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'staff-' + unique + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    console.log(`✅ File accepted: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    console.error(`❌ File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ============================================
// DEBUG - TOKEN VERIFICATION (remove after testing)
// ============================================
router.get('/debug/verify-token', authenticate, (req, res) => {
  res.json({
    message: '✅ Token is valid!',
    decoded: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      all_fields: req.user
    },
    isAdmin: req.user.role === 'admin',
    roleComparison: {
      token_role: req.user.role,
      expected_roles: ['admin', 'staff', 'customer'],
      is_admin_check: req.user.role === 'admin',
      will_pass_authorize_admin: req.user.role === 'admin'
    }
  });
});

// ============================================
// GET ALL STAFF - retrieve all staff accounts (Admin only)
// ============================================
router.get('/', authenticate, authorize('admin'), staffController.getAllStaff);

// ============================================
// GET STAFF BY ID - retrieve staff member details (Admin only)
// ============================================
router.get('/:id', authenticate, authorize('admin'), staffController.getStaffById);

// ============================================
// CREATE STAFF ACCOUNT - add new staff member (Admin only)
// Password automatically hashed with bcryptjs
// ============================================
router.post('/', authenticate, authorize('admin'), upload.single('profilePicture'), staffController.createStaffAccount);

// ============================================
// UPDATE STAFF - modify staff member info (Admin only)
// ============================================
router.put('/:id', authenticate, authorize('admin'), upload.single('profilePicture'), staffController.updateStaff);

// ============================================
// DISABLE STAFF ACCOUNT - deactivate user login (Admin only)
// ============================================
router.put('/:id/disable', authenticate, authorize('admin'), staffController.disableStaffAccount);

// ============================================
// ACTIVATE STAFF ACCOUNT - re-enable user login (Admin only)
// ============================================
router.put('/:id/activate', authenticate, authorize('admin'), staffController.activateStaffAccount);

// ============================================
// RESET PASSWORD - reset staff password (Admin only)
// New password hashed before saving
// ============================================
router.put('/:id/reset-password', authenticate, authorize('admin'), staffController.resetPassword);

// ============================================
// DELETE STAFF - remove staff account (Admin only)
// ============================================
router.delete('/:id', authenticate, authorize('admin'), staffController.deleteStaff);

// ============================================
// SYNC USER EMAIL - sync User email with Staff email (for setup/recovery)
// ============================================
// No authentication required - used for fixing email mismatches during setup
router.post('/sync-user-email', staffController.syncUserEmailWithStaff);

// ============================================
// ERROR HANDLING MIDDLEWARE - for multer and other errors
// ============================================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer Error:', err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large (max 10MB)' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    console.error('❌ Upload Error:', err.message);
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
