'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom community routes
 */
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/communities/discover',
            handler: 'custom-community.discover',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
