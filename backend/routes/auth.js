// backend/routes/auth.js
// ============================================
// AUTH ROUTES - for registration and login
// ============================================

const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  registerStaff, 
  getAllCustomers, 
  getAllStaff, 
  getUserById 
} = require("../controllers/authController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ============================================
// PUBLIC ROUTES
// ============================================

// POST /api/auth/register - create new account (customer)
router.post("/register", register);

// POST /api/auth/login - login to account
router.post("/login", login);

// GET /api/auth/:id - get specific user (public for booking reference)
router.get("/:id", getUserById);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// POST /api/auth/register-staff - admin creates staff
router.post("/register-staff", verifyToken, isAdmin, registerStaff);

// GET /api/auth/staff/all - get all staff (admin only)
router.get("/staff/all", verifyToken, isAdmin, getAllStaff);

// GET /api/auth/customers/all - get all customers (admin/staff)
router.get("/customers/all", verifyToken, getAllCustomers);

module.exports = router;