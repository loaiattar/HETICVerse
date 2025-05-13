'use strict';

/**
 * Custom user-presence routes
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/user-presence/update',
      handler: 'custom-user-presence.updatePresence',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user-presence/online',
      handler: 'custom-user-presence.getOnlineUsers',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/user-presence/offline',
      handler: 'custom-user-presence.markOffline',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};