/**
 * vote controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::vote.vote', ({ strapi }) => {
  return {
    async create(ctx) {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('You must be logged in to vote');
      }

      const { post, comment, value } = ctx.request.body.data;

      if (!post && !comment) {
        return ctx.badRequest('A vote must be linked to a post or a comment');
      }

      const existingVote = await strapi.entityService.findMany('api::vote.vote', {
        filters: {
          user: user.id,
          ...(post ? { post } : {}),
          ...(comment ? { comment } : {})
        },
      });

      if (existingVote.length > 0) {
        const updatedVote = await strapi.entityService.update('api::vote.vote', existingVote[0].id, {
          data: { value },
        });
        return { data: updatedVote };
      }

      //  Use core controller’s create
      const { create } = factories.createCoreController('api::vote.vote')({ strapi });
      return await create(ctx);
    },

    async find(ctx) {
      //  Use core controller’s find
      const { find } = factories.createCoreController('api::vote.vote')({ strapi });
      const { data, meta } = await find(ctx);

      const enrichedData = await Promise.all(data.map(async (vote) => {
        return await strapi.entityService.findOne('api::vote.vote', vote.id, {
          populate: ['post', 'comment', 'user'],
        });
      }));

      return { data: enrichedData, meta };
    }
  };
});
