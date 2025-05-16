'use strict';

/**
 * Custom community-member controller
 */

// Update the MembershipStatus type at the top of the file
type MembershipStatus = 'active' | 'muted' | 'banned';

interface MemberQueryParams {
    limit?: string;
    page?: string;
    sort?: 'newest' | 'oldest' | 'username' | 'role' | 'name';
    community?: string;
    user?: string;
    status?: MembershipStatus | 'blocked';
    role?: 'member' | 'moderator' | 'admin';
    search?: string;
}

interface User {
    id: number;
    username: string;
    email?: string;
    avatar?: string;
}

interface Community {
    id: number;
    name: string;
    slug: string;
    image?: string;
    privacy: 'public' | 'private' | 'restricted';
    description?: string;
}

interface CommunityMember {
    id: number;
    documentId: string;
    locale?: string;
    createdAt?: string;
    publishedAt?: string;
    updatedAt?: string;

    status?: MembershipStatus;  // Defined as 'status' but used as 'statu' in code
    role?: 'member' | 'moderator' | 'admin';  // Defined as 'role' but used as 'Role' in some places
    lastActive?: string;
    since?: string;
    users_permissions_user?: User;
    community?: Community;
}

interface FormattedMember {
    id: number;
    status: string;
    role: string;
    joinDate: string;
    user?: {
        id: number;
        username: string;
        avatar?: string;
    } | null;
    community?: {
        id: number;
        name: string;
        slug: string;
        image?: string;
    } | null;
}

interface CustomContext {
    params: Record<string, any>;
    state: {
        user?: User;
        [key: string]: any;
    };
    request: {
        body: any;
        [key: string]: any;
    };
    query: MemberQueryParams;
    unauthorized: (msg: string) => any;
    notFound: (msg: string) => any;
    badRequest: (msg: string, data?: any) => any;
    forbidden: (msg: string) => any;
}

interface CommunityMemberController {
    joinCommunity: (ctx: CustomContext) => Promise<any>;
    leaveCommunity: (ctx: CustomContext) => Promise<any>;
    updateMember: (ctx: CustomContext) => Promise<any>;
    getCommunityMembers: (ctx: CustomContext) => Promise<any>;
}

