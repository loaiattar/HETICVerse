'use strict';

/**
 * Custom follow routes
 */

export default {
  routes: [
    // Follow a user
    {
      method: 'POST',
      path: '/users/:id/follow',
      handler: 'custom-follow.followUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Unfollow a user
    {
      method: 'DELETE',
      path: '/users/:id/follow',
      handler: 'custom-follow.unfollowUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Block a user
    {
      method: 'POST',
      path: '/users/:id/block',
      handler: 'custom-follow.blockUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Unblock a user
    {
      method: 'DELETE',
      path: '/users/:id/block',
      handler: 'custom-follow.unblockUser',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get followers of a user
    {
      method: 'GET',
      path: '/users/:id/followers',
      handler: 'custom-follow.getFollowers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get users followed by a user
    {
      method: 'GET',
      path: '/users/:id/following',
      handler: 'custom-follow.getFollowing',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get follow status between current user and target user
    {
      method: 'GET',
      path: '/users/:id/follow-status',
      handler: 'custom-follow.getFollowStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Get suggested users to follow
    {
      method: 'GET',
      path: '/follow/suggestions',
      handler: 'custom-follow.suggestUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};