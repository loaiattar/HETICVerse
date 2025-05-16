export default {
  routes: [
    {
      method: 'GET',
      path: '/api/communities/discover',
      handler: 'custom-community.discover',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/api/communities',
      handler: 'custom-community.create',
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
      path: '/api/communities',
      handler: 'custom-community.find',
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
      path: '/api/communities/:id',
      handler: 'custom-community.findOne',
      config: {
        auth: {
          required: true
        },
        policies: [],
        middlewares: [],
      },
    }
  ],
};
