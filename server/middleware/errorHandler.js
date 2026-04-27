// Global Error Handler Middleware
// Centralized error handling for all routes and controllers

export const errorHandler = (err, req, res, next) => {
  // Set default values if not already set
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found with ID: ${err.value}`;
    err.statusCode = 400;
    err.message = message;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    err.statusCode = 400;
    err.message = message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid JWT token';
    err.statusCode = 401;
    err.message = message;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'JWT token has expired';
    err.statusCode = 401;
    err.message = message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    err.statusCode = 400;
    err.message = messages;
  }

  // Send error response with consistent format
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Show stack trace in development
  });
};

// Async error wrapper - wraps async functions to catch errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
