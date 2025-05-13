'use strict';

/**
 * Custom video call controller
 */

interface VideoCallQueryParams {
  limit?: string;
  page?: string;
  status?: string;
  community?: string;
  user?: string;
}

export default {
  /**
   * Create a new video call
   */
  createVideoCall: async (ctx) => {
    const { 
      title, 
      description, 
      startTime, 
      maxParticipants, 
      isPrivate, 
      communityId 
    } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a video call');
    }
    
    try {
      // Validate required fields
      if (!title) {
        return ctx.badRequest('Title is required');
      }
      
      // Generate access code for private calls
      const accessCode = isPrivate ? Math.random().toString(36).substring(2, 10).toUpperCase() : null;
      
      // Create new video call
      const videoCall = await strapi.db.query('api::video-call.video-call').create({
        data: {
          title,
          description: description || null,
          status: 'scheduled',
          startTime: startTime || new Date(),
          maxParticipants: maxParticipants || 10,
          isPrivate: isPrivate || false,
          accessCode
        }
      });
      
      // Connect creator
      await strapi.db.query('api::video-call.video-call').update({
        where: { id: videoCall.id },
        data: {
          creator: {
            connect: [{ id: user.id }]
          }
        }
      });
      
      // Connect community if provided
      if (communityId) {
        await strapi.db.query('api::video-call.video-call').update({
          where: { id: videoCall.id },
          data: {
            community: {
              connect: [{ id: communityId }]
            }
          }
        });
      }
      
      // Create participant record for creator
      await strapi.db.query('api::video-call-participant.video-call-participant').create({
        data: {
          joinTime: new Date(),
          status: 'joined',
          hasCamera: true,
          hasMicrophone: true,
          isScreenSharing: false
        }
      });
      
      // Connect participant to user and video call
      const participants = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
        where: {
          joinTime: { $gte: new Date(Date.now() - 1000) }
        },
        limit: 1
      });
      
      if (participants && participants.length > 0) {
        await strapi.db.query('api::video-call-participant.video-call-participant').update({
          where: { id: participants[0].id },
          data: {
            user: {
              connect: [{ id: user.id }]
            },
            videoCall: {
              connect: [{ id: videoCall.id }]
            }
          }
        });
      }
      
      // Fetch complete video call
      const completeVideoCall = await strapi.db.query('api::video-call.video-call').findOne({
        where: { id: videoCall.id },
        populate: '*'
      });
      
      return {
        success: true,
        message: 'Video call created successfully',
        videoCall: {
          id: completeVideoCall.id,
          title: completeVideoCall.title,
          description: completeVideoCall.description,
          status: completeVideoCall.status,
          startTime: completeVideoCall.startTime,
          maxParticipants: completeVideoCall.maxParticipants,
          isPrivate: completeVideoCall.isPrivate,
          accessCode: completeVideoCall.accessCode
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to create video call', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Update a video call
   */
  updateVideoCall: async (ctx) => {
    const { id } = ctx.params;
    const { 
      title, 
      description, 
      status, 
      startTime, 
      endTime, 
      maxParticipants, 
      isPrivate 
    } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to update a video call');
    }
    
    try {
      // Check if video call exists
      const videoCall = await strapi.db.query('api::video-call.video-call').findOne({
        where: { id },
        populate: { creator: true }
      });
      
      if (!videoCall) {
        return ctx.notFound('Video call not found');
      }
      
      // Check if user is the creator
      if (videoCall.creator.id !== user.id) {
        return ctx.forbidden('Only the creator can update the video call');
      }
      
      // Build update data
      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status && ['scheduled', 'active', 'ended'].includes(status)) updateData.status = status;
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;
      
      // Handle privacy and access code changes
      if (isPrivate !== undefined) {
        updateData.isPrivate = isPrivate;
        
        // If changing from private to public, remove access code
        if (videoCall.isPrivate && !isPrivate) {
          updateData.accessCode = null;
        }
        
        // If changing from public to private, generate access code
        if (!videoCall.isPrivate && isPrivate) {
          updateData.accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        }
      }
      
      // Update video call
      await strapi.db.query('api::video-call.video-call').update({
        where: { id },
        data: updateData
      });
      
      // Fetch updated video call
      const updatedVideoCall = await strapi.db.query('api::video-call.video-call').findOne({
        where: { id },
        populate: '*'
      });
      
      return {
        success: true,
        message: 'Video call updated successfully',
        videoCall: {
          id: updatedVideoCall.id,
          title: updatedVideoCall.title,
          description: updatedVideoCall.description,
          status: updatedVideoCall.status,
          startTime: updatedVideoCall.startTime,
          endTime: updatedVideoCall.endTime,
          maxParticipants: updatedVideoCall.maxParticipants,
          isPrivate: updatedVideoCall.isPrivate,
          accessCode: updatedVideoCall.accessCode
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to update video call', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Delete a video call
   */
  deleteVideoCall: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to delete a video call');
    }
    
    try {
      // Check if video call exists
      const videoCall = await strapi.db.query('api::video-call.video-call').findOne({
        where: { id },
        populate: { creator: true }
      });
      
      if (!videoCall) {
        return ctx.notFound('Video call not found');
      }
      
      // Check if user is the creator
      if (videoCall.creator.id !== user.id) {
        return ctx.forbidden('Only the creator can delete the video call');
      }
      
      // Delete related participant records
      const participants = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
        where: { 'videoCall.id': videoCall.id }
      });
      
      for (const participant of participants) {
        await strapi.db.query('api::video-call-participant.video-call-participant').delete({
          where: { id: participant.id }
        });
      }
      
      // Delete the video call
      await strapi.db.query('api::video-call.video-call').delete({
        where: { id }
      });
      
      return {
        success: true,
        message: 'Video call deleted successfully'
      };
    } catch (err) {
      return ctx.badRequest('Failed to delete video call', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get a single video call with details
   */
  getVideoCall: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    try {
      // Check if video call exists
      const videoCall = await strapi.db.query('api::video-call.video-call').findOne({
        where: { id },
        populate: '*'
      });
      
      if (!videoCall) {
        return ctx.notFound('Video call not found');
      }
      
      // Get current participants
      const participants = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
        where: { 
          'videoCall.id': videoCall.id,
          status: 'joined'
        },
        populate: { user: true }
      });
      
      // Format participants
      const formattedParticipants = participants.map(participant => ({
        id: participant.id,
        joinTime: participant.joinTime,
        hasCamera: participant.hasCamera,
        hasMicrophone: participant.hasMicrophone,
        isScreenSharing: participant.isScreenSharing,
        user: {
          id: participant.user.id,
          username: participant.user.username
        }
      }));
      
      // Check if user has joined this call
      let hasJoined = false;
      if (user) {
        const userParticipant = participants.find(p => p.user.id === user.id);
        hasJoined = !!userParticipant;
      }
      
      return {
        id: videoCall.id,
        title: videoCall.title,
        description: videoCall.description,
        status: videoCall.status,
        startTime: videoCall.startTime,
        endTime: videoCall.endTime,
        maxParticipants: videoCall.maxParticipants,
        isPrivate: videoCall.isPrivate,
        accessCode: videoCall.creator?.id === user?.id ? videoCall.accessCode : undefined,
        creator: videoCall.creator ? {
          id: videoCall.creator.id,
          username: videoCall.creator.username
        } : null,
        community: videoCall.community ? {
          id: videoCall.community.id,
          name: videoCall.community.name,
          slug: videoCall.community.slug
        } : null,
        participants: formattedParticipants,
        participantCount: formattedParticipants.length,
        hasJoined,
        canJoin: videoCall.status === 'active' && formattedParticipants.length < videoCall.maxParticipants
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch video call', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get video calls with filtering
   */
  getVideoCalls: async (ctx) => {
    const { 
      limit = '20', 
      page = '1', 
      status = 'active',
      community,
      user: userId
    } = ctx.request.query as VideoCallQueryParams;
    const { user } = ctx.state;
    
    try {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Build filters
      const filters: any = {};
      
      // Add status filter
      if (status && status !== 'all') {
        filters.status = status;
      }
      
      // Add community filter
      if (community) {
        filters['community.id'] = community;
      }
      
      // Add creator filter
      if (userId) {
        filters['creator.id'] = userId;
      }
      
      // Find video calls
      const videoCalls = await strapi.db.query('api::video-call.video-call').findMany({
        where: filters,
        orderBy: { startTime: 'desc' },
        populate: '*',
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });
      
      // Count total video calls matching filters
      const count = await strapi.db.query('api::video-call.video-call').count({
        where: filters
      });
      
      // Format response
      const formattedVideoCalls = await Promise.all(
        videoCalls.map(async (videoCall) => {
          // Count current participants
          const participantCount = await strapi.db.query('api::video-call-participant.video-call-participant').count({
            where: { 
              'videoCall.id': videoCall.id,
              status: 'joined'
            }
          });
          
          return {
            id: videoCall.id,
            title: videoCall.title,
            description: videoCall.description,
            status: videoCall.status,
            startTime: videoCall.startTime,
            endTime: videoCall.endTime,
            maxParticipants: videoCall.maxParticipants,
            isPrivate: videoCall.isPrivate,
            creator: videoCall.creator ? {
              id: videoCall.creator.id,
              username: videoCall.creator.username
            } : null,
            community: videoCall.community ? {
              id: videoCall.community.id,
              name: videoCall.community.name,
              slug: videoCall.community.slug
            } : null,
            participantCount
          };
        })
      );
      
      return {
        data: formattedVideoCalls,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch video calls', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Join a video call
   */
  joinVideoCall: async (ctx) => {
    const { id } = ctx.params;
    const { accessCode, hasCamera = true, hasMicrophone = true } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to join a video call');
    }
    
    try {
      // Check if video call exists
      const videoCall = await strapi.db.query('api::video-call.video-call').findOne({
        where: { id },
        populate: '*'
      });
      
      if (!videoCall) {
        return ctx.notFound('Video call not found');
      }
      
      // Check if call is active
      if (videoCall.status !== 'active') {
        return ctx.badRequest('This video call is not active');
      }
      
      // Check access code for private calls
      if (videoCall.isPrivate && videoCall.accessCode !== accessCode && videoCall.creator?.id !== user.id) {
        return ctx.forbidden('Invalid access code');
      }
      
      // Count current participants
      const participantCount = await strapi.db.query('api::video-call-participant.video-call-participant').count({
        where: { 
          'videoCall.id': videoCall.id,
          status: 'joined'
        }
      });
      
      // Check if call is full
      if (participantCount >= videoCall.maxParticipants) {
        return ctx.badRequest('This video call is full');
      }
      
      // Check if user is already in the call
      const existingParticipant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'videoCall.id': videoCall.id }
          ]
        }
      });
      
      if (existingParticipant) {
        if (existingParticipant.status === 'joined') {
          // Update participant settings
          await strapi.db.query('api::video-call-participant.video-call-participant').update({
            where: { id: existingParticipant.id },
            data: {
              hasCamera,
              hasMicrophone
            }
          });
          
          return {
            success: true,
            message: 'Video call settings updated',
            participantId: existingParticipant.id
          };
        } else {
          // Update participant status
          await strapi.db.query('api::video-call-participant.video-call-participant').update({
            where: { id: existingParticipant.id },
            data: {
              status: 'joined',
              joinTime: new Date(),
              leaveTime: null,
              hasCamera,
              hasMicrophone
            }
          });
        }
      } else {
        // Create new participant record
        const newParticipant = await strapi.db.query('api::video-call-participant.video-call-participant').create({
          data: {
            joinTime: new Date(),
            status: 'joined',
            hasCamera,
            hasMicrophone,
            isScreenSharing: false
          }
        });
        
        // Connect participant to user and video call
        await strapi.db.query('api::video-call-participant.video-call-participant').update({
          where: { id: newParticipant.id },
          data: {
            user: {
              connect: [{ id: user.id }]
            },
            videoCall: {
              connect: [{ id: videoCall.id }]
            }
          }
        });
      }
      
      // Get all participants for response
      const allParticipants = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
        where: { 
          'videoCall.id': videoCall.id,
          status: 'joined' 
        },
        populate: { user: true }
      });
      
      // Format participants
      const formattedParticipants = allParticipants.map(participant => ({
        id: participant.id,
        joinTime: participant.joinTime,
        hasCamera: participant.hasCamera,
        hasMicrophone: participant.hasMicrophone,
        isScreenSharing: participant.isScreenSharing,
        user: {
          id: participant.user.id,
          username: participant.user.username
        }
      }));
      
      return {
        success: true,
        message: 'Joined video call successfully',
        videoCall: {
          id: videoCall.id,
          title: videoCall.title,
          status: videoCall.status,
          isPrivate: videoCall.isPrivate,
          participants: formattedParticipants
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to join video call', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Leave a video call
   */
  leaveVideoCall: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to leave a video call');
    }
    
    try {
      // Find user's participant record
      const participant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'videoCall.id': id },
            { status: 'joined' }
          ]
        }
      });
      
      if (!participant) {
        return ctx.badRequest('You are not in this video call');
      }
      
      // Update participant status
      await strapi.db.query('api::video-call-participant.video-call-participant').update({
        where: { id: participant.id },
        data: {
          status: 'left',
          leaveTime: new Date()
        }
      });
      
      return {
        success: true,
        message: 'Left video call successfully'
      };
    } catch (err) {
      return ctx.badRequest('Failed to leave video call', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Update participant settings (camera, microphone, screen sharing)
   */
  updateParticipantSettings: async (ctx) => {
    const { id } = ctx.params;
    const { hasCamera, hasMicrophone, isScreenSharing } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to update settings');
    }
    
    try {
      // Find user's participant record
      const participant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'videoCall.id': id },
            { status: 'joined' }
          ]
        }
      });
      
      if (!participant) {
        return ctx.badRequest('You are not in this video call');
      }
      
      // Build update data
      const updateData: any = {};
      if (hasCamera !== undefined) updateData.hasCamera = hasCamera;
      if (hasMicrophone !== undefined) updateData.hasMicrophone = hasMicrophone;
      if (isScreenSharing !== undefined) updateData.isScreenSharing = isScreenSharing;
      
      // Update participant
      await strapi.db.query('api::video-call-participant.video-call-participant').update({
        where: { id: participant.id },
        data: updateData
      });
      
      return {
        success: true,
        message: 'Settings updated successfully'
      };
    } catch (err) {
      return ctx.badRequest('Failed to update settings', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
};