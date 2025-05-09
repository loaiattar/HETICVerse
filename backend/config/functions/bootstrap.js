const { Server } = require('socket.io');

module.exports = async () => {
  // Socket.io setup
  const io = new Server(strapi.server, {
    cors: {
      origin: strapi.config.get('server.cors.origin', '*'),
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
      
      // Validate JWT token
      const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
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
      const conversations = await strapi.db.query('api::chat.conversation').findMany({
        where: {
          participants: {
            id: userId
          }
        }
      });
      
      conversations.forEach(conv => {
        socket.join(`conversation:${conv.id}`);
      });
      
      console.log(`User ${userId} joined ${conversations.length} conversation rooms`);
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
    
    // When user disconnects
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });
};