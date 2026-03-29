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
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token found in authorization header' });
    }

    // Verify token with secret key
    const secretKey = process.env.JWT_SECRET || 'your_jwt_secret_key';
    console.log(`🔐 JWT Verification: TOKEN_LENGTH=${token.length}, SECRET_SET=${!!process.env.JWT_SECRET}`);
    
    let decoded;
    try {
      decoded = jwt.verify(token, secretKey);
    } catch (jwtError) {
      console.error(`❌ JWT Verification Failed: ${jwtError.message}`);
      console.error(`   Token: ${token.substring(0, 50)}...`);
      console.error(`   Secret Key Used: ${secretKey === 'your_jwt_secret_key' ? 'DEFAULT (PROBLEM!)' : 'FROM .env'}`);
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token has expired' });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token signature' });
      } else {
        return res.status(401).json({ error: `JWT Error: ${jwtError.message}` });
      }
    }
    
    // Attach decoded user info to request object for use in controllers
    req.user = decoded; // Contains: id, email, role, etc.
    console.log(`✅ Token verified for user: ${decoded.email} [role: ${decoded.role}]`);
    next();
  } catch (error) {
    console.error(`❌ Unexpected Error in authenticate: ${error.message}`);
    res.status(401).json({ error: `Authentication error: ${error.message}` });
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
