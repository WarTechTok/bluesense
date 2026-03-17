// backend/routes/auth.js
// ============================================
// AUTH ROUTES - CORRECT ORDER (specific routes first!)
// ============================================

const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const passport = require('passport');

const { 
  register, 
  login, 
  registerStaff, 
  getAllCustomers, 
  getAllStaff, 
  getUserById,
  forgotPassword,
  resetPassword,
  googleLogin,
  updateProfile,
  getProfile
} = require("../controllers/authController");

const { verifyToken, isAdmin } = require("../middleware/auth");

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + req.user.id + '-' + unique + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

// ============================================
// 🥇 1. GOOGLE OAUTH ROUTES (MOST SPECIFIC)
// ============================================
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login?error=google_auth_failed'
  }),
  googleLogin
);

// ============================================
// 🥈 2. OTHER SPECIFIC ROUTES (NO PARAMETERS)
// ============================================
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ============================================
// 🥉 3. PROTECTED ROUTES (WITH AUTH)
// ============================================
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single('avatar'), updateProfile);

// ============================================
// 4. ADMIN ROUTES
// ============================================
router.post("/register-staff", verifyToken, isAdmin, registerStaff);
router.get("/staff/all", verifyToken, isAdmin, getAllStaff);
router.get("/customers/all", verifyToken, getAllCustomers);

// ============================================
// ⚠️ 5. DYNAMIC ROUTE - MUST BE LAST!
// ============================================
router.get("/:id", getUserById);

module.exports = router;