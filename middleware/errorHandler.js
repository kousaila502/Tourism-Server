// Helper function to handle different error types
const handleErrorType = (error) => {
  // MongoDB validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return {
      status: 400,
      message: 'Validation failed',
      errors: messages
    };
  }

  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return {
      status: 400,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`,
      errors: [`${field} must be unique`]
    };
  }

  // MongoDB cast error (invalid ObjectId)
  if (error.name === 'CastError') {
    return {
      status: 400,
      message: 'Invalid ID format',
      errors: ['Please provide a valid ID']
    };
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      status: 401,
      message: 'Invalid token',
      errors: ['Please login again']
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      status: 401,
      message: 'Token expired',
      errors: ['Please login again']
    };
  }

  // File upload errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      status: 400,
      message: 'File too large',
      errors: ['File size must be less than 5MB']
    };
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      status: 400,
      message: 'Invalid file upload',
      errors: ['Unexpected file field']
    };
  }

  // Default error
  return {
    status: error.status || error.statusCode || 500,
    message: error.message || 'Something went wrong',
    errors: error.errors || []
  };
};

// Main error handler middleware
const errorHandler = (error, req, res, next) => {
  // Handle the error
  const handledError = handleErrorType(error);
  
  // Log error details (always log, regardless of environment)
  console.error(`
🚨 Error occurred:
📍 Route: ${req.method} ${req.originalUrl}
🕐 Time: ${new Date().toISOString()}
💾 Status: ${handledError.status}
💬 Message: ${handledError.message}
${error.stack ? `📋 Stack: ${error.stack}` : ''}
${req.body && Object.keys(req.body).length ? `📤 Body: ${JSON.stringify(req.body, null, 2)}` : ''}
  `);

  // Send response
  const response = {
    success: false,
    message: handledError.message,
    timestamp: new Date().toISOString()
  };

  // Add errors array if it exists
  if (handledError.errors && handledError.errors.length > 0) {
    response.errors = handledError.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
    response.details = {
      route: `${req.method} ${req.originalUrl}`,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(handledError.status).json(response);
};

// Async error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Async response wrapper middleware
const asyncResponseHandler = (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    try {
      return originalSend.call(this, data);
    } catch (error) {
      next(error);
    }
  };
  next();
};

module.exports = {
  errorHandler,
  asyncHandler,
  asyncResponseHandler
};