'use strict';

module.exports = {
  routes: [
    {
      method: 'DELETE',
      path: '/comments/:id/images/:imageId',
      handler: 'comment.removeImage',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};