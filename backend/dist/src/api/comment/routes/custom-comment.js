"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    routes: [
        // Route to create a new comment or reply
        {
            method: 'POST',
            path: '/comments/create',
            handler: 'custom-comment.createComment',
            config: {
                policies: [],
                auth: {
                    scope: ['api::comment.comment']
                },
            },
        },
        // Route to get all comments for a product
        {
            method: 'GET',
            path: '/comments/product/:productId',
            handler: 'custom-comment.getProductComments',
            config: {
                policies: [],
                auth: false, // Public access for reading comments
            },
        }
    ],
};
