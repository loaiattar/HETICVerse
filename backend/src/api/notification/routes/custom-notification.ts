'use strict';

/**
 * Custom notification routes
 */

module.exports = {  
  type: 'content-api',
  routes: [
    // Get current user's notifications
    {
      method: 'GET',
      path: '/notifications',
      handler: 'custom-notification.getMyNotifications',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      }
    },
    // Mark notification as read
    {
      method: 'PUT',
      path: '/notifications/:id/read',
      handler: 'custom-notification.markAsRead',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    // Mark all notifications as read
    {
      method: 'PUT',
      path: '/notifications/read-all',
      handler: 'custom-notification.markAllAsRead',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    // Delete a notification
    {
      method: 'DELETE',
      path: '/notifications/:id',
      handler: 'custom-notification.deleteNotification',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    // Delete all read notifications
    {
      method: 'DELETE',
      path: '/notifications/delete-read',
      handler: 'custom-notification.deleteAllRead',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    // Get notification preferences
    {
      method: 'GET',
      path: '/notification-preferences',
      handler: 'custom-notification.getPreferences',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    // Update notification preferences
    {
      method: 'PUT',
      path: '/notification-preferences',
      handler: 'custom-notification.updatePreferences',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    // Get notification count
    {
      method: 'GET',
      path: '/notifications/count',
      handler: 'custom-notification.getCount',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};