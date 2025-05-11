'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::chat.conversation', ({ strapi }) => ({
  // Create a new conversation
  async create(ctx) {
    const { users, name, isGroupChat = false } = ctx.request.body;
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    // Add current user to participants
    const allParticipants = [...new Set([currentUser.id, ...users])];
    
    // For direct messages (non-group), check if conversation already exists
    if (!isGroupChat && allParticipants.length === 2) {
      const existingConversations = await strapi.entityService.findMany('api::chat.conversation', {
        filters: {
          $and: [
            { isGroupChat: false },
            { participants: { id: { $in: allParticipants } } }
          ]
        },
        populate: ['participants']
      });
      
      const existingConversation = existingConversations.find(conv => 
        conv.participants.length === 2 && 
        conv.participants.every(p => allParticipants.includes(p.id))
      );
      
      if (existingConversation) {
        return existingConversation;
      }
    }
    
    // Create a new conversation
    const conversation = await strapi.entityService.create('api::chat.conversation', {
      data: {
        participants: allParticipants,
        name: isGroupChat ? name : null,
        isGroupChat,
        lastMessageAt: new Date(),
        publishedAt: new Date()
      },
      populate: ['participants']
    });
    
    return conversation;
  },
  
  // Get all conversations for the current user
  async findMine(ctx) {
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    const { page = 1, limit = 20 } = ctx.query;
    const start = (page - 1) * limit;
    
    const conversations = await strapi.entityService.findMany('api::chat.conversation', {
      filters: {
        participants: {
          id: currentUser.id
        }
      },
      sort: { lastMessageAt: 'desc' },
      start,
      limit: parseInt(limit),
      populate: {
        participants: {
          fields: ['id', 'username', 'email']
        },
        messages: {
          sort: 'createdAt:desc',
          limit: 1,
          populate: {
            sender: {
              fields: ['id', 'username']
            }
          }
        }
      }
    });
    
    return conversations;
  },
  
  // Get a specific conversation with messages
  async findOne(ctx) {
    const { id } = ctx.params;
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    const { page = 1, limit = 50 } = ctx.query;
    const start = (page - 1) * limit;
    
    // Check if user is a participant
    const conversation = await strapi.entityService.findOne('api::chat.conversation', id, {
      filters: {
        participants: {
          id: currentUser.id
        }
      },
      populate: {
        participants: {
          fields: ['id', 'username', 'email']
        }
      }
    });
    
    if (!conversation) {
      return ctx.notFound('Conversation not found or you are not a participant');
    }
    
    // Fetch messages for this conversation
    const messages = await strapi.entityService.findMany('api::chat.message', {
      filters: {
        conversation: id
      },
      sort: { createdAt: 'desc' },
      start,
      limit: parseInt(limit),
      populate: {
        sender: {
          fields: ['id', 'username']
        },
        readBy: {
          fields: ['id']
        }
      }
    });
    
    // Mark unread messages as read
    const unreadMessages = messages.filter(
      msg => msg.sender.id !== currentUser.id && 
      !msg.readBy.some(user => user.id === currentUser.id)
    );
    
    if (unreadMessages.length > 0) {
      await Promise.all(unreadMessages.map(msg => 
        strapi.entityService.update('api::chat.message', msg.id, {
          data: {
            readBy: [...msg.readBy.map(u => u.id), currentUser.id]
          }
        })
      ));
    }
    
    return {
      ...conversation,
      messages: messages.reverse() // Return in chronological order
    };
  }
}));