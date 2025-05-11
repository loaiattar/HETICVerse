'use strict';

const helmet = require('helmet');
const sanitizer = require('../utils/validators');

// Security middleware
const securityMiddleware = {
  // Apply helmet security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    },
    referrerPolicy: {
      policy: ['origin', 'unsafe-url']
    }
  }),
  
  // Input sanitization
  sanitizeInput: async (ctx, next) => {
    if (ctx.request.body) {
      ctx.request.body = sanitizer.sanitizeObject(ctx.request.body);
    }
    
    if (ctx.query) {
      ctx.query = sanitizer.sanitizeObject(ctx.query);
    }
    
    await next();
  },
  
  // API key validation
  validateApiKey: async (ctx, next) => {
    const apiKey = ctx.request.header['x-api-key'];
    
    if (!apiKey) {
      return ctx.unauthorized('API key required');
    }
    
    // Validate against your API keys (store in database or environment)
    const validKeys = process.env.API_KEYS?.split(',') || [];
    
    if (!validKeys.includes(apiKey)) {
      return ctx.unauthorized('Invalid API key');
    }
    
    await next();
  },
  
  // Request validation
  validateRequest: async (ctx, next) => {
    const { method, url } = ctx.request;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.\.\//, // Path traversal
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script injection
      /union.*select/gi, // SQL injection
      /exec\(/gi, // Code execution
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        strapi.log.warn(`Suspicious request blocked: ${method} ${url}`);
        return ctx.badRequest('Invalid request pattern detected');
      }
    }
    
    await next();
  },
  
  // File upload security
  secureFileUpload: async (ctx, next) => {
    if (ctx.request.files) {
      const files = ctx.request.files;
      
      for (const [key, file] of Object.entries(files)) {
        // Check file size
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          return ctx.badRequest('File too large');
        }
        
        // Check file extension
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.pdf'];
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (!allowedExts.includes(`.${ext}`)) {
          return ctx.badRequest('File type not allowed');
        }
        
        // Check MIME type
        const allowedMimes = [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'video/mp4', 'video/webm',
          'application/pdf'
        ];
        
        if (!allowedMimes.includes(file.type)) {
          return ctx.badRequest('Invalid file type');
        }
      }
    }
    
    await next();
  }
};

module.exports = securityMiddleware;