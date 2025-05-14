'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Get trending posts based on user reactions and bookmarks
     */
    getTrending: async (ctx) => {
        const { limit = '10', page = '1', timeRange = 'week', category, community } = ctx.request.query;
        try {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Define the time threshold based on the requested range
            const now = new Date();
            let dateThreshold = new Date();
            switch (timeRange) {
                case 'day':
                    dateThreshold.setDate(now.getDate() - 1);
                    break;
                case 'week':
                    dateThreshold.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    dateThreshold.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    dateThreshold.setFullYear(now.getFullYear() - 1);
                    break;
                case 'all':
                    dateThreshold = new Date(0); // Beginning of time
                    break;
                default:
                    dateThreshold.setDate(now.getDate() - 7); // Default to week
            }
            // Build filters object for the query
            const filters = {
                createdAt: { $gte: dateThreshold }
            };
            // Add category filter if provided
            if (category) {
                filters.category = category;
            }
            // Add community filter if provided
            if (community) {
                // Find the community by slug
                const communityEntity = await strapi.db.query('api::community.community').findOne({
                    where: { slug: community }
                });
                if (communityEntity) {
                    filters.community = communityEntity.id;
                }
                else {
                    return ctx.notFound('Community not found');
                }
            }
            // First, get total bookmark counts for each post
            const knex = strapi.db.connection;
            // Create a subquery to count bookmarks per post
            const bookmarkCounts = await knex('bookmarks')
                .select('bookmark_post_links.post_id')
                .count('bookmarks.id as bookmark_count')
                .innerJoin('bookmark_post_links', 'bookmarks.id', 'bookmark_post_links.bookmark_id')
                .innerJoin('posts', 'bookmark_post_links.post_id', 'posts.id')
                .where('posts.created_at', '>=', dateThreshold)
                .groupBy('bookmark_post_links.post_id');
            // Map of post IDs to bookmark counts
            const postBookmarks = {};
            bookmarkCounts.forEach((row) => {
                postBookmarks[row.post_id] = parseInt(row.bookmark_count);
            });
            // Now get posts
            const posts = await strapi.entityService.findMany('api::post.post', {
                filters,
                sort: { createdAt: 'desc' },
                populate: ['community', 'image'],
                limit: limitNum * 3, // Get more posts initially to filter down later
            });
            // Get comment counts for each post (since comments may not be directly populated)
            const commentCounts = await knex('comments')
                .select('comment_post_links.post_id')
                .count('comments.id as comment_count')
                .innerJoin('comment_post_links', 'comments.id', 'comment_post_links.comment_id')
                .whereIn('comment_post_links.post_id', posts.map(post => post.id))
                .groupBy('comment_post_links.post_id');
            // Map of post IDs to comment counts
            const postComments = {};
            commentCounts.forEach((row) => {
                postComments[row.post_id] = parseInt(row.comment_count);
            });
            // Calculate a trending score for each post
            const scoredPosts = posts.map(post => {
                const commentCount = postComments[post.id] || 0;
                const voteScore = post.vote || 0; // Using 'vote' instead of 'votes'
                const bookmarkCount = postBookmarks[post.id] || 0;
                // Recency factor - newer posts get a boost
                const ageInHours = (now.getTime() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
                const recencyFactor = Math.max(0, 1 - (ageInHours / (24 * 7))); // Decays over a week
                // Calculate trending score - adjust weights as needed
                const trendingScore = (commentCount * 3 + // Each comment is worth 3 points
                    voteScore * 1 + // Each vote is worth 1 point
                    bookmarkCount * 5 // Each bookmark is worth 5 points
                ) * (0.7 + recencyFactor * 0.3); // Recency boost
                return {
                    ...post,
                    _trendingScore: trendingScore,
                    _commentCount: commentCount,
                    _bookmarkCount: bookmarkCount
                };
            });
            // Sort by trending score and take requested page
            const sortedPosts = scoredPosts
                .sort((a, b) => b._trendingScore - a._trendingScore)
                .slice((pageNum - 1) * limitNum, pageNum * limitNum);
            // Clean up the internal scoring properties before returning
            const cleanedPosts = sortedPosts.map(post => {
                const { _trendingScore, _commentCount, _bookmarkCount, ...cleanPost } = post;
                return {
                    ...cleanPost,
                    commentCount: _commentCount,
                    bookmarkCount: _bookmarkCount,
                    trendingScore: Math.round(_trendingScore * 100) / 100
                };
            });
            return {
                data: cleanedPosts,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    timeRange,
                    total: scoredPosts.length,
                    hasMore: pageNum * limitNum < scoredPosts.length
                }
            };
        }
        catch (err) {
            console.error(err);
            return ctx.badRequest('Failed to fetch trending posts', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Bookmark a post for the current user
     */
    bookmarkPost: async (ctx) => {
        const { id: postId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to bookmark posts');
        }
        try {
            // Check if post exists
            const post = await strapi.entityService.findOne('api::post.post', postId);
            if (!post) {
                return ctx.notFound('Post not found');
            }
            // Check if bookmark already exists
            const existingBookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
                where: {
                    $and: [
                        { 'user.id': user.id }, // Use proper dot notation
                        { 'post.id': postId } // Use proper dot notation
                    ]
                }
            });
            if (existingBookmark) {
                return {
                    data: existingBookmark,
                    message: 'Post is already bookmarked'
                };
            }
            // Create new bookmark
            const bookmark = await strapi.entityService.create('api::bookmark.bookmark', {
                data: {
                    date: new Date(),
                    user: user.id,
                    post: postId
                }
            });
            return {
                data: bookmark,
                message: 'Post bookmarked successfully'
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to bookmark post', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Remove a bookmark for the current user
     */
    removeBookmark: async (ctx) => {
        const { id: postId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to manage bookmarks');
        }
        try {
            // Find the bookmark to delete
            const bookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
                where: {
                    $and: [
                        { 'user.id': user.id }, // Use proper dot notation
                        { 'post.id': postId } // Use proper dot notation
                    ]
                }
            });
            if (!bookmark) {
                return ctx.notFound('Bookmark not found');
            }
            // Delete the bookmark
            await strapi.entityService.delete('api::bookmark.bookmark', bookmark.id);
            return {
                message: 'Bookmark removed successfully'
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to remove bookmark', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get all bookmarks for the current user
     */
    getUserBookmarks: async (ctx) => {
        const { limit = '20', page = '1' } = ctx.request.query;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to view your bookmarks');
        }
        try {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Get bookmarks for the current user
            const bookmarks = await strapi.entityService.findMany('api::bookmark.bookmark', {
                filters: {
                    'user.id': user.id // Use proper dot notation
                },
                populate: {
                    post: {
                        populate: ['community', 'image']
                    }
                },
                sort: { date: 'desc' },
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });
            // Count total bookmarks
            const count = await strapi.db.query('api::bookmark.bookmark').count({
                where: { 'user.id': user.id }
            });
            return {
                data: bookmarks,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch bookmarks', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }
};
