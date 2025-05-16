'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreController('api::community.community', ({ strapi }) => ({
    // Discover communities with optional filters
    async discover(ctx) {
        const { category, limit = '10', page = '1' } = ctx.request.query;
        try {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            const filters = {
                visibility: true,
                privacy: 'public',
            };
            if (category) {
                filters.category = category;
            }
            const queryOptions = {
                filters,
                sort: { createdAt: 'desc' },
                populate: ['image'],
                limit: limitNum,
                offset: (pageNum - 1) * limitNum,
            };
            const communities = await strapi.entityService.findMany('api::community.community', queryOptions);
            const count = await strapi.db.query('api::community.community').count({
                where: filters,
            });
            return {
                data: communities,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count,
                },
            };
        }
        catch (err) {
            return ctx.badRequest('Discovery error', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    },
    // Create a new community
    async create(ctx) {
        try {
            const { data } = ctx.request.body; // Extract the data property from the body
            // Add the current user as the creator if not specified
            if (!data.createdBy) {
                data.createdBy = ctx.state.user.id;
            }
            const newCommunity = await strapi.entityService.create('api::community.community', {
                data,
                populate: ['image', 'bannerMedia'],
            });
            ctx.created(newCommunity);
        }
        catch (err) {
            return ctx.badRequest('Community creation failed', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    }
}));
