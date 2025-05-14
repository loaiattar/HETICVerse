'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Custom community controller
 */
exports.default = {
    discover: async (ctx) => {
        const { category, limit = '10', page = '1' } = ctx.request.query;
        try {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Create base query with explicit type assertion
            const filters = {
                visibility: true,
                privacy: 'public'
            };
            // Add category filter if provided
            if (category) {
                filters.category = category;
            }
            // Use type assertion to create query object
            const queryOptions = {
                filters,
                sort: { createdAt: 'desc' },
                populate: ['image'],
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            };
            // Use the query with type assertion
            const communities = await strapi.entityService.findMany('api::community.community', queryOptions);
            // Count total matching communities with type assertion
            const countOptions = { where: filters };
            const count = await strapi.db.query('api::community.community').count(countOptions);
            return {
                data: communities,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Discovery error', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }
};
