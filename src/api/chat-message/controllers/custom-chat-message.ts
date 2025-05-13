'use strict';

/**
 * Custom chat message controller
 */

export default {
  async sendMessage(ctx) {
    const { content, chatRoomId, isSystem = false } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to send messages');
    }
    
    try {
      // Validation
      if (!content) return ctx.badRequest('Message content is required');
      if (!chatRoomId) return ctx.badRequest('Chat room ID is required');
      
      // Check if chat room exists
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id: chatRoomId },
        populate: { participants: true }
      });
      
      if (!chatRoom) return ctx.notFound('Chat room not found');
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) return ctx.forbidden('You are not a participant in this chat room');
      
      // Use service to create message
      const messageService = strapi.service('api::chat-message.custom-chat-message');
      const message = await messageService.createMessage({ content, chatRoomId, isSystem }, user);
      
      // Update chat room's last activity
      await strapi.db.query('api::chat-room.chat-room').update({
        where: { id: chatRoomId },
        data: { lastActivity: new Date() }
      });
      
      // Get complete message with relations
      const completeMessage = await messageService.getMessageWithRelations(message.id);
      
      // Notify participants
      await messageService.notifyParticipants(completeMessage, chatRoom, user);
      
      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          id: completeMessage.id,
          content: completeMessage.content,
          sentAt: completeMessage.sentAt,
          Read: completeMessage.Read,
          sender: {
            id: completeMessage.sender.id,
            username: completeMessage.sender.username
          }
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to send message', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
};