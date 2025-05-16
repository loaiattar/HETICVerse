export default {
  routes: [
    {
      method: 'POST',
      path: '/community-members/join/:communityId',
      handler: 'custom-community-member.joinCommunity',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/community-members/leave/:communityId',
      handler: 'custom-community-member.leaveCommunity',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/community-members/:memberId',
      handler: 'custom-community-member.updateMember',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/community-members/:communityId',
      handler: 'custom-community-member.getCommunityMembers',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
  ],
};
