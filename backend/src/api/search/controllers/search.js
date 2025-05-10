'use strict';

/**
 * A search controller to find posts, comments and SubHETICVerses
 */
module.exports = createCoreController('api::search.search', ({ strapi }) => ({
  async search(ctx) {
    const { query, filter, sort, page = 1, pageSize = 10 } = ctx.request.query;
    
    // Build base query
    let searchQuery = {
      _q: query,
      _limit: parseInt(pageSize),
      _start: (parseInt(page) - 1) * parseInt(pageSize),
    };
    
    // Add filters
    if (filter === 'posts') {
      const results = await strapi.entityService.findMany('api::post.post', {
        filters: { title: { $containsi: query } },
        populate: ['author', 'sub_hetic_verse'],
        sort: sort === 'latest' ? 'createdAt:desc' : 'createdAt:asc',
        start: searchQuery._start,
        limit: searchQuery._limit
      });
      return { results, count: results.length };
    }
    
    if (filter === 'sub-hetic-verses') {
      const results = await strapi.entityService.findMany('api::sub-hetic-verse.sub-hetic-verse', {
        filters: { 
          $or: [
            { name: { $containsi: query } },
            { description: { $containsi: query } }
          ]
        },
        populate: ['author'],
        sort: sort === 'latest' ? 'createdAt:desc' : 'createdAt:asc',
        start: searchQuery._start,
        limit: searchQuery._limit
      });
      return { results, count: results.length };
    }
    
    if (filter === 'users') {
      const results = await strapi.entityService.findMany('plugin::users-permissions.user', {
        filters: { username: { $containsi: query } },
        start: searchQuery._start,
        limit: searchQuery._limit
      });
      return { results, count: results.length };
    }
    
    // Default combined search
    const posts = await strapi.entityService.findMany('api::post.post', {
      filters: { title: { $containsi: query } },
      populate: ['author', 'sub_hetic_verse'],
      start: searchQuery._start,
      limit: searchQuery._limit
    });
    
    const subHeticVerses = await strapi.entityService.findMany('api::sub-hetic-verse.sub-hetic-verse', {
      filters: { 
        $or: [
          { name: { $containsi: query } },
          { description: { $containsi: query } }
        ]
      },
      populate: ['author'],
      start: searchQuery._start,
      limit: searchQuery._limit
    });
    
    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: { username: { $containsi: query } },
      start: searchQuery._start,
      limit: searchQuery._limit
    });
    
    return {
      posts,
      subHeticVerses,
      users,
      count: {
        posts: posts.length,
        subHeticVerses: subHeticVerses.length,
        users: users.length,
        total: posts.length + subHeticVerses.length + users.length
      }
    };
  }
}));