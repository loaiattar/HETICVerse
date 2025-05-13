'use strict';

/**
 * Custom user-presence controller
 */

export default {
  // Update or create a user's presence status
  updatePresence: async (ctx) => {
    const { user } = ctx.state; // Authenticated user
    const { status, location } = ctx.request.body;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Try to find existing presence record
      const existingPresence: any = await strapi.db
        .query('api::user-presence.user-presence')
        .findOne({
          where: { user: user.id }
        });
      
      // Get device info from request headers
      const deviceInfo = {
        userAgent: ctx.request.headers['user-agent'],
        ip: ctx.request.ip
      };
      
      if (existingPresence) {
        // Update existing presence
        const updatedPresence = await strapi.entityService.update(
          'api::user-presence.user-presence', 
          existingPresence.id, 
          {
            data: {
              status: status || existingPresence.status,
              lastActive: new Date(),
              deviceInfo,
              currentLocation: location || existingPresence.currentLocation
            }
          }
        );
        return updatedPresence;
      } else {
        // Create new presence record
        const newPresence = await strapi.entityService.create(
          'api::user-presence.user-presence', 
          {
            data: {
              user: user.id,
              status: status || 'online',
              lastActive: new Date(),
              deviceInfo,
              currentLocation: location || null
            }
          }
        );
        return newPresence;
      }
    } catch (err) {
      return ctx.badRequest('Failed to update presence', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Get online users (optionally filtered by location)
  getOnlineUsers: async (ctx) => {
    const { location, limit = '20', page = '1' } = ctx.request.query;
    
    try {
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      
      // Define time threshold (users active in the last 5 minutes are considered online)
      const onlineThreshold = new Date();
      onlineThreshold.setMinutes(onlineThreshold.getMinutes() - 5);
      
      // Prepare query
      const whereCondition: any = {
        lastActive: { $gte: onlineThreshold },
        status: { $ne: 'offline' }
      };
      
      // Filter by location if provided
      if (location) {
        whereCondition.currentLocation = location;
      }
      
      // Find online users
      const presences = await strapi.db
        .query('api::user-presence.user-presence')
        .findMany({
          where: whereCondition,
          orderBy: { lastActive: 'desc' },
          populate: ['user'],
          limit: limitNum,
          offset: (pageNum - 1) * limitNum
        } as any);
      
      // Count total online users
      const count = await strapi.db
        .query('api::user-presence.user-presence')
        .count({ where: whereCondition } as any);
      
      // Format response
      const formattedPresences = presences.map(presence => ({
        id: presence.id,
        status: presence.status,
        lastActive: presence.lastActive,
        currentLocation: presence.currentLocation,
        user: {
          id: presence.user.id,
          username: presence.user.username,
          // Add other fields you want to expose, like avatar
        }
      }));
      
      return {
        data: formattedPresences,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch online users', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Mark user as offline (for clean logout)
  markOffline: async (ctx) => {
    const { user } = ctx.state; // Authenticated user
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Find existing presence record
      const existingPresence: any = await strapi.db
        .query('api::user-presence.user-presence')
        .findOne({
          where: { user: user.id }
        });
      
      if (existingPresence) {
        // Update status to offline
        const updatedPresence = await strapi.entityService.update(
          'api::user-presence.user-presence', 
          existingPresence.id, 
          {
            data: {
              status: 'offline',
              lastActive: new Date()
            }
          }
        );
        return updatedPresence;
      } else {
        return ctx.notFound('No presence record found for this user');
      }
    } catch (err) {
      return ctx.badRequest('Failed to mark user offline', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
};