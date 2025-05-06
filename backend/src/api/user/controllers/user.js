import { factories } from '@strapi/strapi';
const { createCoreController } = factories;

export default createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  // GET /users/me
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Not authenticated');
    }

    // Optionally populate user relations like posts, comments, etc.
    const sanitizedUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['posts', 'comments'], // adjust to your actual relation names
    });

    // Limit returned fields
    const { id, username, email, posts, comments } = sanitizedUser;

    return {
      id,
      username,
      email,
      posts,
      comments,
    };
  },

  // PUT /users/me
  async updateMe(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Not authenticated');
    }

    const { bio, avatar } = ctx.request.body;

    const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data: { bio, avatar }, // add any custom fields you've added
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
    };
  }
}));
