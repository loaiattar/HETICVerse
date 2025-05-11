module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.search',
      config: {
        policies: [],
        description: 'Search across posts, comments, and SubHETICVerses',
        tag: {
          plugin: 'search',
          name: 'Search',
          actionType: 'find'
        }
      }
    }
  ]
};