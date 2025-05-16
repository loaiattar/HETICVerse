'use strict';

export default {
  type: 'content-api',
  routes: require('./routes/custom-notification').default,
  controllers: require('./controllers/custom-notification').default,
};