/**
 * post controller
 */
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);
    
    // Hide author details for anonymous posts
    const processedData = data.map(post => {
      if (post.attributes.isAnonymous) {
        // Hide author details but keep author ID for permission checks
        return {
          ...post,
          attributes: {
            ...post.attributes,
            author: {
              data: {
                id: post.attributes.author.data.id,
                attributes: {
                  username: post.attributes.anonymousName || 'Anonymous',
                  // Add any other minimal info needed
                }
              }
            }
          }
        };
      }
      return post;
    });
    
    const sortedData = processedData.sort((a, b) =>
      new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
    );
    
    return { data: sortedData, meta };
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a post');
    }

    // Set the author
    ctx.request.body.data.author = user.id;
    
    // Handle anonymous flag and name
    if (ctx.request.body.data.isAnonymous) {
      ctx.request.body.data.anonymousName = ctx.request.body.data.anonymousName || 'Anonymous';
    }

    const result = await super.create(ctx);
    
    // Hide author details in response if anonymous
    if (result.data.attributes.isAnonymous) {
      result.data.attributes.author = {
        data: {
          id: result.data.attributes.author.data.id,
          attributes: {
            username: result.data.attributes.anonymousName || 'Anonymous'
          }
        }
      };
    }
    
    return result;
  },

  async findOne(ctx) {
    const result = await super.findOne(ctx);
    
    if (!result.data) return result;
    
    // Hide author details if anonymous
    if (result.data.attributes.isAnonymous) {
      result.data.attributes.author = {
        data: {
          id: result.data.attributes.author.data.id,
          attributes: {
            username: result.data.attributes.anonymousName || 'Anonymous'
          }
        }
      };
    }
    
    return result;
  }
}));