/**
 * post controller
 */

import { factories } from '@strapi/strapi';
const { createCoreController } = factories;

export default createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    const sortedData = data.sort((a, b) =>
      new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );

    return { data: sortedData, meta };
  },
}));
