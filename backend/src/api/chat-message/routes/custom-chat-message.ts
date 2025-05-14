// src/api/chat-message/routes/custom-routes.ts (or whatever your route file is named)
export default {
  routes: [
    {
      method: 'POST',
      path: '/chat-messages/send',
      handler: 'custom-chat-message.sendMessage',  
      config: {
        policies: [],
        auth: {
          scope: ['api::chat-message.chat-message']
        },
      },
    },
  ],
};