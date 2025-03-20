// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'No user found with this id' });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Your account is inactive. Please contact admin.' });
    }
    
    // Add user to request object
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Authorize based on user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    
    next();
  };
};