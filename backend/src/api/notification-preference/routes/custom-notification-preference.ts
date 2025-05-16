export default {
  routes: [
    {
      method: 'GET',
      path: '/notification-preferences/custom',
      handler: 'custom-notification-preference.getPreferences',
      config: {
        policies: [],
        auth: {}
      }
    },
    {
      method: 'PUT',
      path: '/notification-preferences/custom',
      handler: 'custom-notification-preference.updatePreferences',
      config: {
        policies: [],
        auth: {}
      }
    },
    {
      method: 'GET',
      path: '/notification-preferences/filtered',
      handler: 'custom-notification-preference.filterNotifications',
      config: {
        policies: [],
        auth: {}
      }
    }
  ]
};
