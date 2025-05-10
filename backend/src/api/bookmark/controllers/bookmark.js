'use strict';

/**
 * bookmark controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::bookmark.bookmark', ({ strapi }) => ({
  // Override the create method to automatically set the user
  async create(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to bookmark posts');
    }
    
    // Set the authenticated user as the owner
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id
    };
    
    // Check if this post is already bookmarked by the user
    const { post } = ctx.request.body.data;
    const existingBookmark = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
        user: user.id,
        post: post
      }
    });
    
    if (existingBookmark && existingBookmark.length > 0) {
      return ctx.badRequest('You have already bookmarked this post');
    }
    
    // Call the default create action
    const response = await super.create(ctx);
    return response;
  },
  
  // Custom method to get current user's bookmarks
  async getMyBookmarks(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your bookmarks');
    }
    
    const bookmarks = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
        user: user.id
      },
      populate: ['post', 'post.author', 'post.sub_hetic_verse'],
      sort: { createdAt: 'desc' }
    });
    
    return bookmarks;
  },
  
  // Custom method to get bookmarks by collection
  async getBookmarksByCollection(ctx) {
    const user = ctx.state.user;
    const { collection } = ctx.params;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your bookmarks');
    }
    
    const bookmarks = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
        user: user.id,
        collection: collection
      },
      populate: ['post', 'post.author', 'post.sub_hetic_verse'],
      sort: { createdAt: 'desc' }
    });
    
    return bookmarks;
  },
  
  // Custom method to get all collection names
  async getCollections(ctx) {
    const user = ctx.state.user;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your bookmark collections');
    }
    
    const bookmarks = await strapi.entityService.findMany('api::bookmark.bookmark', {
      filters: {
        user: user.id
      },
      fields: ['collection']
    });
    
    // Extract unique collection names
    const collections = [...new Set(bookmarks.map(bookmark => bookmark.collection).filter(Boolean))];
    
    return collections;
  }
}));