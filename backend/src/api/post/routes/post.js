/**
 * post router
 */

'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find', // This should match the controller method
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
    },
  ],
};