/**
 * vote service
 */
'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/posts',
      handler: 'post.find',
    },
    {
      method: 'POST',
      path: '/posts',
      handler: 'post.create',
    },
  ],
};
