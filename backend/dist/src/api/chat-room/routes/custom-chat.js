'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom chat routes
 */
exports.default = {
    routes: [
        // Create direct chat
        {
            method: 'POST',
            path: '/chats/direct',
            handler: 'custom-chat.createDirectChat',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Create group chat
        {
            method: 'POST',
            path: '/chats/group',
            handler: 'custom-chat.createGroupChat',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get user's chat rooms
        {
            method: 'GET',
            path: '/chats',
            handler: 'custom-chat.getUserChats',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get chat room details
        {
            method: 'GET',
            path: '/chats/:id',
            handler: 'custom-chat.getChatRoom',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get chat messages (REST fallback)
        {
            method: 'GET',
            path: '/chats/:id/messages',
            handler: 'custom-chat.getChatMessages',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Add participant to group chat
        {
            method: 'POST',
            path: '/chats/:id/participants',
            handler: 'custom-chat.addParticipant',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Leave chat
        {
            method: 'DELETE',
            path: '/chats/:id/leave',
            handler: 'custom-chat.leaveChat',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Delete chat
        {
            method: 'DELETE',
            path: '/chats/:id',
            handler: 'custom-chat.deleteChat',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Mark all messages as read
        {
            method: 'POST',
            path: '/chats/:id/read',
            handler: 'custom-chat.markAllAsRead',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Update group chat
        {
            method: 'PUT',
            path: '/chats/:id',
            handler: 'custom-chat.updateGroupChat',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
