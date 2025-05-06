import { sanitize } from '@strapi/utils';
import { factories } from '@strapi/strapi';
const { createCoreController } = factories;

export default createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to view this');
    }

    const sanitizedUser = await sanitize.contentAPI.output(user, strapi.getModel('plugin::users-permissions.user'));

    return sanitizedUser;
  },
}));
