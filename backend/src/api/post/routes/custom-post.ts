'use strict';

/**
 * Custom post routes
 */

export default {
  routes: [
    // Create a new post
    {
      method: 'POST',
      path: '/posts',
      handler: 'custom-post.createPost',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Update a post
    {
      method: 'PUT',
      path: '/posts/:id',
      handler: 'custom-post.updatePost',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Delete a post
    {
      method: 'DELETE',
      path: '/posts/:id',
      handler: 'custom-post.deletePost',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get a single post
    {
      method: 'GET',
      path: '/posts/:id',
      handler: 'custom-post.getPost',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get posts (with filtering and sorting)
    {
      method: 'GET',
      path: '/posts',
      handler: 'custom-post.getPosts',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Vote on a post
    {
      method: 'POST',
      path: '/posts/:id/vote',
      handler: 'custom-post.votePost',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get user feed
    {
      method: 'GET',
      path: '/feed',
      handler: 'custom-post.getFeed',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get trending posts
    {
      method: 'GET',
      path: '/trending',
      handler: 'custom-post.getTrending',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get saved posts
    {
      method: 'GET',
      path: '/saved-posts',
      handler: 'custom-post.getSavedPosts',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};