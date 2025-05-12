'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::community.community', ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a community');
    }

    // Set the owner
    ctx.request.body.data.owner = user.id;

    // Create the community
    const result = await super.create(ctx);

    // Add the creator as a member with owner role
    await strapi.entityService.create('api::community-member.community-member', {
      data: {
        user: user.id,
        community: result.data.id,
        role: 'owner',
        joinedAt: new Date(),
        publishedAt: new Date()
      }
    });

    return result;
  },

  async invite(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const { inviteeId, message } = ctx.request.body;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if user has permission to invite (owner or moderator)
    const membership = await strapi.entityService.findMany('api::community-member.community-member', {
      filters: {
        community: id,
        user: user.id,
        role: { $in: ['owner', 'moderator'] }
      }
    });

    if (!membership || membership.length === 0) {
      return ctx.forbidden('You do not have permission to invite members');
    }

    // Check if invitee is already a member
    const existingMembership = await strapi.entityService.findMany('api::community-member.community-member', {
      filters: {
        community: id,
        user: inviteeId
      }
    });

    if (existingMembership && existingMembership.length > 0) {
      return ctx.badRequest('User is already a member');
    }

    // Create invitation
    const invitation = await strapi.entityService.create('api::community-invitation.community-invitation', {
      data: {
        community: id,
        inviter: user.id,
        invitee: inviteeId,
        message,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        publishedAt: new Date()
      },
      populate: ['community', 'inviter', 'invitee']
    });

    // Create notification for invitee
    await strapi.entityService.create('api::notification.notification', {
      data: {
        recipient: inviteeId,
        type: 'community_invitation',
        content: `${user.username} invited you to join ${membership[0].community.name}`,
        read: false,
        relatedContent: {
          type: 'invitation',
          id: invitation.id
        },
        publishedAt: new Date()
      }
    });

    return invitation;
  },

  async requestToJoin(ctx) {
    const user = ctx.state.user;
    const { id } = ctx.params;
    const { message } = ctx.request.body;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if already a member
    const existingMembership = await strapi.entityService.findMany('api::community-member.community-member', {
      filters: {
        community: id,
        user: user.id
      }
    });

    if (existingMembership && existingMembership.length > 0) {
      return ctx.badRequest('You are already a member of this community');
    }

    // Check if already has pending request
    const existingRequest = await strapi.entityService.findMany('api::join-request.join-request', {
      filters: {
        community: id,
        requester: user.id,
        status: 'pending'
      }
    });

    if (existingRequest && existingRequest.length > 0) {
      return ctx.badRequest('You already have a pending join request');
    }

    // Create join request
    const joinRequest = await strapi.entityService.create('api::join-request.join-request', {
      data: {
        community: id,
        requester: user.id,
        message,
        publishedAt: new Date()
      },
      populate: ['community', 'requester']
    });

    // Notify community moderators/owners
    const moderators = await strapi.entityService.findMany('api::community-member.community-member', {
      filters: {
        community: id,
        role: { $in: ['owner', 'moderator'] }
      },
      populate: ['user']
    });

    for (const moderator of moderators) {
      await strapi.entityService.create('api::notification.notification', {
        data: {
          recipient: moderator.user.id,
          type: 'join_request',
          content: `${user.username} requested to join ${joinRequest.community.name}`,
          read: false,
          relatedContent: {
            type: 'join_request',
            id: joinRequest.id
          },
          publishedAt: new Date()
        }
      });
    }

    return joinRequest;
  },

  async handleJoinRequest(ctx) {
    const user = ctx.state.user;
    const { id, requestId } = ctx.params;
    const { action } = ctx.request.body; // 'approve' or 'reject'

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if user has permission (owner or moderator)
    const membership = await strapi.entityService.findMany('api::community-member.community-member', {
      filters: {
        community: id,
        user: user.id,
        role: { $in: ['owner', 'moderator'] }
      }
    });

    if (!membership || membership.length === 0) {
      return ctx.forbidden('You do not have permission to handle join requests');
    }

    // Get the join request
    const joinRequest = await strapi.entityService.findOne('api::join-request.join-request', requestId, {
      populate: ['community', 'requester']
    });

    if (!joinRequest) {
      return ctx.notFound('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
      return ctx.badRequest('Join request has already been processed');
    }

    // Update join request status
    const updatedRequest = await strapi.entityService.update('api::join-request.join-request', requestId, {
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedBy: user.id,
        reviewedAt: new Date()
      },
      populate: ['community', 'requester']
    });

    if (action === 'approve') {
      // Add user to community
      await strapi.entityService.create('api::community-member.community-member', {
        data: {
          user: joinRequest.requester.id,
          community: id,
          role: 'member',
          joinedAt: new Date(),
          publishedAt: new Date()
        }
      });
    }

    // Notify requester
    await strapi.entityService.create('api::notification.notification', {
      data: {
        recipient: joinRequest.requester.id,
        type: 'join_request_result',
        content: `Your request to join ${joinRequest.community.name} was ${action === 'approve' ? 'approved' : 'rejected'}`,
        read: false,
        relatedContent: {
          type: 'join_request',
          id: requestId
        },
        publishedAt: new Date()
      }
    });

    return updatedRequest;
  },

  async acceptInvitation(ctx) {
    const user = ctx.state.user;
    const { invitationId } = ctx.params;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Get the invitation
    const invitation = await strapi.entityService.findOne('api::community-invitation.community-invitation', invitationId, {
      populate: ['community', 'inviter', 'invitee']
    });

    if (!invitation) {
      return ctx.notFound('Invitation not found');
    }

    if (invitation.invitee.id !== user.id) {
      return ctx.forbidden('This invitation is not for you');
    }

    if (invitation.status !== 'pending') {
      return ctx.badRequest('Invitation has already been processed');
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      return ctx.badRequest('Invitation has expired');
    }

    // Update invitation status
    await strapi.entityService.update('api::community-invitation.community-invitation', invitationId, {
      data: {
        status: 'accepted'
      }
    });

    // Add user to community
    await strapi.entityService.create('api::community-member.community-member', {
      data: {
        user: user.id,
        community: invitation.community.id,
        role: 'member',
        joinedAt: new Date(),
        publishedAt: new Date()
      }
    });

    return { message: 'Invitation accepted successfully' };
  },

  async getMembers(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    // Get community members
    const members = await strapi.entityService.findMany('api::community-member.community-member', {
      filters: {
        community: id
      },
      populate: ['user'],
      sort: 'joinedAt:desc'
    });

    return members;
  }
}));