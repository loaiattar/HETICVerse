module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/bookmarks/me',
      handler: 'bookmark.getMyBookmarks',
      config: {
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/bookmarks/collections',
      handler: 'bookmark.getCollections',
      config: {
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/bookmarks/collection/:collection',
      handler: 'bookmark.getBookmarksByCollection',
      config: {
        policies: []
      }
    }
  ]
};