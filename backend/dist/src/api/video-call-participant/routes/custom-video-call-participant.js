'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom video call participant routes
 */
exports.default = {
    routes: [
        // Get participants for a video call
        {
            method: 'GET',
            path: '/video-calls/:id/participants',
            handler: 'custom-video-call-participant.getVideoCallParticipants',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get user's participation records
        {
            method: 'GET',
            path: '/my-video-call-participations',
            handler: 'custom-video-call-participant.getUserParticipations',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Update participant status
        {
            method: 'PUT',
            path: '/video-call-participants/:id',
            handler: 'custom-video-call-participant.updateParticipantStatus',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Leave a video call
        {
            method: 'POST',
            path: '/video-call-participants/:id/leave',
            handler: 'custom-video-call-participant.leaveVideoCall',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Kick a participant
        {
            method: 'POST',
            path: '/video-call-participants/:id/kick',
            handler: 'custom-video-call-participant.kickParticipant',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get participant statistics for a video call
        {
            method: 'GET',
            path: '/video-calls/:id/statistics',
            handler: 'custom-video-call-participant.getCallStatistics',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
