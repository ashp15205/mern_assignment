const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1. Get token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    next(new AppError('Invalid token. Please log in again.', 401));
  }
};
