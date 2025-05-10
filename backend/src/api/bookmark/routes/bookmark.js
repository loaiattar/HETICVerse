'use strict';

/**
 * bookmark router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::bookmark.bookmark', {
  config: {
    find: {
      policies: ['global::isOwner']
    },
    findOne: {
      policies: ['global::isOwner']
    },
    create: {
      policies: []
    },
    update: {
      policies: ['global::isOwner']
    },
    delete: {
      policies: ['global::isOwner']
    }
  }
});