'use strict';

const rateLimit = require('express-rate-limit');

// General API rate limit
const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for sensitive operations
const strictRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: {
    success: false,
    error: {
      message: 'Rate limit exceeded for this sensitive operation',
      code: 'STRICT_RATE_LIMIT_EXCEEDED'
    }
  }
});

// Chat message rate limit
const chatRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 messages per minute
  message: {
    success: false,
    error: {
      message: 'Too many messages sent. Please slow down',
      code: 'CHAT_RATE_LIMIT_EXCEEDED'
    }
  }
});

// File upload rate limit
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 uploads per hour
  message: {
    success: false,
    error: {
      message: 'Upload limit exceeded. Try again in an hour',
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
    }
  }
});

module.exports = {
  generalRateLimit,
  strictRateLimit,
  chatRateLimit,
  uploadRateLimit
};