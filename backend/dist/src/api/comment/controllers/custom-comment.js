"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Create a new comment
     */
    async createComment(ctx) {
        try {
            const { content, productId, parentCommentId } = ctx.request.body;
            if (!content || !productId) {
                return ctx.badRequest('Missing content or productId');
            }
            // Validate product exists
            const product = await strapi.db.query('api::product.product').findOne({
                where: { id: productId }
            });
            if (!product) {
                return ctx.notFound('Product not found');
            }
            // Create the comment
            const newComment = await strapi.db.query('api::comment.comment').create({
                data: {
                    content,
                    product: productId,
                    author: ctx.state.user.id,
                    parentComment: parentCommentId || null
                }
            });
            return ctx.created(newComment);
        }
        catch (err) {
            strapi.log.error('Error creating comment:', err);
            return ctx.internalServerError('Could not create comment');
        }
    },
    /**
     * Get comments for a product with nested replies
     */
    async getProductComments(ctx) {
        const { productId } = ctx.params;
        const { page = '1', limit = '10', parentOnly = 'true' } = ctx.query;
        try {
            const pageNumber = Math.max(parseInt(page, 10), 1);
            const pageSize = Math.max(parseInt(limit, 10), 1);
            if (isNaN(pageNumber) || isNaN(pageSize)) {
                return ctx.badRequest('Invalid pagination parameters');
            }
            // Check if the product exists
            const product = await strapi.db.query('api::product.product').findOne({
                where: { id: productId }
            });
            if (!product) {
                return ctx.notFound('Product not found');
            }
            // Build filter for parent comments
            const queryFilters = {
                product: { id: productId }
            };
            if (parentOnly === 'true') {
                queryFilters.parentComment = null;
            }
            // Fetch top-level (parent) comments
            const parentComments = await strapi.db.query('api::comment.comment').findMany({
                where: queryFilters,
                populate: {
                    author: {
                        select: ['id', 'username', 'email', 'avatar']
                    }
                },
                orderBy: { createdAt: 'desc' },
                offset: (pageNumber - 1) * pageSize,
                limit: pageSize
            });
            // Get total count for pagination
            const total = await strapi.db.query('api::comment.comment').count({
                where: queryFilters
            });
            // Fetch replies for these parent comments
            const parentIds = parentComments.map((comment) => comment.id);
            const replies = await strapi.db.query('api::comment.comment').findMany({
                where: {
                    parentComment: { id: { $in: parentIds } }
                },
                populate: {
                    author: {
                        select: ['id', 'username', 'email', 'avatar']
                    }
                },
                orderBy: { createdAt: 'asc' }
            });
            // Group replies by parentComment ID
            const repliesByParent = {};
            replies.forEach((reply) => {
                const parentId = reply.parentComment.id;
                if (!repliesByParent[parentId]) {
                    repliesByParent[parentId] = [];
                }
                repliesByParent[parentId].push(reply);
            });
            // Attach replies to their parent comments
            const commentsWithReplies = parentComments.map((comment) => ({
                ...comment,
                replies: repliesByParent[comment.id] || []
            }));
            // Respond with paginated comments and their replies
            return ctx.send({
                meta: {
                    page: pageNumber,
                    pageSize,
                    total,
                    pageCount: Math.ceil(total / pageSize)
                },
                data: commentsWithReplies
            });
        }
        catch (err) {
            strapi.log.error('Error retrieving comments:', err);
            return ctx.internalServerError('Could not fetch comments');
        }
    }
};
