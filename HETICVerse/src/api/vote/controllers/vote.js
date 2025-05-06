/**
 * vote controller
 */

import { factories } from '@strapi/strapi';
const { createCoreController } = factories;

export default createCoreController('api::vote.vote', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to vote');
    }

    const { post, comment, value } = ctx.request.body.data;

    // Enforce vote on either post or comment
    if (!post && !comment) {
      return ctx.badRequest('A vote must be linked to a post or a comment');
    }

    // Check for existing vote by user on the same post/comment
    const existingVote = await strapi.entityService.findMany('api::vote.vote', {
      filters: {
        user: user.id,
        ...(post ? { post: post } : {}),
        ...(comment ? { comment: comment } : {})
      },
    });

    if (existingVote.length > 0) {
      // Update the existing vote instead of creating a new one
      const updatedVote = await strapi.entityService.update('api::vote.vote', existingVote[0].id, {
        data: { value },
      });
      return { data: updatedVote };
    }

    // No existing vote found, create new one
    const response = await super.create(ctx);
    return response;
  },

  async find(ctx) {
    const { data, meta } = await super.find(ctx);

    // Optional: include post/comment/user in the result
    const enrichedData = await Promise.all(data.map(async (vote) => {
      const populated = await strapi.entityService.findOne('api::vote.vote', vote.id, {
        populate: ['post', 'comment', 'user'],
      });
      return populated;
    }));

    return { data: enrichedData, meta };
  }
}));
