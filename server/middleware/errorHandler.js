/**
 * Global Error Handler Middleware
 * Centralized error handling for all routes
 */

function errorHandler(err, req, res, next) {
  // Log error
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    status: err.status || 500,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'File size exceeds 10MB limit',
        code: 'FILE_TOO_LARGE',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        message: 'Unexpected file field',
        code: 'INVALID_FILE',
      });
    }
  }

  // MongoDB errors
  if (err.name === 'MongoServerError') {
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate key error',
        field: Object.keys(err.keyPattern)[0],
      });
    }
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message),
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired',
    });
  }

  // Default error response
  const statusCode = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack }),
  });
}

/**
 * 404 Handler Middleware
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
}

module.exports = { errorHandler, notFoundHandler };
