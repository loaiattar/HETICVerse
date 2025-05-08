/**
 * sub-hetic-verse controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::sub-hetic-verse.sub-hetic-verse', ({ strapi }) =>  ({
    // Method 1: Creating an entirely custom action
    async delete(ctx) {
      console.log(ctx.state.user);
      const subheticId = ctx.params.id;
      const subhetic = await strapi.documents('api::sub-hetic-verse.sub-hetic-verse').findOne({documentId: subheticId, populate: '*'});
      if (ctx.state.user.id !== subhetic.id) {
        return ctx.forbidden('Not allowed here')
      }
      return await super.delete(ctx);
    },
}));
