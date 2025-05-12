'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/calls/initiate',
      handler: 'call.initiateCall',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/calls/:id/accept',
      handler: 'call.acceptCall',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/calls/:id/decline',
      handler: 'call.declineCall',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/calls/:id/end',
      handler: 'call.endCall',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/calls/history',
      handler: 'call.getCallHistory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/calls/signal',
      handler: 'call.handleSignaling',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};