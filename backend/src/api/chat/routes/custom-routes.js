module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/conversations/me',
      handler: 'conversation.findMine',
    },
    {
      method: 'GET',
      path: '/messages/unread',
      handler: 'message.getUnreadCount',
    }
  ]
};