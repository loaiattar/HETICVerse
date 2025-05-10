/**
 * vote router
 */
module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/votes',
        handler: 'vote.find',
        config: {
          auth: false,
        },
      },
    ],
  };