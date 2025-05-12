'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/communities/:id/invite',
      handler: 'community.invite',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/communities/:id/request-join',
      handler: 'community.requestToJoin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/communities/:id/join-requests/:requestId',
      handler: 'community.handleJoinRequest',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/invitations/:invitationId/accept',
      handler: 'community.acceptInvitation',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/communities/:id/members',
      handler: 'community.getMembers',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ]
};