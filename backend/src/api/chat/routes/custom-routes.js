'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/conversations/me',
      handler: 'conversation.findMine',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/messages/unread',
      handler: 'message.getUnreadCount',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ]
};