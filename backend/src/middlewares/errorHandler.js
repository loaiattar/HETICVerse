'use strict';

module.exports = (err, req, res, next) => {
  // Log the error
  strapi.log.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.state?.user?.id
  });
  
  // Determine status code
  const statusCode = err.status || err.statusCode || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    },
    data: null
  };
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.error.code = 'VALIDATION_ERROR';
    errorResponse.error.details = err.details;
  }
  
  if (err.name === 'UnauthorizedError') {
    errorResponse.error.code = 'UNAUTHORIZED';
  }
  
  if (err.name === 'ForbiddenError') {
    errorResponse.error.code = 'FORBIDDEN';
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};