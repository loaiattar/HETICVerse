'use strict';

/**
 * Custom community routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/communities/discover',
      handler: 'custom-community.discover',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};