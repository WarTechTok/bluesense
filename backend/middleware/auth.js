// backend/middleware/auth.js
// ============================================
// AUTH MIDDLEWARE - protect routes and check roles
// ============================================

const jwt = require("jsonwebtoken");

// ============================================
// VERIFY TOKEN - check if user is logged in
// ============================================
const verifyToken = (req, res, next) => {
  console.log("🔵🔵🔵 VERIFY TOKEN MIDDLEWARE CALLED 🔵🔵🔵");
  console.log("🔵 Request method:", req.method);
  console.log("🔵 Request path:", req.path);
  console.log("🔵 All headers:", JSON.stringify(req.headers, null, 2));
  
  const authHeader = req.header("Authorization");
  console.log("🔵 Authorization header:", authHeader);
  
  const token = authHeader && authHeader.split(" ")[1];
  console.log("🔵 Token extracted:", token ? `${token.substring(0, 30)}...` : "NO TOKEN");

  if (!token) {
    console.log("❌ No token provided - returning 401");
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    console.log("✅ Token verified successfully");
    console.log("✅ Decoded user:", { id: decoded.id, email: decoded.email, role: decoded.role });
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ Token verification failed:", error.message);
    res.status(400).json({ message: "Invalid token" });
  }
};

// ============================================
// CHECK STAFF - staff or admin only
// ============================================
const isStaff = (req, res, next) => {
  console.log("🔵 isStaff middleware - User role:", req.user?.role);
  if (req.user.role !== "staff" && req.user.role !== "admin") {
    console.log("❌ Access denied. User role is:", req.user?.role);
    return res.status(403).json({ message: "Access denied. Staff only." });
  }
  console.log("✅ Staff access granted");
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