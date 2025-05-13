'use strict';

import websocketService from './services/websocket';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }) {
    // Register middleware or additional features here
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  bootstrap({ strapi }) {
    // Initialize WebSocket service
    websocketService.initialize({ strapi });
  },
};