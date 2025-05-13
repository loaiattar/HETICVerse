'use strict';

/**
 * Custom user-presence service
 */

export default {
  // Function to update last active time for a user
  updateLastActive: async (userId) => {
    try {
      const presence = await strapi.db
        .query('api::user-presence.user-presence')
        .findOne({
          where: { user: userId }
        });
      
      if (presence) {
        return await strapi.entityService.update(
          'api::user-presence.user-presence', 
          presence.id, 
          {
            data: {
              lastActive: new Date()
            }
          }
        );
      }
      return null;
    } catch (error) {
      console.error('Error updating last active time:', error);
      return null;
    }
  },
  
  // Function to clean up old presence records
  cleanupOldRecords: async (daysThreshold = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);
      
      const oldRecords = await strapi.db
        .query('api::user-presence.user-presence')
        .findMany({
          where: {
            lastActive: { $lt: cutoffDate },
            status: 'offline'
          }
        });
      
      // Delete old offline records
      for (const record of oldRecords) {
        await strapi.entityService.delete(
          'api::user-presence.user-presence', 
          record.id
        );
      }
      
      return { deletedCount: oldRecords.length };
    } catch (error) {
      console.error('Error cleaning up old presence records:', error);
      return { deletedCount: 0, error: error.message };
    }
  }
};