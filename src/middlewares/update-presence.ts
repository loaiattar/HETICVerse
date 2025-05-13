'use strict';

/**
 * Update user presence middleware
 */

export default (config, { strapi }) => {
  return async (ctx, next) => {
    await next();
    
    // Only process after response and only for authenticated users
    const { user } = ctx.state;
    if (user && ctx.response.status !== 401 && ctx.response.status !== 403) {
      try {
        // Don't await to avoid delaying the response
        strapi.service('api::user-presence.custom-user-presence').updateLastActive(user.id);
      } catch (error) {
        // Just log, don't impact the request flow
        strapi.log.error('Failed to update user presence:', error);
      }
    }
  };
};