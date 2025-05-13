'use strict';

/**
 * Custom search controller
 */

// Define the interface for the search results
interface SearchResults {
  posts?: any[];
  communities?: any[];
  comments?: any[];
  users?: any[];
  [key: string]: any; // This allows for additional properties if needed
}

export default {
  async search(ctx) {
    const { query, type } = ctx.request.query;
    
    if (!query) {
      return ctx.badRequest('Query parameter is required');
    }
    
    try {
      // Initialize with the proper type
      let results: SearchResults = {};
      
      // Rest of your code remains the same
      if (!type || type === 'posts') {
        results.posts = await strapi.db.query('api::post.post').findMany({
          where: {
            $or: [
              { title: { $containsi: query } },
              { content: { $containsi: query } }
            ]
          },
          populate: ['community', 'user'],
          limit: 20,
        });
      }
      
      // Search in communities
      if (!type || type === 'communities') {
        results.communities = await strapi.db.query('api::community.community').findMany({
          where: {
            $or: [
              { name: { $containsi: query } },
              { description: { $containsi: query } }
            ],
            visibility: true
          },
          populate: ['image'],
          limit: 20,
        });
      }
       // Search in comments
      if (!type || type === 'comments') {
        results.comments = await strapi.db.query('api::comment.comment').findMany({
          where: {
            content: { $containsi: query }
          },
          populate: ['post', 'user'],
          limit: 20,
        });
      }
      // Search in users
      if (!type || type === 'users') {
        results.users = await strapi.db.query('plugin::users-permissions.user').findMany({
          where: {
            username: { $containsi: query }
          },
          limit: 20,
        });
      }
      
      return results;
    } catch (err) {
      return ctx.badRequest('Search error', { error: err.message });
    }
  }
};