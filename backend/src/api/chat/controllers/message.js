'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::chat.message', ({ strapi }) => ({
  // Send a new message
  async create(ctx) {
    const { conversationId, content, attachments } = ctx.request.body;
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    // Check if user is a participant in the conversation
    const conversation = await strapi.entityService.findOne('api::chat.conversation', conversationId, {
      filters: {
        participants: {
          id: currentUser.id
        }
      }
    });
    
    if (!conversation) {
      return ctx.notFound('Conversation not found or you are not a participant');
    }
    
    // Create the message
    const message = await strapi.entityService.create('api::chat.message', {
      data: {
        sender: currentUser.id,
        conversation: conversationId,
        content,
        attachments,
        readBy: [currentUser.id], // Sender has read the message
        publishedAt: new Date()
      },
      populate: {
        sender: true
      }
    });
    
    // Update the conversation's lastMessageAt
    await strapi.entityService.update('api::chat.conversation', conversationId, {
      data: {
        lastMessageAt: new Date()
      }
    });
    
    // Emit event for real-time updates
    if (strapi.io) {
      strapi.io.to(`conversation:${conversationId}`).emit('newMessage', {
        message,
        conversationId
      });
    }
    
    return message;
  },
  
  // Get unread message count
  async getUnreadCount(ctx) {
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    const conversations = await strapi.entityService.findMany('api::chat.conversation', {
      filters: {
        participants: {
          id: currentUser.id
        }
      },
      populate: {
        messages: {
          filters: {
            $and: [
              { sender: { id: { $ne: currentUser.id } } },
              { readBy: { id: { $notIn: [currentUser.id] } } }
            ]
          }
        }
      }
    });
    
    const unreadCounts = conversations.map(conv => ({
      conversationId: conv.id,
      count: conv.messages.length
    }));
    
    const totalUnread = unreadCounts.reduce((sum, item) => sum + item.count, 0);
    
    return {
      total: totalUnread,
      byConversation: unreadCounts
    };
  }
}));