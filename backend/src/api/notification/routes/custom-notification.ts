'use strict';

/**
 * Custom notification routes
 */

export default {
  routes: [
    // Get current user's notifications
    {
      method: 'GET',
      path: '/notifications',
      handler: 'custom-notification.getMyNotifications',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Mark notification as read
    {
      method: 'PUT',
      path: '/notifications/:id/read',
      handler: 'custom-notification.markAsRead',
      config: {
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
        policies: [],
        middlewares: [],
      },
    },
  ],
};