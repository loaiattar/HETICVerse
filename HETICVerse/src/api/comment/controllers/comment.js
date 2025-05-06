/**
 * comment controller
 */

import { factories } from '@strapi/strapi';
const { createCoreController } = factories;

export default createCoreController('api::comment.comment', ({ strapi }) => ({
  async find(ctx) {
    // Fetch with relations: post and author
    const { data, meta } = await super.find(ctx);

    // Sort by createdAt (newest first)
    const sortedData = data.sort((a, b) =>
      new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );

    return { data: sortedData, meta };
  },

  async create(ctx) {
    // Get the current user from context if needed
    const user = ctx.state.user;

    // auto-link user to comment
    if (user) {
      ctx.request.body.data.author = user.id;
    }

    // Proceed with default create
    const response = await super.create(ctx);
    return response;
  },
}));
