'use strict';

const { Server } = require('socket.io');

module.exports = async () => {
  // Socket.io setup
  const io = new Server(strapi.server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true
    }
  });
  
  // Store the io instance in strapi
  strapi.io = io;
  
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const { token } = socket.handshake.auth;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Extract token without Bearer prefix if it exists
      const jwtToken = token.replace('Bearer ', '');
      
      // Validate JWT token
      const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(jwtToken);
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Store user in socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId}`);
    
    // Join user's private room
    socket.join(`user:${userId}`);
    
    // Join all conversations the user is part of
    socket.on('joinConversations', async () => {
      try {
        const conversations = await strapi.entityService.findMany('api::chat.conversation', {
          filters: {
            participants: {
              id: userId
            }
          }
        });
        
        conversations.forEach(conv => {
          socket.join(`conversation:${conv.id}`);
        });
        
        console.log(`User ${userId} joined ${conversations.length} conversation rooms`);
      } catch (error) {
        console.error('Error joining conversations:', error);
      }
    });
    
    // Handle typing events
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('userTyping', {
        userId,
        username: socket.user.username,
        conversationId,
        isTyping
      });
    });
    
    // Handle joining a specific conversation
    socket.on('joinConversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    });
    
    // Handle leaving a conversation
    socket.on('leaveConversation', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    // =============================================================
    // Video/Audio Call Events
    // =============================================================
    
    // Join call room
    socket.on('joinCallRoom', ({ roomId }) => {
      socket.join(`call:${roomId}`);
      console.log(`User ${userId} joined call room ${roomId}`);
      
      // Notify others in the room
      socket.to(`call:${roomId}`).emit('userJoinedCall', {
        userId,
        username: socket.user.username
      });
    });
    
    // Leave call room
    socket.on('leaveCallRoom', ({ roomId }) => {
      socket.leave(`call:${roomId}`);
      console.log(`User ${userId} left call room ${roomId}`);
      
      // Notify others in the room
      socket.to(`call:${roomId}`).emit('userLeftCall', {
        userId,
        username: socket.user.username
      });
    });
    
    // WebRTC signaling
    socket.on('offer', ({ roomId, offer, to }) => {
      console.log(`Offer from ${userId} to ${to} in room ${roomId}`);
      socket.to(`call:${roomId}`).emit('offer', {
        offer,
        from: userId,
        to
      });
    });
    
    socket.on('answer', ({ roomId, answer, to }) => {
      console.log(`Answer from ${userId} to ${to} in room ${roomId}`);
      socket.to(`call:${roomId}`).emit('answer', {
        answer,
        from: userId,
        to
      });
    });
    
    socket.on('ice-candidate', ({ roomId, candidate, to }) => {
      console.log(`ICE candidate from ${userId} to ${to} in room ${roomId}`);
      socket.to(`call:${roomId}`).emit('ice-candidate', {
        candidate,
        from: userId,
        to
      });
    });
    
    // Toggle video/audio
    socket.on('toggleVideo', ({ roomId, enabled }) => {
      socket.to(`call:${roomId}`).emit('userToggleVideo', {
        userId,
        enabled
      });
    });
    
    socket.on('toggleAudio', ({ roomId, enabled }) => {
      socket.to(`call:${roomId}`).emit('userToggleAudio', {
        userId,
        enabled
      });
    });
    
    // Screen sharing
    socket.on('startScreenShare', ({ roomId }) => {
      socket.to(`call:${roomId}`).emit('userStartScreenShare', {
        userId
      });
    });
    
    socket.on('stopScreenShare', ({ roomId }) => {
      socket.to(`call:${roomId}`).emit('userStopScreenShare', {
        userId
      });
    });

    // =============================================================
    // User Presence Events
    // =============================================================
    
    // Update user presence to online
    const updatePresence = async (status = 'online', currentActivity = null) => {
      try {
        let presence = await strapi.entityService.findMany('api::user-presence.user-presence', {
          filters: { user: userId }
        });

        if (!presence || presence.length === 0) {
          presence = await strapi.entityService.create('api::user-presence.user-presence', {
            data: {
              user: userId,
              status,
              lastActive: new Date(),
              currentActivity,
              publishedAt: new Date()
            }
          });
        } else {
          presence = await strapi.entityService.update('api::user-presence.user-presence', presence[0].id, {
            data: {
              status,
              lastActive: new Date(),
              currentActivity
            }
          });
        }

        // Broadcast to friends
        io.emit('userStatusChanged', {
          userId,
          status,
          lastActive: presence.lastActive,
          currentActivity
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    };

    // User comes online
    updatePresence('online');

    // Handle status changes
    socket.on('updateStatus', async ({ status, currentActivity }) => {
      await updatePresence(status, currentActivity);
    });

    // Handle activity updates
    socket.on('updateActivity', async ({ activity }) => {
      await updatePresence(null, activity);
    });

    // Heartbeat to keep user online
    socket.on('heartbeat', async () => {
      await updatePresence('online');
    });
    
    // When user disconnects
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${userId}`);
      
      // Update user presence to offline
      await updatePresence('offline');
      
      // You might want to handle ending any active calls when user disconnects
      // This is optional but recommended for better UX
    });
  });
};