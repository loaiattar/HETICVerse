'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    /**
     * Get participants for a video call
     */
    getVideoCallParticipants: async (ctx) => {
        const { id: videoCallId } = ctx.params;
        const { status = 'joined', limit = '50', page = '1' } = ctx.request.query;
        const { user } = ctx.state;
        try {
            // Check if video call exists
            const videoCall = await strapi.db.query('api::video-call.video-call').findOne({
                where: { id: videoCallId }
            });
            if (!videoCall) {
                return ctx.notFound('Video call not found');
            }
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Build filters
            const filters = {
                'videoCall.id': videoCallId
            };
            // Add status filter
            if (status && status !== 'all') {
                filters.status = status;
            }
            // Find participants
            const participants = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
                where: filters,
                orderBy: { joinTime: 'desc' },
                populate: { user: true },
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });
            // Count total participants matching filters
            const count = await strapi.db.query('api::video-call-participant.video-call-participant').count({
                where: filters
            });
            // Format response
            const formattedParticipants = participants.map(participant => {
                var _a;
                return ({
                    id: participant.id,
                    joinTime: participant.joinTime,
                    leaveTime: participant.leaveTime,
                    status: participant.status,
                    hasCamera: participant.hasCamera,
                    hasMicrophone: participant.hasMicrophone,
                    isScreenSharing: participant.isScreenSharing,
                    user: {
                        id: participant.user.id,
                        username: participant.user.username,
                        avatar: (_a = participant.user) === null || _a === void 0 ? void 0 : _a.avatar
                    }
                });
            });
            return {
                data: formattedParticipants,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch participants', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get a user's participation records
     */
    getUserParticipations: async (ctx) => {
        const { limit = '20', page = '1', status } = ctx.request.query;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to view your participations');
        }
        try {
            const limitNum = parseInt(limit);
            const pageNum = parseInt(page);
            // Build filters
            const filters = {
                'user.id': user.id
            };
            // Add status filter
            if (status && status !== 'all') {
                filters.status = status;
            }
            // Find participations
            const participations = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
                where: filters,
                orderBy: { joinTime: 'desc' },
                populate: { videoCall: true },
                limit: limitNum,
                offset: (pageNum - 1) * limitNum
            });
            // Count total participations matching filters
            const count = await strapi.db.query('api::video-call-participant.video-call-participant').count({
                where: filters
            });
            // Format response
            const formattedParticipations = participations.map(participation => ({
                id: participation.id,
                joinTime: participation.joinTime,
                leaveTime: participation.leaveTime,
                status: participation.status,
                hasCamera: participation.hasCamera,
                hasMicrophone: participation.hasMicrophone,
                isScreenSharing: participation.isScreenSharing,
                videoCall: participation.videoCall ? {
                    id: participation.videoCall.id,
                    title: participation.videoCall.title,
                    status: participation.videoCall.status,
                    startTime: participation.videoCall.startTime,
                    endTime: participation.videoCall.endTime
                } : null
            }));
            return {
                data: formattedParticipations,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to fetch participations', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Update participant status (camera, microphone, screen sharing)
     */
    updateParticipantStatus: async (ctx) => {
        const { id } = ctx.params;
        const { hasCamera, hasMicrophone, isScreenSharing } = ctx.request.body;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to update your status');
        }
        try {
            // Find the participant record
            const participant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
                where: { id },
                populate: { user: true, videoCall: true }
            });
            if (!participant) {
                return ctx.notFound('Participant record not found');
            }
            // Check if user owns this participant record
            if (participant.user.id !== user.id) {
                return ctx.forbidden('You can only update your own participant status');
            }
            // Check if still in the call
            if (participant.status !== 'joined') {
                return ctx.badRequest('You are no longer in this call');
            }
            // Build update data
            const updateData = {};
            if (hasCamera !== undefined)
                updateData.hasCamera = hasCamera;
            if (hasMicrophone !== undefined)
                updateData.hasMicrophone = hasMicrophone;
            if (isScreenSharing !== undefined) {
                // If enabling screen sharing, turn off for other participants
                if (isScreenSharing) {
                    const otherScreenSharers = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
                        where: {
                            'videoCall.id': participant.videoCall.id,
                            status: 'joined',
                            isScreenSharing: true,
                            id: { $ne: participant.id }
                        }
                    });
                    // Turn off screen sharing for others
                    for (const sharer of otherScreenSharers) {
                        await strapi.db.query('api::video-call-participant.video-call-participant').update({
                            where: { id: sharer.id },
                            data: { isScreenSharing: false }
                        });
                    }
                }
                updateData.isScreenSharing = isScreenSharing;
            }
            // Update participant
            await strapi.db.query('api::video-call-participant.video-call-participant').update({
                where: { id },
                data: updateData
            });
            // Get updated participant
            const updatedParticipant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
                where: { id }
            });
            return {
                success: true,
                message: 'Participant status updated',
                participant: {
                    id: updatedParticipant.id,
                    hasCamera: updatedParticipant.hasCamera,
                    hasMicrophone: updatedParticipant.hasMicrophone,
                    isScreenSharing: updatedParticipant.isScreenSharing
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to update participant status', {
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
            // Find the participant record
            const participant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
                where: { id },
                populate: { user: true, videoCall: true }
            });
            if (!participant) {
                return ctx.notFound('Participant record not found');
            }
            // Check if user owns this participant record
            if (participant.user.id !== user.id) {
                return ctx.forbidden('You can only leave your own video call session');
            }
            // Check if still in the call
            if (participant.status !== 'joined') {
                return ctx.badRequest('You are no longer in this call');
            }
            // Update participant status
            await strapi.db.query('api::video-call-participant.video-call-participant').update({
                where: { id },
                data: {
                    status: 'left',
                    leaveTime: new Date(),
                    isScreenSharing: false
                }
            });
            // If creator left and video call is active, check if any participants remain
            if (participant.videoCall.creator === user.id && participant.videoCall.status === 'active') {
                const remainingParticipants = await strapi.db.query('api::video-call-participant.video-call-participant').count({
                    where: {
                        'videoCall.id': participant.videoCall.id,
                        status: 'joined'
                    }
                });
                // If no participants remain, end the call
                if (remainingParticipants === 0) {
                    await strapi.db.query('api::video-call.video-call').update({
                        where: { id: participant.videoCall.id },
                        data: {
                            status: 'ended',
                            endTime: new Date()
                        }
                    });
                }
            }
            return {
                success: true,
                message: 'Left video call successfully'
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to leave video call', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Kick a participant (for call creator only)
     */
    kickParticipant: async (ctx) => {
        const { id } = ctx.params;
        const { user } = ctx.state;
        if (!user) {
            return ctx.unauthorized('You must be logged in to kick participants');
        }
        try {
            // Find the participant record
            const participant = await strapi.db.query('api::video-call-participant.video-call-participant').findOne({
                where: { id },
                populate: { user: true, videoCall: { populate: ['creator'] } }
            });
            if (!participant) {
                return ctx.notFound('Participant record not found');
            }
            // Check if user is the call creator
            if (participant.videoCall.creator.id !== user.id) {
                return ctx.forbidden('Only the call creator can kick participants');
            }
            // Check if trying to kick themselves
            if (participant.user.id === user.id) {
                return ctx.badRequest('You cannot kick yourself');
            }
            // Check if participant is still in the call
            if (participant.status !== 'joined') {
                return ctx.badRequest('This participant is no longer in the call');
            }
            // Update participant status
            await strapi.db.query('api::video-call-participant.video-call-participant').update({
                where: { id },
                data: {
                    status: 'kicked',
                    leaveTime: new Date(),
                    isScreenSharing: false
                }
            });
            return {
                success: true,
                message: `${participant.user.username} has been kicked from the call`
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to kick participant', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    },
    /**
     * Get participant statistics for a video call
     */
    getCallStatistics: async (ctx) => {
        const { id: videoCallId } = ctx.params;
        const { user } = ctx.state;
        try {
            // Check if video call exists
            const videoCall = await strapi.db.query('api::video-call.video-call').findOne({
                where: { id: videoCallId },
                populate: { creator: true }
            });
            if (!videoCall) {
                return ctx.notFound('Video call not found');
            }
            // If private call, check if user is creator
            if (videoCall.isPrivate && (!user || (videoCall.creator.id !== user.id))) {
                return ctx.forbidden('Only the call creator can view statistics for private calls');
            }
            // Get all participants
            const participants = await strapi.db.query('api::video-call-participant.video-call-participant').findMany({
                where: { 'videoCall.id': videoCallId },
                populate: { user: true }
            });
            // Calculate statistics
            const totalParticipants = participants.length;
            const currentParticipants = participants.filter(p => p.status === 'joined').length;
            const leftParticipants = participants.filter(p => p.status === 'left').length;
            const kickedParticipants = participants.filter(p => p.status === 'kicked').length;
            // Calculate average time spent
            let totalTimeSpent = 0;
            let participantsWithTimeSpent = 0;
            for (const participant of participants) {
                if (participant.joinTime) {
                    const leaveTime = participant.leaveTime || new Date();
                    const timeSpent = leaveTime.getTime() - new Date(participant.joinTime).getTime();
                    totalTimeSpent += timeSpent;
                    participantsWithTimeSpent++;
                }
            }
            const averageTimeSpentMs = participantsWithTimeSpent > 0 ? totalTimeSpent / participantsWithTimeSpent : 0;
            const averageTimeSpentMinutes = Math.floor(averageTimeSpentMs / (1000 * 60));
            return {
                videoCall: {
                    id: videoCall.id,
                    title: videoCall.title,
                    status: videoCall.status,
                    startTime: videoCall.startTime,
                    endTime: videoCall.endTime,
                    maxParticipants: videoCall.maxParticipants
                },
                statistics: {
                    totalParticipants,
                    currentParticipants,
                    leftParticipants,
                    kickedParticipants,
                    averageTimeSpentMinutes,
                    peakConcurrentParticipants: currentParticipants // This is approximate
                }
            };
        }
        catch (err) {
            return ctx.badRequest('Failed to get call statistics', {
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }
};
