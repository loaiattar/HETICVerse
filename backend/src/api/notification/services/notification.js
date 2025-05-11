module.exports = {
    createNotification: async (data) => {
      return await strapi.entityService.create('api::notification.notification', {
        data
      });
    },
    
    getUnreadCount: async (userId) => {
      return await strapi.db.query('api::notification.notification').count({
        where: { 
          recipient: userId,
          read: false
        }
      });
    },
    
    markAsRead: async (notificationId) => {
      return await strapi.entityService.update('api::notification.notification', notificationId, {
        data: { read: true }
      });
    },
    
    markAllAsRead: async (userId) => {
      const notifications = await strapi.db.query('api::notification.notification').findMany({
        where: { 
          recipient: userId,
          read: false
        }
      });
      
      for (const notification of notifications) {
        await strapi.entityService.update('api::notification.notification', notification.id, {
          data: { read: true }
        });
      }
      
      return { success: true };
    }
  };