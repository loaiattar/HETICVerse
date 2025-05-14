'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Follow a user
     */
    followUser: async (ctx) => {
        const { id: targetUserId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to follow users');
        }
        try {
            // Check if target user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: targetUserId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            // Check if user is trying to follow themselves
            if (user.id === Number(targetUserId)) {
                return ctx.badRequest('You cannot follow yourself');
            }
            // Check if follow relationship already exists
            const existingFollow = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': user.id },
                        { 'following.id': targetUserId }
                    ]
                },
                populate: '*'
            });
            if (existingFollow) {
                // If follow exists but is blocked, unblock it
                if (existingFollow.status === 'blocked') {
                    await strapi.db.query('api::follow.follow').update({
                        where: { id: existingFollow.id },
                        data: { status: 'active' }
                    });
                    return {
                        success: true,
                        action: 'unblocked',
                        message: `You are now following ${targetUser.username}`
                    };
                }
                return {
                    success: true,
                    action: 'unchanged',
                    message: `You are already following ${targetUser.username}`
                };
            }
            // Create new follow relationship
            const newFollow = await strapi.db.query('api::follow.follow').create({
                data: {
                    status: 'active',
                    date: new Date()
                }
            });
            // Connect relations
            await strapi.db.query('api::follow.follow').update({
                where: { id: newFollow.id },
                data: {
                    follower: {
                        connect: [{ id: user.id }]
                    },
                    following: {
                        connect: [{ id: targetUserId }]
                    }
                }
            });
            // Create notification for the target user
            const notification = await strapi.db.query('api::notification.notification').create({
                data: {
                    type: 'follow',
                    content: `${user.username} started following you`,
                    Read: false,
                    date: new Date(),
                    link: `/profile/${user.id}`
                }
            });
            // Connect notification relations
            await strapi.db.query('api::notification.notification').update({
                where: { id: notification.id },
                data: {
                    recipient: {
                        connect: [{ id: targetUserId }]
                    },
                    sender: {
                        connect: [{ id: user.id }]
                    }
                }
            });
            return {
                success: true,
                action: 'followed',
                message: `You are now following ${targetUser.username}`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to follow user', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Unfollow a user
     */
    unfollowUser: async (ctx) => {
        const { id: targetUserId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to unfollow users');
        }
        try {
            // Check if target user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: targetUserId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            // Find follow relationship
            const follow = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': user.id },
                        { 'following.id': targetUserId }
                    ]
                }
            });
            if (!follow) {
                return {
                    success: true,
                    action: 'unchanged',
                    message: `You are not following ${targetUser.username}`
                };
            }
            // Delete follow relationship
            await strapi.db.query('api::follow.follow').delete({
                where: { id: follow.id }
            });
            return {
                success: true,
                action: 'unfollowed',
                message: `You have unfollowed ${targetUser.username}`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to unfollow user', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Block a user from following
     */
    blockUser: async (ctx) => {
        const { id: targetUserId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to block users');
        }
        try {
            // Check if target user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: targetUserId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            // Check if user is trying to block themselves
            if (user.id === Number(targetUserId)) {
                return ctx.badRequest('You cannot block yourself');
            }
            // Check if target user is following current user
            const existingFollow = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': targetUserId },
                        { 'following.id': user.id }
                    ]
                }
            });
            if (existingFollow) {
                // Update follow status to blocked
                await strapi.db.query('api::follow.follow').update({
                    where: { id: existingFollow.id },
                    data: { status: 'blocked' }
                });
            }
            else {
                // Create new blocked follow relationship
                const newFollow = await strapi.db.query('api::follow.follow').create({
                    data: {
                        status: 'blocked',
                        date: new Date()
                    }
                });
                // Connect relations
                await strapi.db.query('api::follow.follow').update({
                    where: { id: newFollow.id },
                    data: {
                        follower: {
                            connect: [{ id: targetUserId }]
                        },
                        following: {
                            connect: [{ id: user.id }]
                        }
                    }
                });
            }
            // Also block the user following in the other direction if it exists
            const reverseFollow = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': user.id },
                        { 'following.id': targetUserId }
                    ]
                }
            });
            if (reverseFollow) {
                await strapi.db.query('api::follow.follow').update({
                    where: { id: reverseFollow.id },
                    data: { status: 'blocked' }
                });
            }
            return {
                success: true,
                action: 'blocked',
                message: `You have blocked ${targetUser.username}`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to block user', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Unblock a user
     */
    unblockUser: async (ctx) => {
        const { id: targetUserId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to unblock users');
        }
        try {
            // Check if target user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: targetUserId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            // Find blocked follow relationship
            const blockedFollow = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': targetUserId },
                        { 'following.id': user.id },
                        { status: 'blocked' }
                    ]
                }
            });
            if (!blockedFollow) {
                return {
                    success: true,
                    action: 'unchanged',
                    message: `${targetUser.username} is not blocked`
                };
            }
            // Delete the blocked follow relationship
            await strapi.db.query('api::follow.follow').delete({
                where: { id: blockedFollow.id }
            });
            return {
                success: true,
                action: 'unblocked',
                message: `You have unblocked ${targetUser.username}`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to unblock user', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get followers of a user
     */
    getFollowers: async (ctx) => {
        const { id: userId } = ctx.params;
        const { limit = '20', page = '1' } = ctx.request.query;
        const { user } = ctx.state;
        try {
            // Check if user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: userId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Find active followers
            const followers = await strapi.db.query('api::follow.follow').findMany({
                where: {
                    'following.id': userId,
                    status: 'active'
                },
                orderBy: { date: 'desc' },
                populate: { follower: true },
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });
            // Count total followers
            const count = await strapi.db.query('api::follow.follow').count({
                where: {
                    'following.id': userId,
                    status: 'active'
                }
            });
            // Format followers
            const formattedFollowers = followers.map(follow => ({
                id: follow.follower.id,
                username: follow.follower.username,
                email: follow.follower.email,
                avatar: follow.follower.avatar,
                followDate: follow.date,
                isFollowing: user ? !!follow.following : false // Check if current user follows this follower
            }));
            return {
                data: formattedFollowers,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch followers', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get users followed by a user
     */
    getFollowing: async (ctx) => {
        const { id: userId } = ctx.params;
        const { limit = '20', page = '1' } = ctx.request.query;
        const { user } = ctx.state;
        try {
            // Check if user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: userId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Find active following
            const following = await strapi.db.query('api::follow.follow').findMany({
                where: {
                    'follower.id': userId,
                    status: 'active'
                },
                orderBy: { date: 'desc' },
                populate: { following: true },
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });
            // Count total following
            const count = await strapi.db.query('api::follow.follow').count({
                where: {
                    'follower.id': userId,
                    status: 'active'
                }
            });
            // Format following
            const formattedFollowing = following.map(follow => ({
                id: follow.following.id,
                username: follow.following.username,
                email: follow.following.email,
                avatar: follow.following.avatar,
                followDate: follow.date,
                isFollowedBy: user ? !!follow.follower : false // Check if current user is followed by this user
            }));
            return {
                data: formattedFollowing,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch following', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get follow status between current user and target user
     */
    getFollowStatus: async (ctx) => {
        const { id: targetUserId } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to check follow status');
        }
        try {
            // Check if target user exists
            const targetUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: targetUserId }
            });
            if (!targetUser) {
                return ctx.notFound('User not found');
            }
            // Check if current user follows target user
            const following = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': user.id },
                        { 'following.id': targetUserId }
                    ]
                }
            });
            // Check if target user follows current user
            const follower = await strapi.db.query('api::follow.follow').findOne({
                where: {
                    $and: [
                        { 'follower.id': targetUserId },
                        { 'following.id': user.id }
                    ]
                }
            });
            return {
                isFollowing: following ? following.status === 'active' : false,
                isFollower: follower ? follower.status === 'active' : false,
                isBlocked: following ? following.status === 'blocked' : false,
                isBlockedBy: follower ? follower.status === 'blocked' : false
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch follow status', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Suggest users to follow
     */
    suggestUsers: async (ctx) => {
        const { limit = '10' } = ctx.request.query;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to get suggestions');
        }
        try {
            const limitNum = parseInt(limit);
            // Get users current user is following
            const following = await strapi.db.query('api::follow.follow').findMany({
                where: {
                    'follower.id': user.id
                },
                populate: { following: true }
            });
            const followingIds = following.map(follow => follow.following.id);
            followingIds.push(user.id); // Add current user to exclude
            // Find users with the most followers who current user is not following
            const suggestedUsers = await strapi.db.query('plugin::users-permissions.user').findMany({
                where: {
                    id: { $notIn: followingIds }
                },
                limit: limitNum,
                populate: ['role']
            });
            // Get follower counts for each suggested user
            const userFollowerCounts = await Promise.all(suggestedUsers.map(async (suggestedUser) => {
                const count = await strapi.db.query('api::follow.follow').count({
                    where: {
                        'following.id': suggestedUser.id,
                        status: 'active'
                    }
                });
                return {
                    id: suggestedUser.id,
                    username: suggestedUser.username,
                    email: suggestedUser.email,
                    avatar: suggestedUser.avatar,
                    followerCount: count
                };
            }));
            // Sort by follower count (descending)
            const sortedSuggestions = userFollowerCounts.sort((a, b) => b.followerCount - a.followerCount);
            return {
                data: sortedSuggestions
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch user suggestions', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }
};
