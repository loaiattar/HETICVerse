'use strict';

module.exports = {
  async search(ctx) {
    const { query, type = 'all' } = ctx.request.query;
    
    if (!query) {
      return ctx.badRequest('Query parameter is required');
    }
    
    try {
      let results = {
        posts: [],
        comments: [],
        subVerses: [],
        communities: [],
        users: []
      };
      
      if (type === 'all' || type === 'posts') {
        results.posts = await strapi.db.query('api::post.post').findMany({
          where: {
            $or: [
              { title: { $containsi: query } },
              { content: { $containsi: query } }
            ]
          },
          populate: ['author', 'sub_hetic_verse', 'community', 'votes']
        });
      }
      
      if (type === 'all' || type === 'comments') {
        results.comments = await strapi.db.query('api::comment.comment').findMany({
          where: {
            content: { $containsi: query }
          },
          populate: ['author', 'post']
        });
      }
      
      if (type === 'all' || type === 'subverses') {
        results.subVerses = await strapi.db.query('api::sub-hetic-verse.sub-hetic-verse').findMany({
          where: {
            $or: [
              { name: { $containsi: query } },
              { description: { $containsi: query } }
            ]
          },
          populate: ['author']
        });
      }
      
      if (type === 'all' || type === 'communities') {
        results.communities = await strapi.db.query('api::community.community').findMany({
          where: {
            $or: [
              { name: { $containsi: query } },
              { description: { $containsi: query } }
            ]
          },
          populate: ['members', 'creator']
        });
      }
      
      if (type === 'all' || type === 'users') {
        results.users = await strapi.db.query('plugin::users-permissions.user').findMany({
          where: {
            username: { $containsi: query }
          },
          populate: ['profile']
        });
      }
      
      // Sanitize user data
      results.users = results.users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        profile: user.profile
      }));
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return ctx.throw(500, 'An error occurred during search');
    }
  }
};