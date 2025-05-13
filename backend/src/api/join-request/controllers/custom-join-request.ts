'use strict';

/**
 * Custom join-request controller
 */

interface JoinRequestQueryParams {
  limit?: string;
  page?: string;
  status?: string;
  communityId?: string;
}

export default {
  /**
   * Create a join request for a community
   */
  createJoinRequest: async (ctx) => {
    const { id: communityId } = ctx.params;
    const { message } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to request to join a community');
    }
    
    try {
      // Check if community exists
      const community = await strapi.db.query('api::community.community').findOne({
        where: { id: communityId },
        populate: '*'
      });
      
      if (!community) {
        return ctx.notFound('Community not found');
      }
      
      // Check if community is private (only private communities need join requests)
      if (community.privacy !== 'private' && community.privacy !== 'restricted') {
        return ctx.badRequest('Join requests are only needed for private or restricted communities');
      }
      
      // Check if user is already a member
      const existingMembership = await strapi.db.query('api::community-member.community-member').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'community.id': communityId }
          ]
        }
      });
      
      if (existingMembership) {
        return ctx.badRequest('You are already a member of this community');
      }
      
      // Check if a pending request already exists
      const existingRequest = await strapi.db.query('api::join-request.join-request').findOne({
        where: {
          $and: [
            { 'requester.id': user.id },
            { 'community.id': communityId },
            { status: 'pending' }
          ]
        }
      });
      
      if (existingRequest) {
        return ctx.badRequest('You already have a pending request to join this community');
      }
      
      // Create new join request
      const joinRequest = await strapi.db.query('api::join-request.join-request').create({
        data: {
          status: 'pending',
          requestDate: new Date(),
          message: message || null
        }
      });
      
      // Connect relations
      await strapi.db.query('api::join-request.join-request').update({
        where: { id: joinRequest.id },
        data: {
          requester: {
            connect: [{ id: user.id }]
          },
          community: {
            connect: [{ id: communityId }]
          }
        }
      });
      
      // Find community moderators to notify
      const moderators = await strapi.db.query('api::community-member.community-member').findMany({
        where: {
          'community.id': communityId,
          role: { $in: ['moderator', 'admin'] }
        },
        populate: { user: true }
      });
      
      // Create notifications for moderators
      for (const moderator of moderators) {
        if (moderator.user.id !== user.id) {
          const notification = await strapi.db.query('api::notification.notification').create({
            data: {
              type: 'join-request',
              content: `${user.username} has requested to join ${community.name}`,
              Read: false,
              date: new Date(),
              link: `/communities/${community.slug}/requests`
            }
          });
          
          // Connect notification relations
          await strapi.db.query('api::notification.notification').update({
            where: { id: notification.id },
            data: {
              recipient: {
                connect: [{ id: moderator.user.id }]
              },
              sender: {
                connect: [{ id: user.id }]
              }
            }
          });
        }
      }
      
      return {
        success: true,
        message: `Your request to join ${community.name} has been submitted`,
        joinRequest: {
          id: joinRequest.id,
          status: 'pending',
          requestDate: joinRequest.requestDate,
          message: joinRequest.message
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to create join request', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Cancel a join request
   */
  cancelJoinRequest: async (ctx) => {
    const { id: requestId } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to cancel a join request');
    }
    
    try {
      // Check if join request exists
      const joinRequest = await strapi.db.query('api::join-request.join-request').findOne({
        where: { id: requestId },
        populate: { requester: true, community: true }
      });
      
      if (!joinRequest) {
        return ctx.notFound('Join request not found');
      }
      
      // Check if user is the requester
      if (joinRequest.requester.id !== user.id) {
        return ctx.forbidden('You can only cancel your own join requests');
      }
      
      // Check if request is still pending
      if (joinRequest.status !== 'pending') {
        return ctx.badRequest('You can only cancel pending requests');
      }
      
      // Delete the join request
      await strapi.db.query('api::join-request.join-request').delete({
        where: { id: requestId }
      });
      
      return {
        success: true,
        message: `Your request to join ${joinRequest.community.name} has been cancelled`
      };
    } catch (err) {
      return ctx.badRequest('Failed to cancel join request', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Approve a join request
   */
  approveJoinRequest: async (ctx) => {
    const { id: requestId } = ctx.params;
    const { responseMessage } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to approve a join request');
    }
    
    try {
      // Check if join request exists
      const joinRequest = await strapi.db.query('api::join-request.join-request').findOne({
        where: { id: requestId },
        populate: { requester: true, community: true }
      });
      
      if (!joinRequest) {
        return ctx.notFound('Join request not found');
      }
      
      // Check if request is still pending
      if (joinRequest.status !== 'pending') {
        return ctx.badRequest('This request has already been processed');
      }
      
      // Check if user is a moderator of the community
      const isModerator = await strapi.db.query('api::community-member.community-member').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'community.id': joinRequest.community.id },
            { role: { $in: ['moderator', 'admin'] } }
          ]
        }
      });
      
      if (!isModerator) {
        return ctx.forbidden('Only community moderators can approve join requests');
      }
      
      // Update join request status
      await strapi.db.query('api::join-request.join-request').update({
        where: { id: requestId },
        data: {
          status: 'approved',
          responseDate: new Date(),
          responseMessage: responseMessage || null,
          responder: {
            connect: [{ id: user.id }]
          }
        }
      });
      
      // Create community membership
      const membership = await strapi.db.query('api::community-member.community-member').create({
        data: {
          status: 'active',
          role: 'member',
          joinDate: new Date()
        }
      });
      
      // Connect membership relations
      await strapi.db.query('api::community-member.community-member').update({
        where: { id: membership.id },
        data: {
          user: {
            connect: [{ id: joinRequest.requester.id }]
          },
          community: {
            connect: [{ id: joinRequest.community.id }]
          }
        }
      });
      
      // Update community member count
      await strapi.db.query('api::community.community').update({
        where: { id: joinRequest.community.id },
        data: {
          memberCount: joinRequest.community.memberCount + 1 || 1
        }
      });
      
      // Create notification for requester
      const notification = await strapi.db.query('api::notification.notification').create({
        data: {
          type: 'join-request',
          content: `Your request to join ${joinRequest.community.name} has been approved`,
          Read: false,
          date: new Date(),
          link: `/communities/${joinRequest.community.slug}`
        }
      });
      
      // Connect notification relations
      await strapi.db.query('api::notification.notification').update({
        where: { id: notification.id },
        data: {
          recipient: {
            connect: [{ id: joinRequest.requester.id }]
          },
          sender: {
            connect: [{ id: user.id }]
          }
        }
      });
      
      return {
        success: true,
        message: `Join request for ${joinRequest.requester.username} has been approved`
      };
    } catch (err) {
      return ctx.badRequest('Failed to approve join request', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Reject a join request
   */
  rejectJoinRequest: async (ctx) => {
    const { id: requestId } = ctx.params;
    const { responseMessage } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to reject a join request');
    }
    
    try {
      // Check if join request exists
      const joinRequest = await strapi.db.query('api::join-request.join-request').findOne({
        where: { id: requestId },
        populate: { requester: true, community: true }
      });
      
      if (!joinRequest) {
        return ctx.notFound('Join request not found');
      }
      
      // Check if request is still pending
      if (joinRequest.status !== 'pending') {
        return ctx.badRequest('This request has already been processed');
      }
      
      // Check if user is a moderator of the community
      const isModerator = await strapi.db.query('api::community-member.community-member').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'community.id': joinRequest.community.id },
            { role: { $in: ['moderator', 'admin'] } }
          ]
        }
      });
      
      if (!isModerator) {
        return ctx.forbidden('Only community moderators can reject join requests');
      }
      
      // Update join request status
      await strapi.db.query('api::join-request.join-request').update({
        where: { id: requestId },
        data: {
          status: 'rejected',
          responseDate: new Date(),
          responseMessage: responseMessage || null,
          responder: {
            connect: [{ id: user.id }]
          }
        }
      });
      
      // Create notification for requester
      const notification = await strapi.db.query('api::notification.notification').create({
        data: {
          type: 'join-request',
          content: `Your request to join ${joinRequest.community.name} has been rejected`,
          Read: false,
          date: new Date(),
          link: `/communities/${joinRequest.community.slug}`
        }
      });
      
      // Connect notification relations
      await strapi.db.query('api::notification.notification').update({
        where: { id: notification.id },
        data: {
          recipient: {
            connect: [{ id: joinRequest.requester.id }]
          },
          sender: {
            connect: [{ id: user.id }]
          }
        }
      });
      
      return {
        success: true,
        message: `Join request for ${joinRequest.requester.username} has been rejected`
      };
    } catch (err) {
      return ctx.badRequest('Failed to reject join request', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get join requests for a community
   */
  getCommunityRequests: async (ctx) => {
    const { id: communityId } = ctx.params;
    const { status = 'pending', limit = '20', page = '1' } = ctx.request.query as JoinRequestQueryParams;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view join requests');
    }
    
    try {
      // Check if community exists
      const community = await strapi.db.query('api::community.community').findOne({
        where: { id: communityId }
      });
      
      if (!community) {
        return ctx.notFound('Community not found');
      }
      
      // Check if user is a moderator of the community
      const isModerator = await strapi.db.query('api::community-member.community-member').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'community.id': communityId },
            { role: { $in: ['moderator', 'admin'] } }
          ]
        }
      });
      
      if (!isModerator) {
        return ctx.forbidden('Only community moderators can view join requests');
      }
      
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Build filters
      const filters: any = {
        'community.id': communityId
      };
      
      // Add status filter if provided
      if (status && status !== 'all') {
        filters.status = status;
      }
      
      // Find join requests
      const joinRequests = await strapi.db.query('api::join-request.join-request').findMany({
        where: filters,
        orderBy: { requestDate: 'desc' },
        populate: { requester: true, responder: true },
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });
      
      // Count total requests matching filter
      const count = await strapi.db.query('api::join-request.join-request').count({
        where: filters
      });
      
      // Format response
      const formattedRequests = joinRequests.map(request => ({
        id: request.id,
        status: request.status,
        requestDate: request.requestDate,
        responseDate: request.responseDate,
        message: request.message,
        responseMessage: request.responseMessage,
        requester: {
          id: request.requester.id,
          username: request.requester.username,
          email: request.requester.email,
          avatar: request.requester.avatar
        },
        responder: request.responder ? {
          id: request.responder.id,
          username: request.responder.username
        } : null
      }));
      
      return {
        data: formattedRequests,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch join requests', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get user's join requests
   */
  getUserRequests: async (ctx) => {
    const { status = 'pending', limit = '20', page = '1' } = ctx.request.query as JoinRequestQueryParams;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your join requests');
    }
    
    try {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Build filters
      const filters: any = {
        'requester.id': user.id
      };
      
      // Add status filter if provided
      if (status && status !== 'all') {
        filters.status = status;
      }
      
      // Find user's join requests
      const joinRequests = await strapi.db.query('api::join-request.join-request').findMany({
        where: filters,
        orderBy: { requestDate: 'desc' },
        populate: { community: true, responder: true },
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });
      
      // Count total requests matching filter
      const count = await strapi.db.query('api::join-request.join-request').count({
        where: filters
      });
      
      // Format response
      const formattedRequests = joinRequests.map(request => ({
        id: request.id,
        status: request.status,
        requestDate: request.requestDate,
        responseDate: request.responseDate,
        message: request.message,
        responseMessage: request.responseMessage,
        community: {
          id: request.community.id,
          name: request.community.name,
          slug: request.community.slug,
          image: request.community.image
        },
        responder: request.responder ? {
          id: request.responder.id,
          username: request.responder.username
        } : null
      }));
      
      return {
        data: formattedRequests,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch your join requests', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
};