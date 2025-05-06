/**
 * post controller
 */
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx); // Calls the default controller find method
    const sortedData = data.sort((a, b) =>
      new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );
    return { data: sortedData, meta };
  },
}));