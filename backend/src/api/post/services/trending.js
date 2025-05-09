module.exports = () => ({
    async getTrending() {
      const posts = await strapi.entityService.findMany('api::post.post', {
        populate: ['votes', 'comments'],
      });
      
      // Calculate trending score based on:
      // - Recency
      // - Number of votes
      // - Number of comments
      const now = new Date();
      const scoredPosts = posts.map(post => {
        const postAge = (now - new Date(post.createdAt)) / 36e5; // Age in hours
        const upvotes = post.votes.filter(vote => vote.type === 'up').length;
        const downvotes = post.votes.filter(vote => vote.type === 'down').length;
        const commentCount = post.comments.length;
        
        // Trending score formula:
        // (upvotes - downvotes) / (postAge + 2)^1.8 + commentCount / 5
        const score = (upvotes - downvotes) / Math.pow(postAge + 2, 1.8) + commentCount / 5;
        
        return {
          ...post,
          trendingScore: score
        };
      });
      
      // Sort by trending score
      return scoredPosts.sort((a, b) => b.trendingScore - a.trendingScore);
    }
  });