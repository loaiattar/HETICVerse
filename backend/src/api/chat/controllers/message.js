module.exports = createCoreController('api::chat.message', ({ strapi }) => ({
  // Send a new message
  async create(ctx) {
    const { conversationId, content, attachments } = ctx.request.body;
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    // Check if user is a participant in the conversation
    const conversation = await strapi.db.query('api::chat.conversation').findOne({
      where: {
        id: conversationId,
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
        readBy: [currentUser.id] // Sender has read the message
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
    strapi.io?.to(`conversation:${conversationId}`).emit('newMessage', {
      message,
      conversationId
    });
    
    return message;
  },
  
  // Get unread message count
  async getUnreadCount(ctx) {
    const currentUser = ctx.state.user;
    
    if (!currentUser) {
      return ctx.unauthorized('You must be logged in');
    }
    
    const conversationsWithUnread = await strapi.db.query('api::chat.conversation').findMany({
      where: {
        participants: {
          id: currentUser.id
        }
      },
      populate: {
        messages: {
          where: {
            sender: {
              id: { $ne: currentUser.id }
            },
            readBy: {
              id: { $notIn: [currentUser.id] }
            }
          }
        }
      }
    });
    
    const unreadCounts = conversationsWithUnread.map(conv => ({
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