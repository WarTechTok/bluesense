// backend/routes/auth.js
// ============================================
// AUTH ROUTES - CORRECT ORDER (specific routes first!)
// ============================================

const express  = require("express");
const router   = express.Router();
const passport = require('passport');

const {
  register, login, registerStaff, getAllCustomers, getAllStaff,
  getUserById, forgotPassword, resetPassword, googleLogin,
  updateProfile, getProfile, changePassword, verifyEmail, resendVerificationEmail,
} = require("../controllers/authController");

const { verifyToken, isAdmin } = require("../middleware/auth");
const { uploadAvatar } = require("../middleware/upload"); // memoryStorage — no disk writes

// 1. GOOGLE OAUTH
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
  googleLogin
);

// 2. EMAIL VERIFICATION
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// 3. PUBLIC AUTH ROUTES
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// 4. PROTECTED ROUTES
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, uploadAvatar, updateProfile); // avatar → Cloudinary
router.post("/change-password", verifyToken, changePassword);

// 5. ADMIN ROUTES
router.post("/register-staff", verifyToken, isAdmin, registerStaff);
router.get("/staff/all", verifyToken, isAdmin, getAllStaff);
router.get("/customers/all", verifyToken, getAllCustomers);

// 6. DYNAMIC — LAST
router.get("/:id", getUserById);

module.exports = router;