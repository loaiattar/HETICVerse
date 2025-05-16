// backend/config/middlewares.js
module.exports = [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    {
        name: 'strapi::cors',
        config: {
            enabled: true,
            headers: '*',
            origin: ['http://localhost:3000', 'http://localhost:1337', '*']
        }
    },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
    'global::update-presence',
];
