'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom video call routes
 */
exports.default = {
    routes: [
        // Create a new video call
        {
            method: 'POST',
            path: '/video-calls',
            handler: 'custom-video-call.createVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Update a video call
        {
            method: 'PUT',
            path: '/video-calls/:id',
            handler: 'custom-video-call.updateVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Delete a video call
        {
            method: 'DELETE',
            path: '/video-calls/:id',
            handler: 'custom-video-call.deleteVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get a single video call
        {
            method: 'GET',
            path: '/video-calls/:id',
            handler: 'custom-video-call.getVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get video calls (with filtering)
        {
            method: 'GET',
            path: '/video-calls',
            handler: 'custom-video-call.getVideoCalls',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Join a video call
        {
            method: 'POST',
            path: '/video-calls/:id/join',
            handler: 'custom-video-call.joinVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Leave a video call
        {
            method: 'POST',
            path: '/video-calls/:id/leave',
            handler: 'custom-video-call.leaveVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Update participant settings
        {
            method: 'PUT',
            path: '/video-calls/:id/settings',
            handler: 'custom-video-call.updateParticipantSettings',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
