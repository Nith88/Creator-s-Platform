import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Protect routes (JWT Authentication)
// @access  Private
export const protect = async (req, res, next) => {
  try {
    let token;

    /* ========================= */
    /* 🔑 GET TOKEN FROM HEADER */
    /* ========================= */
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];
    }

    /* ========================= */
    /* ❌ NO TOKEN */
    /* ========================= */
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    /* ========================= */
    /* 🔐 VERIFY TOKEN */
    /* ========================= */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ========================= */
    /* 👤 FETCH USER FROM DB */
    /* ========================= */
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    /* ========================= */
    /* 📦 ATTACH USER TO REQUEST */
    /* ========================= */
    req.user = user;

    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    /* ========================= */
    /* ❌ TOKEN ERROR HANDLING */
    /* ========================= */
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};