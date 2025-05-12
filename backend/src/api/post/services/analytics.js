'use strict';

/**
 * analytics service
 */

module.exports = () => ({
  async trackPostView(postId, userId = null) {
    try {
      // Find or create analytics entry for this post
      let analytics = await strapi.db.query('api::post-analytic.post-analytic').findOne({
        where: { post: postId }
      });
      
      if (!analytics) {
        analytics = await strapi.entityService.create('api::post-analytic.post-analytic', {
          data: {
            post: postId,
            views: 0,
            uniqueVisitors: 0,
            viewsByDay: JSON.stringify({}),
            publishedAt: new Date()
          }
        });
      }
      
      // Increment view count
      const updatedViews = analytics.views + 1;
      let updatedUniqueVisitors = analytics.uniqueVisitors;
      
      // Track unique visitors if user is logged in
      let uniqueViewerIds = [];
      try {
        uniqueViewerIds = JSON.parse(analytics.uniqueViewerIds || '[]');
      } catch (e) {
        console.error('Error parsing uniqueViewerIds:', e);
      }
      
      if (userId && !uniqueViewerIds.includes(userId)) {
        uniqueViewerIds.push(userId);
        updatedUniqueVisitors = uniqueViewerIds.length;
      }
      
      // Update viewsByDay
      const today = new Date().toISOString().split('T')[0];
      let viewsByDay = {};
      try {
        viewsByDay = JSON.parse(analytics.viewsByDay || '{}');
      } catch (e) {
        console.error('Error parsing viewsByDay:', e);
      }
      
      viewsByDay[today] = (viewsByDay[today] || 0) + 1;
      
      // Update analytics
      await strapi.entityService.update('api::post-analytic.post-analytic', analytics.id, {
        data: {
          views: updatedViews,
          uniqueVisitors: updatedUniqueVisitors,
          uniqueViewerIds: JSON.stringify(uniqueViewerIds),
          viewsByDay: JSON.stringify(viewsByDay)
        }
      });
      
      return {
        views: updatedViews,
        uniqueVisitors: updatedUniqueVisitors
      };
    } catch (error) {
      console.error('Error tracking post view:', error);
      throw error;
    }
  },
  
  async getPostAnalytics(postId) {
    try {
      const analytics = await strapi.db.query('api::post-analytic.post-analytic').findOne({
        where: { post: postId }
      });
      
      if (!analytics) {
        return {
          views: 0,
          uniqueVisitors: 0,
          engagementRate: 0,
          viewsByDay: {}
        };
      }
      
      // Parse JSON fields
      let viewsByDay = {};
      try {
        viewsByDay = JSON.parse(analytics.viewsByDay || '{}');
      } catch (e) {
        console.error('Error parsing viewsByDay:', e);
      }
      
      // Calculate engagement rate
      const post = await strapi.entityService.findOne('api::post.post', postId, {
        populate: ['comments', 'votes']
      });
      
      const engagements = (post.comments?.length || 0) + (post.votes?.length || 0);
      const engagementRate = analytics.views > 0 ? (engagements / analytics.views) * 100 : 0;
      
      return {
        views: analytics.views,
        uniqueVisitors: analytics.uniqueVisitors,
        engagementRate: Number(engagementRate.toFixed(2)),
        viewsByDay
      };
    } catch (error) {
      console.error('Error getting post analytics:', error);
      throw error;
    }
  }
});