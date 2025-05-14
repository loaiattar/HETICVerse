'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom bookmark routes
 */
exports.default = {
    routes: [
        // Get trending posts
        {
            method: 'GET',
            path: '/trending-posts',
            handler: 'custom-bookmark.getTrending',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Bookmark a post
        {
            method: 'POST',
            path: '/posts/:id/bookmark',
            handler: 'custom-bookmark.bookmarkPost',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Remove a bookmark
        {
            method: 'DELETE',
            path: '/posts/:id/bookmark',
            handler: 'custom-bookmark.removeBookmark',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        // Get user's bookmarks
        {
            method: 'GET',
            path: '/my-bookmarks',
            handler: 'custom-bookmark.getUserBookmarks',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
