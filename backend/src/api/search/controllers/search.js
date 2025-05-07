'use strict';

/**
 * A search controller to find posts, comments and SubHETICVerses
 */
module.exports = {
  // GET /api/search?query=something&type=all
  async search(ctx) {
    try {
      const { query, type = 'all' } = ctx.query;
      
      if (!query) {
        return ctx.badRequest('Search query is required');
      }

      // Default search results structure
      const results = {
        posts: [],
        comments: [],
        subHETICVerses: []
      };

      // Helper function to create regex for search
      const createSearchPattern = (query) => {
        return { $containsi: query };
      };

      // Search posts
      if (type === 'all' || type === 'posts') {
        const posts = await strapi.entityService.findMany('api::post.post', {
          filters: {
            $or: [
              { title: createSearchPattern(query) },
              { content: createSearchPattern(query) }
            ]
          },
          populate: ['author', 'sub_hetic_verse'],
          limit: 10
        });
        
        results.posts = posts;
      }

      // Search comments
      if (type === 'all' || type === 'comments') {
        const comments = await strapi.entityService.findMany('api::comment.comment', {
          filters: {
            content: createSearchPattern(query)
          },
          populate: ['post', 'post.author'],
          limit: 10
        });
        
        results.comments = comments;
      }

      // Search SubHETICVerses
      if (type === 'all' || type === 'subHETICVerses') {
        const subHETICVerses = await strapi.entityService.findMany('api::sub-hetic-verse.sub-hetic-verse', {
          filters: {
            $or: [
              { name: createSearchPattern(query) },
              { description: createSearchPattern(query) }
            ]
          },
          populate: ['author'],
          limit: 10
        });
        
        results.subHETICVerses = subHETICVerses;
      }

      return results;
    } catch (error) {
      ctx.throw(500, error);
    }
  }
};