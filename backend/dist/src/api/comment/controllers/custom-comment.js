"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Create a new comment
     */
    createComment: async (ctx) => {
        // Same implementation as before...
    },
    /**
     * Get comments for a product
     */
    getProductComments: async (ctx) => {
        const { productId } = ctx.params;
        const { page = '1', limit = '10', parentOnly = 'true' } = ctx.query;
        try {
            // Check if product exists
            const product = await strapi.db.query('api::product.product').findOne({
                where: { id: productId }
            });
            if (!product) {
                return ctx.notFound('Product not found');
            }
            // Parse pagination parameters
            const pageNumber = parseInt(page, 10);
            const pageSize = parseInt(limit, 10);
            // Build query with proper typing
            const queryFilters = {
                product: { id: productId }
            };
            // Filter only parent comments if requested
            if (parentOnly === 'true') {
                queryFilters.parentComment = null;
            }
            // Build the complete query object
            const query = {
                where: queryFilters,
                populate: {
                    author: {
                        select: ['id', 'username', 'email', 'avatar']
                    }
                },
                orderBy: { createdAt: 'desc' },
                offset: (pageNumber - 1) * pageSize,
                limit: pageSize
            };
            // Get comments
            const comments = await strapi.db.query('api::comment.comment').findMany(query);
            // Get total count for pagination
            const count = await strapi.db.query('api::comment.comment').count({
                where: queryFilters
            });
            // Rest of the implementation...
        }
        catch (err) {
            // Error handling...
        }
    }
};
