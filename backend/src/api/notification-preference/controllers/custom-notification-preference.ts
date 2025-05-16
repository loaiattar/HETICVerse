'use strict';

import { Context } from 'koa';

enum NotificationType {
  MENTION = 'mention',
  REPLY = 'comment',
  MESSAGE = 'message',
  COMMUNITY_UPDATE = 'post', // Adjust if needed
  JOIN_REQUEST = 'join-request'
}

interface NotificationPreference {
  id: number;
  user: number;
  CommentNotifications: boolean;
  EmailNotifications: boolean;
  communityNotifications: boolean;
  CommunityUpdates: boolean;
  JoinRequests: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const customNotificationPreferenceController = {
  async getPreferences(ctx: Context) {
    const { user } = ctx.state;

    try {
      const preferences = await strapi.entityService.findMany('api::notification-preference.notification-preference', {
        filters: { user: user.id }
      });

      if (!preferences || preferences.length === 0) {
        const defaultPreferences = await strapi.entityService.create('api::notification-preference.notification-preference', {
          data: {
            user: user.id,
            CommentNotifications: true,
            EmailNotifications: true,
            communityNotifications: true,
            CommunityUpdates: true,
            JoinRequests: true
          }
        });
        return { data: defaultPreferences };
      }

      return { data: preferences[0] };
    } catch (error) {
      strapi.log.error('Error fetching preferences:', error);
      return ctx.badRequest('Failed to fetch notification preferences');
    }
  },

  async updatePreferences(ctx: Context) {
    const { user } = ctx.state;
    const updates = ctx.request.body;

    const validKeys = [
      'CommentNotifications',
      'EmailNotifications',
      'communityNotifications',
      'CommunityUpdates',
      'JoinRequests'
    ];

    const hasInvalidKeys = Object.keys(updates).some(key => !validKeys.includes(key));
    if (hasInvalidKeys) {
      return ctx.badRequest('Invalid preference keys provided');
    }

    try {
      const existing = await strapi.entityService.findMany('api::notification-preference.notification-preference', {
        filters: { user: user.id }
      });

      if (!existing || existing.length === 0) {
        const preferences = await strapi.entityService.create('api::notification-preference.notification-preference', {
          data: {
            user: user.id,
            ...updates
          }
        });
        return { data: preferences };
      }

      const updated = await strapi.entityService.update('api::notification-preference.notification-preference', existing[0].id, {
        data: updates
      });

      return { data: updated };
    } catch (error) {
      strapi.log.error('Error updating preferences:', error);
      return ctx.badRequest('Failed to update notification preferences');
    }
  },

  async filterNotifications(ctx: Context) {
    const { user } = ctx.state;
    const page = Math.max(1, parseInt(ctx.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(ctx.query.limit as string) || 10));

    try {
      const preferences = await strapi.entityService.findMany('api::notification-preference.notification-preference', {
        filters: { user: user.id }
      });

      if (!preferences || preferences.length === 0) {
        return ctx.badRequest('No notification preferences found');
      }

      const prefRaw = preferences[0];
      const userPrefs: NotificationPreference = {
        id: Number(prefRaw.id),
        user: user.id,
        CommentNotifications: prefRaw.CommentNotifications ?? false,
        EmailNotifications: prefRaw.EmailNotifications ?? false,
        communityNotifications: prefRaw.communityNotifications ?? false,
        CommunityUpdates: prefRaw.CommunityUpdates ?? false,
        JoinRequests: prefRaw.JoinRequests ?? false,
        createdAt: prefRaw.createdAt ? new Date(prefRaw.createdAt) : undefined,
        updatedAt: prefRaw.updatedAt ? new Date(prefRaw.updatedAt) : undefined
      };

      const filters: any = {
        $or: [],
        users_permissions_user: user.id 
      };

      if (userPrefs.CommentNotifications) filters.$or.push({ type: NotificationType.MENTION });
      if (userPrefs.EmailNotifications) filters.$or.push({ type: NotificationType.REPLY });
      if (userPrefs.communityNotifications) filters.$or.push({ type: NotificationType.MESSAGE });
      if (userPrefs.CommunityUpdates) filters.$or.push({ type: NotificationType.COMMUNITY_UPDATE });
      if (userPrefs.JoinRequests) filters.$or.push({ type: NotificationType.JOIN_REQUEST });

      if (filters.$or.length === 0) delete filters.$or;

      const notifications = await strapi.entityService.findMany('api::notification.notification', {
        filters,
        sort: { date: 'desc' },
        limit,
        start: (page - 1) * limit,
        populate: {} //
      });

      const count = await strapi.entityService.count('api::notification.notification', { filters });

      return {
        data: notifications,
        meta: {
          page,
          limit,
          count
        }
      };
    } catch (error) {
      strapi.log.error('Error filtering notifications:', error);
      return ctx.badRequest('Failed to fetch notifications');
    }
  }
};

export default customNotificationPreferenceController;