const customCommunityMemberController: CommunityMemberController = {
    /**
     * Join a community
     */
    joinCommunity: async (ctx: CustomContext): Promise<any> => {
        const { communityId } = ctx.params;
        const { user } = ctx.state;

        if (!user) return ctx.unauthorized('You must be logged in to join a community');

        try {
            const community = await strapi.entityService.findOne('api::community.community', communityId) as Community;
            if (!community) return ctx.notFound('Community not found');

            const existingMembership = await strapi.entityService.findMany('api::community-member.community-member', {
                filters: {
                    users_permissions_user: { id: user.id },
                    community: { id: communityId },
                },
            });

            if (existingMembership.length > 0) {
                const memberStatus = existingMembership[0].status as MembershipStatus;
                switch (memberStatus) {
                    case 'active':
                        return ctx.badRequest('You are already a member of this community');
                    case 'muted':
                        return ctx.badRequest('You are blocked from this community');
                    default:
                        return ctx.badRequest('Invalid membership status');
                }
            }

            let membershipStatus: MembershipStatus = 'active';
            // If your model does not support 'pending', treat restricted as 'muted' or another allowed status, or handle as forbidden
            if (community.privacy === 'restricted') membershipStatus = 'muted'; // or handle as forbidden if needed
            if (community.privacy === 'private') return ctx.forbidden('This community is private and requires an invitation to join');

            const membership = await strapi.entityService.create('api::community-member.community-member', {
                data: {
                    statu: membershipStatus,
                    role: 'member',
                    since: new Date().toISOString(),
                    users_permissions_user: user.id,
                    community: communityId,
                },
                populate: ['users_permissions_user', 'community'],
            }) as CommunityMember;

            // if (membershipStatus === 'pending') {
            //     const moderators = await strapi.entityService.findMany('api::community-member.community-member', {
            //         filters: {
            //             community: { id: communityId },
            //             role: { $in: ['moderator', 'admin'] },
            //             status: 'active',
            //         },
            //         populate: ['users_permissions_user'],
            //     }) as CommunityMember[];

            //     for (const mod of moderators) {
            //         if (mod.users_permissions_user?.id !== user.id) {
            //             await strapi.entityService.create('api::notification.notification', {
            //                 data: {
            //                     type: 'join-request',
            //                     content: `${user.username} requested to join ${community.name}`,
            //                     read: false,
            //                     date: new Date().toISOString(),
            //                     link: `/communities/${community.slug}/members`,
            //                     users_permissions_user: mod.users_permissions_user.id,
            //                 },
            //             });
            //         }
            //     }
            // }

            return {
                success: true,
                message:
                    membershipStatus === 'active'
                        ? 'You have joined the community'
                        : 'Your membership request is pending approval',
                membership: {
                    id: membership.id,
                    status: membership.status,
                    role: membership.role,
                    joinDate: membership.since,
                    user: membership.users_permissions_user
                        ? {
                                id: membership.users_permissions_user.id,
                                username: membership.users_permissions_user.username,
                            }
                        : null,
                    community: membership.community
                        ? {
                                id: membership.community.id,
                                name: membership.community.name,
                                slug: membership.community.slug,
                            }
                        : null,
                },
            };
        } catch (err) {
            return ctx.badRequest('Failed to join community', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    },

    /**
     * Leave a community
     */
    leaveCommunity: async (ctx: CustomContext): Promise<any> => {
        const { communityId } = ctx.params;
        const { user } = ctx.state;

        if (!user) return ctx.unauthorized('You must be logged in to leave a community');

        try {
            const community = await strapi.entityService.findOne('api::community.community', communityId) as Community;
            if (!community) return ctx.notFound('Community not found');

            const membership = await strapi.entityService.findMany('api::community-member.community-member', {
                filters: {
                    users_permissions_user: { id: user.id },
                    community: { id: communityId },
                },
            });

            if (!membership.length) return ctx.badRequest('You are not a member of this community');

            const isAdmin = membership[0].Role === 'admin';

            if (isAdmin) {
                const admins = await strapi.entityService.findMany('api::community-member.community-member', {
                    filters: {
                        community: { id: communityId },
                        role: 'admin',
                        status: 'active',
                    },
                }) as CommunityMember[];

                if (admins.length === 1) {
                    return ctx.badRequest('You cannot leave the community as you are the only admin. Please promote another member to admin first.');
                }
            }

            await strapi.entityService.delete('api::community-member.community-member', membership[0].id);

            return {
                success: true,
                message: 'You have left the community',
            };
        } catch (err) {
            return ctx.badRequest('Failed to leave community', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    },

    /**
     * Update a member's role or status
     */
    updateMember: async (ctx: CustomContext): Promise<any> => {
        const { memberId } = ctx.params;
        const { role, status } = ctx.request.body;
        const { user } = ctx.state;

        if (!user) return ctx.unauthorized('You must be logged in to update a member');

        try {
            const membership = await strapi.entityService.findOne('api::community-member.community-member', memberId, {
                populate: ['users_permissions_user', 'community'],
            }) as CommunityMember;

            if (!membership) return ctx.notFound('Membership not found');

            const userMembership = await strapi.entityService.findMany('api::community-member.community-member', {
                filters: {
                    users_permissions_user: { id: user.id },
                    community: { id: membership.community?.id },
                    status: 'active',
                    role: { $in: ['moderator', 'admin'] },
                },
            }) as CommunityMember[];

            if (!userMembership.length) return ctx.forbidden('You do not have permission to update members in this community');

            const isAdmin = userMembership[0].role === 'admin';
            const isModerator = userMembership[0].role === 'moderator';

            if (isModerator && !isAdmin) {
                if (role && role !== 'member') return ctx.forbidden('Moderators cannot change member roles');
                if (['admin', 'moderator'].includes(membership.role || '')) return ctx.forbidden('Moderators cannot update other moderators or admins');
            }

            if (role && !['member', 'moderator', 'admin'].includes(role)) return ctx.badRequest('Invalid role. Must be one of: member, moderator, admin');
            if (status && !['active', 'muted', 'panned'].includes(status)) return ctx.badRequest('Invalid status. Must be one of: active, muted, panned');
            if (status && !['active', 'panned', 'muted', 'pending', 'blocked'].includes(status)) return ctx.badRequest('Invalid status. Must be one of: active, panned, muted, pending, blocked');

            if (membership.role === 'admin' && role && role !== 'admin') {
                const admins = await strapi.entityService.findMany('api::community-member.community-member', {
                    filters: {
                        community: { id: membership.community?.id },
                        role: 'admin',
                        status: 'active',
                    },
                }) as CommunityMember[];

                if (admins.length === 1) return ctx.badRequest('Cannot demote the last admin of the community');
            }

            const updateData: Partial<CommunityMember> = {};
            if (role) updateData.role = role as 'admin' | 'member' | 'moderator';
            if (status) updateData.status = status as MembershipStatus;

            const updatedMembership =
                await strapi.entityService.update('api::community-member.community-member', memberId, {
                    data: updateData,
                    populate: ['users_permissions_user', 'community'],
                }) as CommunityMember;  
                const formattedMember: FormattedMember = {
                        id: updatedMembership.id,
                        status: updatedMembership.status || 'unknown',
                        role: updatedMembership.role || 'member',
                        joinDate: updatedMembership.since || new Date().toISOString(),
                        user: updatedMembership.users_permissions_user
                                ? {
                                        id: updatedMembership.users_permissions_user.id,
                                        username: updatedMembership.users_permissions_user.username,
                                        avatar: updatedMembership.users_permissions_user.avatar,
                                }
                                : null,
                        community: updatedMembership.community
                                ? {
                                        id: updatedMembership.community.id,
                                        name: updatedMembership.community.name,
                                        slug: updatedMembership.community.slug,
                                        image: updatedMembership.community.image,
                                }
                                : null,
                        };  
                return {
                        success: true,
                        message: 'Member updated successfully',
                        membership: formattedMember,
                };  
        } catch (err) {
            return ctx.badRequest('Failed to update member', {
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        }
        },
        /** 
         * Get community members with pagination and filtering
         * @param {Object} ctx - The context object
         * @param {string} ctx.params.communityId - The ID of the community
         * @param {Object} ctx.query - The query parameters
         * @param {string} ctx.query.limit - The number of members to return per page
         *  
         * @param {string} ctx.query.page - The page number to return
         * @param {string} ctx.query.sort - The sorting criteria
         *  
         * @param {string} ctx.query.community - The ID of the community
         * @param {string} ctx.query.user - The ID of the user
         *  
         *  
         *  
         *  
         *  
         *  
         * @param {string} ctx.query.status - The status of the member
         * @param {string} ctx.query.role - The role of the member
         *  
         *  
         *  * @param {string} ctx.query.search - The search term
         *      
         *  
         *  
         *  
         *  
                * @returns {Object} - The response object containing the members
                * @throws {Object} - The error object if an error occurs                
                *   
                */

    /**
 * Get community members with pagination and filtering
 */
getCommunityMembers: async (ctx: CustomContext): Promise<any> => {
  const { communityId } = ctx.params;
  const {
    limit = '10',
    page = '1',
    sort = 'newest',
    status,
    role,
    search,
  } = ctx.query;

  const user = ctx.state.user;

  if (!user) return ctx.unauthorized('You must be logged in to view community members');

  try {
    // Validate community existence
    const community = await strapi.entityService.findOne('api::community.community', communityId);
    if (!community) return ctx.notFound('Community not found');

    // Build filters
    const filters: Record<string, any> = { community: { id: communityId } };

    if (status) filters.status = status;
    if (role) filters.role = role;

    if (search) {
      filters.$or = [
        { 'users_permissions_user.username': { $containsi: search } },
        { 'users_permissions_user.email': { $containsi: search } },
      ];
    }

    // Pagination params
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);
    const start = (pageNum - 1) * limitNum;

    // Sorting mapping
    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'username':
        orderBy = { 'users_permissions_user.username': 'asc' };
        break;
      case 'role':
        orderBy = { role: 'asc' };
        break;
      case 'name':
        orderBy = { 'users_permissions_user.username': 'asc' };
        break;
    }

    // Fetch members
    const members = await strapi.entityService.findMany('api::community-member.community-member', {
      filters,
      sort: orderBy,
      populate: ['users_permissions_user', 'community'],
      pagination: {
        start,
        limit: limitNum,
      },
    }) as CommunityMember[];

    // Count total
    const totalCount = await strapi.entityService.count('api::community-member.community-member', { filters });

    // Format members for response
    const formattedMembers: FormattedMember[] = members.map((member) => ({
      id: member.id,
      status: member.status || 'unknown',
      role: member.role || 'member',
      joinDate: member.since || new Date().toISOString(),
      user: member.users_permissions_user
        ? {
            id: member.users_permissions_user.id,
            username: member.users_permissions_user.username,
            avatar: member.users_permissions_user.avatar,
          }
        : null,
      community: member.community
        ? {
            id: member.community.id,
            name: member.community.name,
            slug: member.community.slug,
            image: member.community.image,
          }
        : null,
    }));

    return {
      success: true,
      members: formattedMembers,
      pagination: {
        total: totalCount,
        page: pageNum,
        pageSize: limitNum,
        pageCount: Math.ceil(totalCount / limitNum),
      },
    };
  } catch (err) {
    return ctx.badRequest('Failed to fetch community members', {
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
},
};
export default customCommunityMemberController;