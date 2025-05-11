'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user-presence/me',
      handler: 'user-presence.me',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/user-presence/status',
      handler: 'user-presence.updateStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user-presence/friends',
      handler: 'user-presence.getFriendsStatus',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ]
};