'use strict';

/**
 * Controller for handling user following relationships
 */
module.exports = {
  // POST /api/follow/:id
  async followUser(ctx) {
    const { id: targetUserId } = ctx.params;
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in to follow users');
    }
    
    if (targetUserId === currentUser.id.toString()) {
      return ctx.badRequest('You cannot follow yourself');
    }
    
    try {
      // Check if target user exists
      const targetUser = await strapi.entityService.findOne('plugin::users-permissions.user', targetUserId);
      
      if (!targetUser) {
        return ctx.notFound('User not found');
      }
      
      // Get current user's following list
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', currentUser.id, {
        populate: ['following']
      });
      
      // Check if already following
      const isAlreadyFollowing = user.following.some((following) => following.id.toString() === targetUserId);
      
      if (isAlreadyFollowing) {
        return ctx.badRequest('You are already following this user');
      }
      
      // Add target user to following
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', currentUser.id, {
        data: {
          following: {
            connect: [targetUserId]
          }
        }
      });
      
      // Create notification for the target user
      await strapi.entityService.create('api::notification.notification', {
        data: {
          type: 'follow',
          message: `${currentUser.username} started following you`,
          recipient: targetUserId,
          sender: currentUser.id,
          read: false
        }
      });
      
      return { success: true, message: `You are now following ${targetUser.username}` };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  
  // DELETE /api/follow/:id
  async unfollowUser(ctx) {
    const { id: targetUserId } = ctx.params;
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in to unfollow users');
    }
    
    try {
      // Check if target user exists
      const targetUser = await strapi.entityService.findOne('plugin::users-permissions.user', targetUserId);
      
      if (!targetUser) {
        return ctx.notFound('User not found');
      }
      
      // Remove target user from following
      await strapi.entityService.update('plugin::users-permissions.user', currentUser.id, {
        data: {
          following: {
            disconnect: [targetUserId]
          }
        }
      });
      
      return { success: true, message: `You have unfollowed ${targetUser.username}` };
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  
  // GET /api/follow/followers
  async getFollowers(ctx) {
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in to view followers');
    }
    
    try {
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', currentUser.id, {
        populate: ['followers']
      });
      
      return user.followers;
    } catch (error) {
      ctx.throw(500, error);
    }
  },
  
  // GET /api/follow/following
  async getFollowing(ctx) {
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in to view following');
    }
    
    try {
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', currentUser.id, {
        populate: ['following']
      });
      
      return user.following;
    } catch (error) {
      ctx.throw(500, error);
    }
  }
};