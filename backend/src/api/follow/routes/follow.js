module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/follow/:id',
      handler: 'follow.followUser',
      config: {
        policies: []
      }
    },
    {
      method: 'DELETE',
      path: '/follow/:id',
      handler: 'follow.unfollowUser',
      config: {
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/follow/followers',
      handler: 'follow.getFollowers',
      config: {
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/follow/following',
      handler: 'follow.getFollowing',
      config: {
        policies: []
      }
    }
  ]
};