// middleware/middleware.js
import jwt from 'jsonwebtoken';
import User from '../auth/user.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in cookies only
    const token = req.cookies?.token;

    // If no token, continue without user (optional auth)
    if (!token) {
      req.user = null;
      return next();
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      // Token is invalid or expired
      console.log('Invalid token:', jwtError.message);
      req.user = null;
      return next();
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id)
      .select('-password -refreshToken -__v');

    // If user not found or inactive
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    // Any other error - log it but don't break the request
    console.error('Auth Middleware Error:', error);
    req.user = null;
    next();
  }
};

/**
 * Protect routes - Requires valid authentication
 * If no user, returns 401 error
 */
export const protect = async (req, res, next) => {
  try {
    // Check for token in cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id)
      .select('-password -refreshToken -__v');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated.'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Protect middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Optional authentication - Attaches user if token exists, doesn't error if not
 * Used for routes that work both with and without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id)
        .select('-password -refreshToken -__v');
      
      req.user = user || null;
    } catch (error) {
      // Token invalid but we don't want to block the request
      req.user = null;
    }
    
    next();

  } catch (error) {
    // Don't block the request on error
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

// Default export for backward compatibility
export default authMiddleware;