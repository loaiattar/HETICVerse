'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom user-presence routes
 */
exports.default = {
    routes: [
        {
            method: 'POST',
            path: '/user-presence/update',
            handler: 'custom-user-presence.updatePresence',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/user-presence/online',
            handler: 'custom-user-presence.getOnlineUsers',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/user-presence/offline',
            handler: 'custom-user-presence.markOffline',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
