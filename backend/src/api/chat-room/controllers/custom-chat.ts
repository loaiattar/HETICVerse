'use strict';

/**
 * Custom chat controller
 */

export default {
  // Create a new direct chat between two users
  createDirectChat: async (ctx) => {
    const { recipientId } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    if (!recipientId) {
      return ctx.badRequest('Recipient ID is required');
    }
    
    try {
      // Check if recipient exists
      const recipient = await strapi.entityService.findOne(
        'plugin::users-permissions.user', 
        recipientId,
        { populate: '*' }
      );
      
      if (!recipient) {
        return ctx.notFound('Recipient not found');
      }
      
      // Check if a direct chat already exists between these users
      const existingChat = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: {
          type: 'direct',
          $and: [
            { 'participants.id': user.id },
            { 'participants.id': recipientId }
          ]
        },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (existingChat) {
        return {
          id: existingChat.id,
          type: existingChat.type,
          name: existingChat.name,
          lastActivity: existingChat.lastActivity,
          participants: existingChat.participants.map((p: { id: string; username: string }) => ({
            id: p.id,
            username: p.username
          }))
        };
      }
      
      // Create a new direct chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').create({
        data: {
          type: 'direct',
          lastActivity: new Date()
        }
      });
      
      // Add participants to chat room using relation query
      await strapi.db.query('api::chat-room.chat-room').update({
        where: { id: chatRoom.id },
        data: {
          participants: {
            connect: [{ id: user.id }, { id: recipientId }]
          }
        }
      });
      
      // Get the updated chat room with participants
      const updatedChatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id: chatRoom.id },
        populate: '*'
      });
      
      return {
        id: updatedChatRoom.id,
        type: updatedChatRoom.type,
        name: updatedChatRoom.name,
        lastActivity: updatedChatRoom.lastActivity,
        participants: updatedChatRoom.participants.map(p => ({
          id: p.id,
          username: p.username
        }))
      };
    } catch (err) {
      return ctx.badRequest('Failed to create chat', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Create a group chat
  createGroupChat: async (ctx) => {
    const { name, participantIds } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    if (!name) {
      return ctx.badRequest('Group name is required');
    }
    
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
      return ctx.badRequest('At least one additional participant is required');
    }
    
    try {
      // Ensure current user is included in participants
      const allParticipantIds = [user.id, ...participantIds.filter(id => id !== user.id)];
      
      // Create a new group chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').create({
        data: {
          type: 'group',
          name,
          lastActivity: new Date()
        }
      });
      
      // Add participants to chat room
      await strapi.db.query('api::chat-room.chat-room').update({
        where: { id: chatRoom.id },
        data: {
          participants: {
            connect: allParticipantIds.map(id => ({ id }))
          }
        }
      });
      
      // Get the updated chat room with participants
      const updatedChatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id: chatRoom.id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      // Get WebSocket service
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Notify online participants
      for (const participant of updatedChatRoom.participants) {
        if (websocketService.isUserOnline(participant.id)) {
          websocketService.broadcastUserStatus(participant.id, {
            event: 'groupChatCreated',
            data: {
              id: updatedChatRoom.id,
              name: updatedChatRoom.name,
              creator: {
                id: user.id,
                username: user.username
              }
            }
          });
        } else if (participant.id !== user.id) {
          // Create notification for offline participants
          await strapi.db.query('api::notification.notification').create({
            data: {
              type: 'invite',
              content: `${user.username} added you to the group chat "${name}"`,
              Read: false,
              date: new Date(),
              link: `/chat/${updatedChatRoom.id}`,
              recipient: {
                connect: [{ id: participant.id }]
              },
              sender: {
                connect: [{ id: user.id }]
              }
            }
          });
        }
      }
      
      return {
        id: updatedChatRoom.id,
        type: updatedChatRoom.type,
        name: updatedChatRoom.name,
        lastActivity: updatedChatRoom.lastActivity,
        participants: updatedChatRoom.participants.map(p => ({
          id: p.id,
          username: p.username
        }))
      };
    } catch (err) {
      return ctx.badRequest('Failed to create group chat', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Get user's chat rooms
  getUserChats: async (ctx) => {
    const { limit = '20', page = '1' } = ctx.request.query;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      const limitNum = parseInt(limit as string);
      const pageNum = parseInt(page as string);
      
      // Get chat rooms the user is part of
      const chatRooms = await strapi.db.query('api::chat-room.chat-room').findMany({
        where: {
          participants: {
            id: user.id
          }
        },
        orderBy: { lastActivity: 'desc' },
        populate: '*', // Use wildcard to populate all relations
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });
      
      // Get unread message counts for each room
      const roomIds = chatRooms.map(room => room.id);
      const unreadCounts = await Promise.all(
        roomIds.map(async (roomId) => {
          const count = await strapi.db.query('api::chat-message.chat-message').count({
            where: {
              chatRoom: roomId,
              Read: false,
              sender: {
                id: { $ne: user.id }
              }
            }
          });
          return { roomId, count };
        })
      );
      
      // Create a lookup map for unread counts
      const unreadCountMap = {};
      unreadCounts.forEach(({ roomId, count }) => {
        unreadCountMap[roomId] = count;
      });
      
      // Format response
      const formattedRooms = chatRooms.map(room => {
        // For direct chats, set the other user's name as the chat name
        let chatName = room.name;
        let otherUser = null;
        
        if (room.type === 'direct') {
          const otherParticipant = room.participants.find(p => p.id !== user.id);
          if (otherParticipant) {
            chatName = otherParticipant.username;
            otherUser = {
              id: otherParticipant.id,
              username: otherParticipant.username
            };
          }
        }
        
        return {
          id: room.id,
          type: room.type,
          name: chatName,
          lastActivity: room.lastActivity,
          unreadCount: unreadCountMap[room.id] || 0,
          participants: room.participants.map(p => ({
            id: p.id,
            username: p.username
          })),
          otherUser
        };
      });
      
      // Count total chat rooms
      const count = await strapi.db.query('api::chat-room.chat-room').count({
        where: {
          participants: {
            id: user.id
          }
        }
      });
      
      return {
        data: formattedRooms,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch chat rooms', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Get chat room details
  getChatRoom: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // For direct chats, set the other user's name as the chat name
      let chatName = chatRoom.name;
      let otherUser = null;
      
      if (chatRoom.type === 'direct') {
        const otherParticipant = chatRoom.participants.find(p => p.id !== user.id);
        if (otherParticipant) {
          chatName = otherParticipant.username;
          otherUser = {
            id: otherParticipant.id,
            username: otherParticipant.username
          };
        }
      }
      
      // Get WebSocket service to check online status
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Format response
      return {
        id: chatRoom.id,
        type: chatRoom.type,
        name: chatName,
        lastActivity: chatRoom.lastActivity,
        participants: chatRoom.participants.map(p => ({
          id: p.id,
          username: p.username,
          isOnline: websocketService.isUserOnline(p.id)
        })),
        otherUser
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch chat room details', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Get chat messages (REST fallback for history)
  getChatMessages: async (ctx) => {
    const { id } = ctx.params;
    const { limit = '50', before } = ctx.request.query;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: { participants: true }
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // Build filter for messages
      const filters: any = {
        chatRoom: id
      };
      
      // Add filter for pagination based on message ID
      if (before) {
        filters.id = { $lt: before };
      }
      
      // Get messages
      const messages = await strapi.db.query('api::chat-message.chat-message').findMany({
        where: filters,
        orderBy: { sentAt: 'desc' },
        populate: '*', // Use wildcard to populate all relations
        limit: parseInt(limit as string)
      });
      
      // Format messages
      const formattedMessages = messages.map(message => ({
        id: message.id,
        content: message.content,
        sentAt: message.sentAt,
        Read: message.Read,
        sender: {
          id: message.sender.id,
          username: message.sender.username
        }
      })).reverse(); // Reverse to get chronological order
      
      return formattedMessages;
    } catch (err) {
      return ctx.badRequest('Failed to fetch chat messages', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Add participant to a group chat
  addParticipant: async (ctx) => {
    const { id } = ctx.params;
    const { userId } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    if (!userId) {
      return ctx.badRequest('User ID is required');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if it's a group chat
      if (chatRoom.type !== 'group') {
        return ctx.badRequest('Participants can only be added to group chats');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // Check if the user to add exists
      const userToAdd = await strapi.entityService.findOne(
        'plugin::users-permissions.user', 
        userId,
        { populate: '*' }
      );
      
      if (!userToAdd) {
        return ctx.notFound('User not found');
      }
      
      // Check if user is already a participant
      const isAlreadyParticipant = chatRoom.participants.some(p => p.id === userId);
      if (isAlreadyParticipant) {
        return ctx.badRequest('User is already a participant');
      }
      
      // Add user to participants through relations
      await strapi.db.query('api::chat-room.chat-room').update({
        where: { id },
        data: {
          participants: {
            connect: [{ id: userId }]
          }
        }
      });
      
      // Create system message
      await strapi.db.query('api::chat-message.chat-message').create({
        data: {
          content: `${user.username} added ${userToAdd.username} to the chat`,
          isSystem: true,
          Read: false,
          sentAt: new Date(),
          sender: {
            connect: [{ id: user.id }]
          },
          chatRoom: {
            connect: [{ id }]
          }
        }
      });
      
      // Get WebSocket service
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Notify room participants
      websocketService.broadcastToRoom(id, 'participantAdded', {
        userId,
        username: userToAdd.username,
        addedBy: {
          id: user.id,
          username: user.username
        }
      });
      
      // Create notification for the added user
      await strapi.db.query('api::notification.notification').create({
        data: {
          type: 'invite',
          content: `${user.username} added you to the group chat "${chatRoom.name}"`,
          Read: false,
          date: new Date(),
          link: `/chat/${id}`,
          recipient: {
            connect: [{ id: userId }]
          },
          sender: {
            connect: [{ id: user.id }]
          }
        }
      });
      
      return {
        success: true,
        message: `${userToAdd.username} added to the chat`
      };
    } catch (err) {
      return ctx.badRequest('Failed to add participant', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Leave a chat room
  leaveChat: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // Direct chats can't be left, only deleted
      if (chatRoom.type === 'direct') {
        return ctx.badRequest('Direct chats cannot be left, only deleted');
      }
      
      // Remove user from participants
      await strapi.db.query('api::chat-room.chat-room').update({
        where: { id },
        data: {
          participants: {
            disconnect: [{ id: user.id }]
          }
        }
      });
      
      // Check if any participants remain
      const updatedChatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (updatedChatRoom.participants.length === 0) {
        // If no participants left, delete the chat room
        await strapi.db.query('api::chat-room.chat-room').delete({
          where: { id }
        });
        
        return {
          success: true,
          message: 'Chat room deleted as you were the last participant'
        };
      }
      
      // Create system message
      await strapi.db.query('api::chat-message.chat-message').create({
        data: {
          content: `${user.username} left the chat`,
          isSystem: true,
          Read: false,
          sentAt: new Date(),
          sender: {
            connect: [{ id: user.id }]
          },
          chatRoom: {
            connect: [{ id }]
          }
        }
      });
      
      // Get WebSocket service
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Notify room participants
      websocketService.broadcastToRoom(id, 'participantLeft', {
        userId: user.id,
        username: user.username
      });
      
      return {
        success: true,
        message: 'You have left the chat'
      };
    } catch (err) {
      return ctx.badRequest('Failed to leave chat', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Delete a chat room (admin or creator only)
  deleteChat: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // For direct chats, either participant can delete
      if (chatRoom.type === 'direct') {
        // Delete all messages
        await strapi.db.query('api::chat-message.chat-message').deleteMany({
          where: { chatRoom: id }
        });
        
        // Delete the chat room
        await strapi.db.query('api::chat-room.chat-room').delete({
          where: { id }
        });
        
        return {
          success: true,
          message: 'Chat deleted successfully'
        };
      }
      
      // For group chats, check if user is an admin
      const isAdmin = user.role?.type === 'admin';
      
      if (!isAdmin) {
        return ctx.forbidden('Only administrators can delete group chats');
      }
      
      // Delete all messages
      await strapi.db.query('api::chat-message.chat-message').deleteMany({
        where: { chatRoom: id }
      });
      
      // Delete the chat room
      await strapi.db.query('api::chat-room.chat-room').delete({
        where: { id }
      });
      
      // Get WebSocket service
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Notify all participants that the chat has been deleted
      for (const participant of chatRoom.participants) {
        if (websocketService.isUserOnline(participant.id)) {
          websocketService.broadcastUserStatus(participant.id, {
            event: 'chatDeleted',
            data: {
              id: chatRoom.id,
              name: chatRoom.name,
              deletedBy: {
                id: user.id,
                username: user.username
              }
            }
          });
        }
      }
      
      return {
        success: true,
        message: 'Chat deleted successfully'
      };
    } catch (err) {
      return ctx.badRequest('Failed to delete chat', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Mark all messages in a chat room as read
  markAllAsRead: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // Find all unread messages not sent by current user
      const messages = await strapi.db.query('api::chat-message.chat-message').findMany({
        where: {
          chatRoom: id,
          Read: false,
          sender: {
            id: { $ne: user.id }
          }
        }
      });
      
      // Update all messages as read
      for (const message of messages) {
        await strapi.db.query('api::chat-message.chat-message').update({
          where: { id: message.id },
          data: { Read: true }
        });
      }
      
      // Get WebSocket service
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Broadcast read receipts
      websocketService.broadcastToRoom(id, 'messagesRead', {
        userId: user.id,
        messageIds: messages.map(m => m.id)
      });
      
      return {
        success: true,
        count: messages.length,
        message: `Marked ${messages.length} messages as read`
      };
    } catch (err) {
      return ctx.badRequest('Failed to mark messages as read', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  // Update a group chat (rename)
  updateGroupChat: async (ctx) => {
    const { id } = ctx.params;
    const { name } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return ctx.badRequest('Valid group name is required');
    }
    
    try {
      // Get chat room
      const chatRoom = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id },
        populate: '*' // Use wildcard to populate all relations
      });
      
      if (!chatRoom) {
        return ctx.notFound('Chat room not found');
      }
      
      // Check if it's a group chat
      if (chatRoom.type !== 'group') {
        return ctx.badRequest('Only group chats can be renamed');
      }
      
      // Check if user is a participant
      const isParticipant = chatRoom.participants.some(p => p.id === user.id);
      if (!isParticipant) {
        return ctx.forbidden('You are not a participant in this chat room');
      }
      
      // Update chat room
      await strapi.db.query('api::chat-room.chat-room').update({
        where: { id },
        data: { name: name.trim() }
      });
      
      // Create system message
      await strapi.db.query('api::chat-message.chat-message').create({
        data: {
          content: `${user.username} renamed the group to "${name.trim()}"`,
          isSystem: true,
          Read: false,
          sentAt: new Date(),
          sender: {
            connect: [{ id: user.id }]
          },
          chatRoom: {
            connect: [{ id }]
          }
        }
      });
      
      // Get WebSocket service
      const websocketService = strapi.service('api::websocket.websocket');
      
      // Notify room participants
      websocketService.broadcastToRoom(id, 'chatRenamed', {
        id,
        name: name.trim(),
        renamedBy: {
          id: user.id,
          username: user.username
        }
      });
      
      return {
        success: true,
        message: 'Group chat renamed successfully'
      };
    } catch (err) {
      return ctx.badRequest('Failed to rename group chat', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
};
