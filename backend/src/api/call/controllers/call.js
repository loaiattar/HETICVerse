'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { v4: uuidv4 } = require('uuid');

module.exports = createCoreController('api::call.call', ({ strapi }) => ({
  // Initiate a call
  async initiateCall(ctx) {
    const { calleeId, type = 'video', conversationId } = ctx.request.body;
    const caller = ctx.state.user;

    if (!caller) {
      return ctx.unauthorized('You must be logged in');
    }

    // Check if callee exists
    const callee = await strapi.entityService.findOne('plugin::users-permissions.user', calleeId);
    if (!callee) {
      return ctx.notFound('User not found');
    }

    // Check if they're friends (optional - based on your app's logic)
    const isFriend = await this.checkFriendship(caller.id, calleeId);
    if (!isFriend) {
      return ctx.forbidden('You can only call your friends');
    }

    // Create room ID
    const roomId = uuidv4();

    // Create call record
    const call = await strapi.entityService.create('api::call.call', {
      data: {
        caller: caller.id,
        callee: calleeId,
        conversation: conversationId,
        type,
        status: 'pending',
        roomId,
        publishedAt: new Date()
      },
      populate: ['caller', 'callee', 'conversation']
    });

    // Emit call event to callee
    strapi.io.to(`user:${calleeId}`).emit('incomingCall', {
      call,
      roomId
    });

    // Emit call status to caller
    strapi.io.to(`user:${caller.id}`).emit('callStatus', {
      callId: call.id,
      status: 'ringing'
    });

    return { data: call };
  },

  // Accept a call
  async acceptCall(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const call = await strapi.entityService.findOne('api::call.call', id, {
      populate: ['caller', 'callee']
    });

    if (!call) {
      return ctx.notFound('Call not found');
    }

    // Check if user is the callee
    if (call.callee.id !== user.id) {
      return ctx.forbidden('You can only accept calls meant for you');
    }

    // Update call status
    const updatedCall = await strapi.entityService.update('api::call.call', id, {
      data: {
        status: 'active',
        startedAt: new Date()
      },
      populate: ['caller', 'callee', 'conversation']
    });

    // Notify caller that call was accepted
    strapi.io.to(`user:${call.caller.id}`).emit('callAccepted', {
      call: updatedCall,
      roomId: call.roomId
    });

    // Join both users to the call room
    strapi.io.to(`user:${call.caller.id}`).emit('joinCallRoom', { roomId: call.roomId });
    strapi.io.to(`user:${call.callee.id}`).emit('joinCallRoom', { roomId: call.roomId });

    return { data: updatedCall };
  },

  // Decline a call
  async declineCall(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const call = await strapi.entityService.findOne('api::call.call', id, {
      populate: ['caller', 'callee']
    });

    if (!call) {
      return ctx.notFound('Call not found');
    }

    // Check if user is the callee
    if (call.callee.id !== user.id) {
      return ctx.forbidden('You can only decline calls meant for you');
    }

    // Update call status
    const updatedCall = await strapi.entityService.update('api::call.call', id, {
      data: {
        status: 'declined',
        endedAt: new Date()
      },
      populate: ['caller', 'callee']
    });

    // Notify caller that call was declined
    strapi.io.to(`user:${call.caller.id}`).emit('callDeclined', {
      callId: call.id
    });

    return { data: updatedCall };
  },

  // End a call
  async endCall(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const call = await strapi.entityService.findOne('api::call.call', id, {
      populate: ['caller', 'callee']
    });

    if (!call) {
      return ctx.notFound('Call not found');
    }

    // Check if user is part of the call
    if (call.caller.id !== user.id && call.callee.id !== user.id) {
      return ctx.forbidden('You can only end calls you are part of');
    }

    // Calculate duration if call was active
    let duration = 0;
    if (call.startedAt) {
      duration = Math.floor((new Date() - new Date(call.startedAt)) / 1000);
    }

    // Update call status
    const updatedCall = await strapi.entityService.update('api::call.call', id, {
      data: {
        status: 'ended',
        endedAt: new Date(),
        duration
      },
      populate: ['caller', 'callee']
    });

    // Notify both users that call ended
    strapi.io.to(`user:${call.caller.id}`).emit('callEnded', {
      callId: call.id,
      duration
    });
    strapi.io.to(`user:${call.callee.id}`).emit('callEnded', {
      callId: call.id,
      duration
    });

    return { data: updatedCall };
  },

  // Get call history
  async getCallHistory(ctx) {
    const user = ctx.state.user;
    const { page = 1, limit = 20 } = ctx.query;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const calls = await strapi.entityService.findMany('api::call.call', {
      filters: {
        $or: [
          { caller: user.id },
          { callee: user.id }
        ]
      },
      sort: { createdAt: 'desc' },
      start: (page - 1) * limit,
      limit,
      populate: ['caller', 'callee', 'conversation']
    });

    return { data: calls };
  },

  // WebRTC signaling handler
  async handleSignaling(ctx) {
    const { callId, signal } = ctx.request.body;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in');
    }

    const call = await strapi.entityService.findOne('api::call.call', callId, {
      populate: ['caller', 'callee']
    });

    if (!call) {
      return ctx.notFound('Call not found');
    }

    // Ensure user is part of the call
    if (call.caller.id !== user.id && call.callee.id !== user.id) {
      return ctx.forbidden('You are not part of this call');
    }

    // Determine the other user
    const otherUserId = user.id === call.caller.id ? call.callee.id : call.caller.id;

    // Forward signal to the other user
    strapi.io.to(`user:${otherUserId}`).emit('signal', {
      callId,
      signal,
      from: user.id
    });

    return { success: true };
  },

  // Helper function to check friendship (implement based on your friendship model)
  async checkFriendship(userId1, userId2) {
    // This is a simple implementation - adjust based on your friendship model
    const user1 = await strapi.entityService.findOne('plugin::users-permissions.user', userId1, {
      populate: ['following']
    });

    return user1.following.some(friend => friend.id === userId2);
  }
}));