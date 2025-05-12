'use strict';

// Import custom middlewares
const errorHandler = require('../src/middlewares/errorHandler');
const { generalRateLimit, strictRateLimit, chatRateLimit, uploadRateLimit } = require('../src/middlewares/rateLimiter');

module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://market-assets.strapi.io'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://localhost:1337', 'http://localhost:3000', process.env.FRONTEND_URL],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::rate-limiter',
    config: {
      general: generalRateLimit,
      strict: strictRateLimit,
      chat: chatRateLimit,
      upload: uploadRateLimit
    }
  },
  {
    name: 'global::error-handler',
    config: {
      errorHandler
    }
  }
];
