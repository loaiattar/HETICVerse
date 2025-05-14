'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Get current user's notifications
     */
    getMyNotifications: async (ctx) => {
        const { limit = '20', page = '1', type, read } = ctx.request.query;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to view notifications');
        }
        try {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Build filters
            const filters = {
                'recipient.id': user.id
            };
            // Add type filter if provided
            if (type && type !== 'all') {
                filters.type = type;
            }
            // Add read filter if provided
            if (read === 'true' || read === 'false') {
                filters.Read = read === 'true';
            }
            // Find user's notifications
            const notifications = await strapi.db.query('api::notification.notification').findMany({
                where: filters,
                orderBy: { date: 'desc' },
                populate: { sender: true },
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });
            // Count total notifications matching filter
            const count = await strapi.db.query('api::notification.notification').count({
                where: filters
            });
            // Count total unread notifications
            const unreadCount = await strapi.db.query('api::notification.notification').count({
                where: {
                    'recipient.id': user.id,
                    Read: false
                }
            });
            // Format response
            const formattedNotifications = notifications.map(notification => ({
                id: notification.id,
                type: notification.type,
                content: notification.content,
                Read: notification.Read,
                date: notification.date,
                link: notification.link,
                sender: notification.sender ? {
                    id: notification.sender.id,
                    username: notification.sender.username,
                    avatar: notification.sender.avatar
                } : null
            }));
            return {
                data: formattedNotifications,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count,
                    unreadCount
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch notifications', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Mark notification as read
     */
    markAsRead: async (ctx) => {
        const { id } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to update notifications');
        }
        try {
            // Find notification
            const notification = await strapi.db.query('api::notification.notification').findOne({
                where: { id },
                populate: { recipient: true }
            });
            if (!notification) {
                return ctx.notFound('Notification not found');
            }
            // Check if user is the recipient
            if (notification.recipient.id !== user.id) {
                return ctx.forbidden('You can only update your own notifications');
            }
            // Update notification
            await strapi.db.query('api::notification.notification').update({
                where: { id },
                data: {
                    Read: true
                }
            });
            return {
                success: true,
                message: 'Notification marked as read'
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to mark notification as read', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Mark all notifications as read
     */
    markAllAsRead: async (ctx) => {
        const { type } = ctx.request.query;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to update notifications');
        }
        try {
            // Build filters
            const filters = {
                'recipient.id': user.id,
                Read: false
            };
            // Add type filter if provided
            if (type && type !== 'all') {
                filters.type = type;
            }
            // Find unread notifications
            const notifications = await strapi.db.query('api::notification.notification').findMany({
                where: filters
            });
            // Update each notification
            for (const notification of notifications) {
                await strapi.db.query('api::notification.notification').update({
                    where: { id: notification.id },
                    data: {
                        Read: true
                    }
                });
            }
            return {
                success: true,
                count: notifications.length,
                message: `${notifications.length} notifications marked as read`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to mark notifications as read', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Delete a notification
     */
    deleteNotification: async (ctx) => {
        const { id } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to delete notifications');
        }
        try {
            // Find notification
            const notification = await strapi.db.query('api::notification.notification').findOne({
                where: { id },
                populate: { recipient: true }
            });
            if (!notification) {
                return ctx.notFound('Notification not found');
            }
            // Check if user is the recipient
            if (notification.recipient.id !== user.id) {
                return ctx.forbidden('You can only delete your own notifications');
            }
            // Delete notification
            await strapi.db.query('api::notification.notification').delete({
                where: { id }
            });
            return {
                success: true,
                message: 'Notification deleted successfully'
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to delete notification', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Delete all read notifications
     */
    deleteAllRead: async (ctx) => {
        const { type } = ctx.request.query;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to delete notifications');
        }
        try {
            // Build filters
            const filters = {
                'recipient.id': user.id,
                Read: true
            };
            // Add type filter if provided
            if (type && type !== 'all') {
                filters.type = type;
            }
            // Find read notifications
            const notifications = await strapi.db.query('api::notification.notification').findMany({
                where: filters
            });
            // Delete each notification
            for (const notification of notifications) {
                await strapi.db.query('api::notification.notification').delete({
                    where: { id: notification.id }
                });
            }
            return {
                success: true,
                count: notifications.length,
                message: `${notifications.length} notifications deleted`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to delete notifications', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get notification preferences
     */
    getPreferences: async (ctx) => {
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to view notification preferences');
        }
        try {
            // Get user with notification preferences
            const userWithPrefs = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: user.id },
                populate: ['notificationPreferences']
            });
            // Default preferences if none found
            const defaultPreferences = {
                emailNotifications: true,
                pushNotifications: true,
                commentNotifications: true,
                followNotifications: true,
                messageNotifications: true,
                communityNotifications: true,
                mentionNotifications: true
            };
            // Use preferences from database or defaults
            const preferences = userWithPrefs.notificationPreferences || defaultPreferences;
            return {
                data: preferences
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch notification preferences', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Update notification preferences
     */
    updatePreferences: async (ctx) => {
        const { emailNotifications, pushNotifications, commentNotifications, followNotifications, messageNotifications, communityNotifications, mentionNotifications } = ctx.request.body;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to update notification preferences');
        }
        try {
            // Get current preferences
            const userWithPrefs = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: user.id },
                populate: ['notificationPreferences']
            });
            // Build update object with only provided values
            const updateData = {};
            if (emailNotifications !== undefined)
                updateData.emailNotifications = emailNotifications;
            if (pushNotifications !== undefined)
                updateData.pushNotifications = pushNotifications;
            if (commentNotifications !== undefined)
                updateData.commentNotifications = commentNotifications;
            if (followNotifications !== undefined)
                updateData.followNotifications = followNotifications;
            if (messageNotifications !== undefined)
                updateData.messageNotifications = messageNotifications;
            if (communityNotifications !== undefined)
                updateData.communityNotifications = communityNotifications;
            if (mentionNotifications !== undefined)
                updateData.mentionNotifications = mentionNotifications;
            // If user already has preferences, update them
            if (userWithPrefs.notificationPreferences) {
                await strapi.db.query('api::notification-preference.notification-preference').update({
                    where: { id: userWithPrefs.notificationPreferences.id },
                    data: updateData
                });
            }
            else {
                // Otherwise create new preferences
                const preferences = await strapi.db.query('api::notification-preference.notification-preference').create({
                    data: {
                        ...updateData,
                        user: {
                            connect: [{ id: user.id }]
                        }
                    }
                });
            }
            // Get updated preferences
            const updatedUser = await strapi.db.query('plugin::users-permissions.user').findOne({
                where: { id: user.id },
                populate: ['notificationPreferences']
            });
            return {
                success: true,
                message: 'Notification preferences updated',
                data: updatedUser.notificationPreferences
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to update notification preferences', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get notification count
     */
    getCount: async (ctx) => {
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to get notification count');
        }
        try {
            // Count total unread notifications
            const unreadCount = await strapi.db.query('api::notification.notification').count({
                where: {
                    'recipient.id': user.id,
                    Read: false
                }
            });
            return {
                unreadCount
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to get notification count', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }
};
