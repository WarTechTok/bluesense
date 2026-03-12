// backend/controllers/authController.js
// ============================================
// AUTH CONTROLLER - for admin, staff, and customers
// ============================================

const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ============================================
// REGISTER - create new account (admin/staff/customer)
// ============================================
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",  // Default ay customer
      phone,
      address
    });

    await newUser.save();

    res.status(201).json({ 
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// LOGIN - authenticate any user
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create JWT token
    const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key_bluesense_2026";
    console.log(`🔑 JWT Created: SECRET_KEY=${secretKey}, USER_ID=${user._id}, ROLE=${user.role}`);
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      secretKey,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// REGISTER STAFF - admin only can create staff accounts
// ============================================
const registerStaff = async (req, res) => {
  try {
    // Siguraduhing admin ang gumagawa nito
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, email, password, role } = req.body;

    // Staff lang ang pwedeng gawin (hindi pwedeng gumawa ng admin)
    if (role && role === "admin") {
      return res.status(403).json({ message: "Cannot create admin account" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new staff
    const newStaff = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "staff"
    });

    await newStaff.save();

    res.status(201).json({ 
      message: "Staff created successfully",
      user: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET ALL CUSTOMERS - for admin/staff
// ============================================
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET ALL STAFF - for admin only
// ============================================
const getAllStaff = async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const staff = await User.find({ role: "staff" }).select("-password");
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================================
// GET USER BY ID - for profiles
// ============================================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  register, 
  login, 
  registerStaff, 
  getAllCustomers, 
  getAllStaff, 
  getUserById 
};