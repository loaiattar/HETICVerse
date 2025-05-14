'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom join-request routes
 */
exports.default = {
    routes: [
        // Request to join a community
        {
            method: 'POST',
            path: '/communities/:id/join',
            handler: 'custom-join-request.createJoinRequest',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Cancel a join request
        {
            method: 'DELETE',
            path: '/join-requests/:id',
            handler: 'custom-join-request.cancelJoinRequest',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Approve a join request
        {
            method: 'POST',
            path: '/join-requests/:id/approve',
            handler: 'custom-join-request.approveJoinRequest',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Reject a join request
        {
            method: 'POST',
            path: '/join-requests/:id/reject',
            handler: 'custom-join-request.rejectJoinRequest',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get join requests for a community
        {
            method: 'GET',
            path: '/communities/:id/requests',
            handler: 'custom-join-request.getCommunityRequests',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get user's join requests
        {
            method: 'GET',
            path: '/my-join-requests',
            handler: 'custom-join-request.getUserRequests',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
