'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom search routes
 */
exports.default = {
    routes: [
        {
            method: 'GET',
            path: '/custom-search',
            handler: 'custom-search.search',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
