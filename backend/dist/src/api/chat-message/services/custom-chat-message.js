"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    async createMessage(data, user) {
        // Message creation logic
        const message = await strapi.db.query('api::chat-message.chat-message').create({
            data: {
                content: data.content,
                sentAt: new Date(),
                Read: false,
                isSystem: data.isSystem || false,
            }
        });
        // Connect relations
        await strapi.db.query('api::chat-message.chat-message').update({
            where: { id: message.id },
            data: {
                sender: {
                    connect: [{ id: user.id }]
                },
                chatRoom: {
                    connect: [{ id: data.chatRoomId }]
                }
            }
        });
        return message;
    },
    async getMessageWithRelations(messageId) {
        return await strapi.db.query('api::chat-message.chat-message').findOne({
            where: { id: messageId },
            populate: { sender: true, chatRoom: true }
        });
    },
    async notifyParticipants(message, chatRoom, sender) {
        try {
            const websocketService = strapi.service('api::chat-room.websocket');
            if (websocketService) {
                // Notification logic here
                // ...
            }
        }
        catch (error) {
            console.error('WebSocket notification error:', error);
        }
    }
};
