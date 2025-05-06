/**
 * comment controller
 */

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comment.comment', ({ strapi }) => {
  return {
    async find(ctx) {
      const { data, meta } = await super.find(ctx);
      const sortedData = data.sort((a, b) =>
        new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
      );
      return { data: sortedData, meta };
    },

    async create(ctx) {
      const user = ctx.state.user;
      if (user) {
        ctx.request.body.data.author = user.id;
      }
      return await super.create(ctx);
    },
  };
});


