'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-presence.user-presence', ({ strapi }) => ({
  // Get current user's presence
  async me(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    let presence = await strapi.entityService.findMany('api::user-presence.user-presence', {
      filters: { user: user.id },
      populate: ['user']
    });

    if (!presence || presence.length === 0) {
      // Create presence record if doesn't exist
      presence = await strapi.entityService.create('api::user-presence.user-presence', {
        data: {
          user: user.id,
          status: 'online',
          lastActive: new Date(),
          publishedAt: new Date()
        },
        populate: ['user']
      });
    } else {
      presence = presence[0];
    }

    return presence;
  },

  // Update presence status
  async updateStatus(ctx) {
    const user = ctx.state.user;
    const { status, currentActivity, device } = ctx.request.body;

    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    let presence = await strapi.entityService.findMany('api::user-presence.user-presence', {
      filters: { user: user.id }
    });

    if (!presence || presence.length === 0) {
      // Create new presence
      presence = await strapi.entityService.create('api::user-presence.user-presence', {
        data: {
          user: user.id,
          status: status || 'online',
          lastActive: new Date(),
          currentActivity,
          device,
          publishedAt: new Date()
        },
        populate: ['user']
      });
    } else {
      // Update existing presence
      presence = await strapi.entityService.update('api::user-presence.user-presence', presence[0].id, {
        data: {
          status: status || 'online',
          lastActive: new Date(),
          currentActivity,
          device
        },
        populate: ['user']
      });
    }

    // Broadcast status change
    if (strapi.io) {
      strapi.io.emit('userStatusChanged', {
        userId: user.id,
        status: presence.status,
        lastActive: presence.lastActive,
        currentActivity: presence.currentActivity
      });
    }

    return presence;
  },

  // Get presence of friends/followed users
  async getFriendsStatus(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentication required');
    }

    // Get user's following list
    const currentUser = await strapi.entityService.findOne('plugin::users-permissions.user', user.id, {
      populate: ['following']
    });

    if (!currentUser.following || currentUser.following.length === 0) {
      return [];
    }

    // Get presence for all followed users
    const friendsStatus = await strapi.entityService.findMany('api::user-presence.user-presence', {
      filters: {
        user: {
          id: {
            $in: currentUser.following.map(friend => friend.id)
          }
        }
      },
      populate: ['user']
    });

    return friendsStatus;
  }
}));