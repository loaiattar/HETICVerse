'use strict';

import { Server, Socket } from 'socket.io';

interface ChatUser {
  id: number;
  username: string;
  socketId: string;
  roomsJoined: Set<number>;
}

let io: Server;
const connectedUsers: Map<number, ChatUser> = new Map();

export default {
  // Initialize WebSocket server
  initialize({ strapi }) {
    io = new Server(strapi.server.httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Authentication middleware
    io.use(async (socket: Socket, next) => {
      try {
        const { token } = socket.handshake.auth;
        if (!token) {
          return next(new Error('Authentication token not provided'));
        }

        // Verify JWT token
        const { id } = await strapi.plugins['users-permissions'].services.jwt.verify(token);
        const user = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id },
          populate: '*'
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    // Handle socket connections
    io.on('connection', (socket: Socket) => {
      const user = socket.data.user;
      
      // Store connected user info
      const chatUser: ChatUser = {
        id: user.id,
        username: user.username,
        socketId: socket.id,
        roomsJoined: new Set()
      };
      connectedUsers.set(user.id, chatUser);
      
      // Broadcast user online status
      this.broadcastUserStatus(user.id, 'online');
      
      // Update user's presence status in the database
      this.updateUserPresence(user.id, 'online');
      
      console.log(`User connected: ${user.username} (${user.id})`);
      
      // Handle joining a chat room
      socket.on('joinRoom', async (roomId: number) => {
        try {
          // Check if user has access to the room
          const canJoin = await this.canUserJoinRoom(user.id, roomId);
          
          if (!canJoin) {
            socket.emit('error', {
              message: 'You do not have access to this chat room'
            });
            return;
          }
          
          // Join the room
          socket.join(`room:${roomId}`);
          chatUser.roomsJoined.add(roomId);
          
          // Notify room members
          socket.to(`room:${roomId}`).emit('userJoined', {
            userId: user.id,
            username: user.username
          });
          
          // Get recent messages
          const messages = await this.getRoomMessages(roomId, 50);
          socket.emit('recentMessages', messages);
          
          console.log(`User ${user.username} joined room ${roomId}`);
        } catch (error) {
          console.error(`Error joining room: ${error.message}`);
          socket.emit('error', {
            message: 'Failed to join chat room'
          });
        }
      });
      
      // Handle leaving a chat room
      socket.on('leaveRoom', (roomId: number) => {
        socket.leave(`room:${roomId}`);
        chatUser.roomsJoined.delete(roomId);
        
        // Notify room members
        socket.to(`room:${roomId}`).emit('userLeft', {
          userId: user.id,
          username: user.username
        });
        
        console.log(`User ${user.username} left room ${roomId}`);
      });
      
      // Handle sending a message
      socket.on('sendMessage', async (data: { roomId: number; content: string }) => {
        try {
          const { roomId, content } = data;
          
          // Validate user access to the room
          if (!chatUser.roomsJoined.has(roomId)) {
            socket.emit('error', {
              message: 'You must join the room before sending messages'
            });
            return;
          }
          
          // Create message in database using query API
          const newMessage = await strapi.db.query('api::chat-message.chat-message').create({
            data: {
              content,
              sentAt: new Date(),
              Read: false,
              isSystem: false
            }
          });
          
          // Connect relations separately
          await strapi.db.query('api::chat-message.chat-message').update({
            where: { id: newMessage.id },
            data: {
              sender: {
                connect: [{ id: user.id }]
              },
              chatRoom: {
                connect: [{ id: roomId }]
              }
            }
          });
          
          // Get the complete message with populated relations
          const messageWithSender = await strapi.db.query('api::chat-message.chat-message').findOne({
            where: { id: newMessage.id },
            populate: '*'
          });
          
          // Update room's last activity
          await strapi.db.query('api::chat-room.chat-room').update({
            where: { id: roomId },
            data: {
              lastActivity: new Date()
            }
          });
          
          // Format message for broadcast
          const formattedMessage = {
            id: messageWithSender.id,
            content: messageWithSender.content,
            sentAt: messageWithSender.sentAt,
            Read: messageWithSender.Read,
            sender: {
              id: messageWithSender.sender.id,
              username: messageWithSender.sender.username
            }
          };
          
          // Broadcast to room members
          io.to(`room:${roomId}`).emit('newMessage', formattedMessage);
          
          // Generate notifications for offline users
          this.notifyOfflineRoomMembers(roomId, user.id, formattedMessage);
          
          console.log(`User ${user.username} sent message in room ${roomId}`);
        } catch (error) {
          console.error(`Error sending message: ${error.message}`);
          socket.emit('error', {
            message: 'Failed to send message'
          });
        }
      });
      
      // Handle typing indicator
      socket.on('typing', (roomId: number) => {
        socket.to(`room:${roomId}`).emit('userTyping', {
          userId: user.id,
          username: user.username
        });
      });
      
      // Handle "stopped typing" indicator
      socket.on('stopTyping', (roomId: number) => {
        socket.to(`room:${roomId}`).emit('userStoppedTyping', {
          userId: user.id
        });
      });
      
      // Handle read receipts
      socket.on('markRead', async (messageIds: number[]) => {
        try {
          for (const messageId of messageIds) {
            await strapi.db.query('api::chat-message.chat-message').update({
              where: { id: messageId },
              data: { Read: true }
            });
          }
          
          // Broadcast read receipt event
          for (const roomId of chatUser.roomsJoined) {
            socket.to(`room:${roomId}`).emit('messagesRead', {
              userId: user.id,
              messageIds
            });
          }
        } catch (error) {
          console.error(`Error marking messages read: ${error.message}`);
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        // Remove user from connected users
        connectedUsers.delete(user.id);
        
        // Broadcast user offline status
        this.broadcastUserStatus(user.id, 'offline');
        
        // Update user's presence status in the database
        this.updateUserPresence(user.id, 'offline');
        
        console.log(`User disconnected: ${user.username} (${user.id})`);
      });
    });

    console.log('WebSocket server initialized');
  },
  
  // Broadcast message to all users in a room
  broadcastToRoom(roomId: number, event: string, data: any) {
    io.to(`room:${roomId}`).emit(event, data);
  },
  
  // Broadcast user status to relevant users
  broadcastUserStatus(userId: number, status: string) {
    // Get all rooms the user was part of
    const userRooms: number[] = [];
    for (const [id, user] of connectedUsers.entries()) {
      if (user.roomsJoined.size > 0) {
        for (const roomId of user.roomsJoined) {
          if (!userRooms.includes(roomId)) {
            userRooms.push(roomId);
          }
        }
      }
    }
    
    // Broadcast to all relevant rooms
    for (const roomId of userRooms) {
      io.to(`room:${roomId}`).emit('userStatus', {
        userId,
        status
      });
    }
  },
  
  // Check if user can join a chat room
  async canUserJoinRoom(userId: number, roomId: number) {
    try {
      const room = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id: roomId },
        populate: '*'
      });
      
      if (!room) {
        return false;
      }
      
      // Check if it's a direct chat
      if (room.type === 'direct') {
        // Check if user is a participant
        return room.participants.some(participant => participant.id === userId);
      }
      
      // For group chats, additional checks can be added here
      // For example, checking if the user is a member of the community
      
      return true;
    } catch (error) {
      console.error(`Error checking room access: ${error.message}`);
      return false;
    }
  },
  
  // Get recent messages for a room
  async getRoomMessages(roomId: number, limit = 50) {
    try {
      const messages = await strapi.db.query('api::chat-message.chat-message').findMany({
        where: {
          chatRoom: roomId
        },
        orderBy: { sentAt: 'desc' },
        populate: '*',
        limit
      });
      
      // Format messages
      return messages.map(message => ({
        id: message.id,
        content: message.content,
        sentAt: message.sentAt,
        Read: message.Read,
        sender: {
          id: message.sender.id,
          username: message.sender.username
        }
      })).reverse(); // Reverse to get chronological order
    } catch (error) {
      console.error(`Error getting room messages: ${error.message}`);
      return [];
    }
  },
  
  // Create notifications for offline room members
  async notifyOfflineRoomMembers(roomId: number, senderId: number, message: any) {
    try {
      const room = await strapi.db.query('api::chat-room.chat-room').findOne({
        where: { id: roomId },
        populate: '*'
      });
      
      if (!room || !room.participants) {
        return;
      }
      
      // Get IDs of all online users
      const onlineUserIds = Array.from(connectedUsers.keys());
      
      // Find participants who are offline
      const offlineParticipants = room.participants.filter(
        participant => !onlineUserIds.includes(participant.id) && participant.id !== senderId
      );
      
      // Create notifications for offline participants
      for (const participant of offlineParticipants) {
        // First create the notification
        const notification = await strapi.db.query('api::notification.notification').create({
          data: {
            type: 'message',
            content: `New message in ${room.name || 'a chat'}`,
            Read: false,
            date: new Date(),
            link: `/chat/${roomId}`
          }
        });
        
        // Then connect relations
        await strapi.db.query('api::notification.notification').update({
          where: { id: notification.id },
          data: {
            recipient: {
              connect: [{ id: participant.id }]
            },
            sender: {
              connect: [{ id: senderId }]
            }
          }
        });
      }
    } catch (error) {
      console.error(`Error creating message notifications: ${error.message}`);
    }
  },
  
  // Update user presence in database
  async updateUserPresence(userId: number, status: string) {
    try {
      // Check if presence record exists
      const presence = await strapi.db.query('api::user-presence.user-presence').findOne({
        where: { 'user.id': userId }
      });
      
      if (presence) {
        // Update existing presence
        await strapi.db.query('api::user-presence.user-presence').update({
          where: { id: presence.id },
          data: {
            status,
            lastActive: new Date()
          }
        });
      } else {
        // Create new presence
        const newPresence = await strapi.db.query('api::user-presence.user-presence').create({
          data: {
            status,
            lastActive: new Date()
          }
        });
        
        // Connect user relation
        await strapi.db.query('api::user-presence.user-presence').update({
          where: { id: newPresence.id },
          data: {
            user: {
              connect: [{ id: userId }]
            }
          }
        });
      }
    } catch (error) {
      console.error(`Error updating user presence: ${error.message}`);
    }
  },
  
  // Get socket.io server instance
  getIO() {
    return io;
  },
  
  // Check if a user is online
  isUserOnline(userId: number) {
    return connectedUsers.has(userId);
  },
  
  // Get all connected users
  getConnectedUsers() {
    return Array.from(connectedUsers.values());
  }
};