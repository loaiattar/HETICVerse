/**
 * vote controller
 */

module.exports = createCoreController('api::vote.vote', ({ strapi }) => ({
  async create(ctx) {
    const { user } = ctx.state;
    const { post, type } = ctx.request.body;
    
    // Check if user already voted on this post
    const existingVote = await strapi.db.query('api::vote.vote').findOne({
      where: { 
        post: post,
        users_permissions_user: user.id
      }
    });
    
    if (existingVote) {
      // Update vote if already exists
      if (existingVote.Vote === type) {
        // Remove vote if clicking same type again
        await strapi.entityService.delete('api::vote.vote', existingVote.id);
        
        // Update post karma count
        await this.updatePostKarma(post);
        
        return { message: 'Vote removed' };
      } else {
        // Change vote type
        const updated = await strapi.entityService.update('api::vote.vote', existingVote.id, {
          data: { Vote: type }
        });
        
        // Update post karma count
        await this.updatePostKarma(post);
        
        return updated;
      }
    } else {
      // Create new vote
      const vote = await super.create(ctx);
      
      // Update post karma count
      await this.updatePostKarma(post);
      
      return vote;
    }
  },
  
  // Helper to update post karma
  async updatePostKarma(postId) {
    const upvotes = await strapi.db.query('api::vote.vote').count({
      where: { 
        post: postId,
        Vote: 'upvote'
      }
    });
    
    const downvotes = await strapi.db.query('api::vote.vote').count({
      where: { 
        post: postId,
        Vote: 'downvote'
      }
    });
    
    const karma = upvotes - downvotes;
    
    // Update post with karma count if you add this field
    await strapi.entityService.update('api::post.post', postId, {
      data: { karma }
    });
    
    return karma;
  }
}));