const jwt = require('jsonwebtoken');

/**
 * Role-Based Access Control Middleware
 * Handles JWT authentication and role-based authorization
 * Protects admin endpoints and enforces user roles
 */

/**
 * Middleware: authenticate
 * Verifies JWT token from Authorization header
 * Extracts user information and attaches to req.user
 * 
 * Header format: Authorization: Bearer <token>
 * 
 * On success: Calls next() with req.user populated
 * On failure: Returns 401 Unauthorized
 */
exports.authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header (format: "Bearer TOKEN")
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Verify token with secret key
    const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key_bluesense_2026';
    console.log(`🔐 JWT Verification: SECRET_KEY=${secretKey}, TOKEN_LENGTH=${token.length}`);
    
    const decoded = jwt.verify(token, secretKey);
    
    // Attach decoded user info to request object for use in controllers
    req.user = decoded; // Contains: _id, email, role, etc.
    next();
  } catch (error) {
    console.error(`❌ JWT Error: ${error.message}`);
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware: authorize
 * Checks if authenticated user has required role(s)
 * Returns middleware function that checks user role against allowed roles
 * 
 * Usage: authorize('Admin') or authorize('Admin', 'Staff')
 * Returns 403 Forbidden if user doesn't have required role
 * 
 * @param {...string} roles - Allowed roles (e.g., 'Admin', 'Staff')
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user's role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};
