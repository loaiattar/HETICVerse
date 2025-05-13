'use strict';

/**
 * Custom search routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/custom-search',
      handler: 'custom-search.search',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};