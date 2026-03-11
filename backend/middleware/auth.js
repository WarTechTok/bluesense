// backend/middleware/auth.js
// ============================================
// AUTH MIDDLEWARE - protect routes and check roles
// ============================================

const jwt = require("jsonwebtoken");

// ============================================
// VERIFY TOKEN - check if user is logged in
// ============================================
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// ============================================
// CHECK STAFF - staff or admin only
// ============================================
const isStaff = (req, res, next) => {
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Staff only." });
  }
  next();
};

// ============================================
// CHECK ADMIN - admin only
// ============================================
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

module.exports = { verifyToken, isStaff, isAdmin };