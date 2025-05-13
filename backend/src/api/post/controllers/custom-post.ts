'use strict';

/**
 * Custom post controller
 */

interface PostQueryParams {
  limit?: string;
  page?: string;
  sort?: string;
  community?: string;
  user?: string;
  search?: string;
  type?: string;
}

interface User {
  id: number;
  username: string;
  avatar?: string;
}

interface Community {
  id: number;
  name: string;
  slug: string;
  image?: string;
  privacy: string;
}

interface Image {
  id: number;
  url: string;
}

interface Post {
  id: number;
  title: string;
  content: any;
  type: string;
  URL: string | null;
  vote: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  community?: Community;
  image?: Image;
}

interface Vote {
  id: number;
  value: number;
}

interface Bookmark {
  id: number;
  date: string;
}

interface CommunityMember {
  id: number;
  community: Community;
  status: string;
}

interface CompletePost {
  id: number;
  title: string;
  content: any;
  type: string;
  URL: string | null;
  vote: number;
  createdAt: string;
  user?: {
    id: number;
    username: string;
  };
  community?: {
    id: number;
    name: string;
    slug: string;
  };
  image?: {
    id: number;
    url: string;
  };
}

type StrapiEntity = {
  id: number;
  attributes: Record<string, any>;
};

type StrapiPost = StrapiEntity & {
  attributes: {
    title: string;
    content: any;
    type: string;
    URL: string | null;
    vote: number;
    createdAt: string;
    updatedAt: string;
    user?: {
      data: StrapiEntity & {
        attributes: {
          username: string;
          avatar?: string;
        }
      }
    };
    community?: {
      data: StrapiEntity & {
        attributes: {
          name: string;
          slug: string;
          image?: string;
          privacy: string;
        }
      }
    };
    image?: {
      data: StrapiEntity & {
        attributes: {
          url: string;
        }
      }
    };
  }
};

type StrapiVote = StrapiEntity & {
  attributes: {
    value: number;
  }
};

type StrapiBookmark = StrapiEntity & {
  attributes: {
    date: string;
  }
};

type StrapiCommunityMember = StrapiEntity & {
  attributes: {
    community: {
      data: StrapiEntity & {
        attributes: {
          name: string;
          slug: string;
          privacy: string;
        }
      }
    };
    status: string;
  };
  community?: {
    id: number;
    name: string;
    slug: string;
    privacy: string;
  };
};

export default {
  /**
   * Create a new post
   */
  createPost: async (ctx) => {
    const { title, content, type, communityId, URL, image } = ctx.request.body.data;
    const { user } = ctx.state;

    console.log(ctx.request.body);
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to create a post');
    }
    
    try {
      // Validate required fields
      if (!title) {
        return ctx.badRequest('Title is required');
      }
      
      if (!communityId) {
        return ctx.badRequest('Community is required');
      }
      
      // Check if community exists
      const community = await strapi.db.query('api::community.community').findOne({
        where: { id: communityId }
      });
      
      if (!community) {
        return ctx.notFound('Community not found');
      }
      
      // Check if user is a member of the community
      // const isMember = await strapi.documents('api::community-member.community-member').findMany({
      //   where: {
      //     $and: [
      //       { 'user.id': user.id },
      //       { 'community.id': communityId },
      //       { status: 'active' }
      //     ]
      //   }
      // });

      const isMember = await strapi.documents('api::community-member.community-member').findMany({
        filters: {
          users_permissions_user: {
            id: user.id
          },
          community: {
            id: communityId
          },
          statu: 'active'
        }
      });

      console.log(isMember);

      if (!isMember && community.privacy !== 'public') {
        return ctx.forbidden('You must be a member of this community to post');
      }
      
      // Validate post type
      const validTypes = ['text', 'link', 'image'];
      if (!validTypes.includes(type)) {
        return ctx.badRequest('Invalid post type. Must be one of: text, link, image');
      }
      
      // Validate content based on type
      if (type === 'text' && !content) {
        return ctx.badRequest('Content is required for text posts');
      }
      
      if (type === 'link' && !URL) {
        return ctx.badRequest('URL is required for link posts');
      }
      
      if (type === 'image' && !image) {
        return ctx.badRequest('Image is required for image posts');
      }
      
      // Create the post
      const post = await strapi.entityService.create('api::post.post', {
        data: {
          title,
          content: [{
            type: 'paragraph',
            children: [{
              type: 'text',
              text: content || ''
            }]
          }],
          type,
          URL: URL || null,
          vote: 0,
          user: user.id,
          community: communityId
        }
      });
      
      // If it's an image post, handle the image upload separately
      if (type === 'image' && image) {
        // This would require handling file uploads, which depends on how you're implementing that
        // For now, we'll assume the image is already uploaded and we just need to link it
        await strapi.db.query('api::post.post').update({
          where: { id: post.id },
          data: {
            image: {
              connect: [{ id: image }]
            }
          }
        });
      }
      
      // Fetch the complete post sans populate
      const completePost = await strapi.entityService.findOne('api::post.post', post.id, {
        populate: ['user', 'community', 'image']
      }) as CompletePost;
      
      if (!completePost) {
        return ctx.badRequest('Failed to create post');
      }
      
      // TODO: Create an initial upvote from the poster
      // await strapi.db.query('api::vote.vote').create({
      //   data: {
      //     value: 1,
      //     date: new Date(),
      //     user: {
      //       connect: [{ id: user.id }]
      //     },
      //     post: {
      //       connect: [{ id: post.id }]
      //     }
      //   }
      // });
      
      // Notify community moderators about new post (optional)
      if (community.notifyModerators) {
        const moderators = await strapi.db.query('api::community-member.community-member').findMany({
          where: {
            'community.id': communityId,
            role: { $in: ['moderator', 'admin'] }
          },
          populate: { user: true }
        });
        
        for (const moderator of moderators) {
          if (moderator.user.id !== user.id) {
            await strapi.db.query('api::notification.notification').create({
              data: {
                type: 'post',
                content: `New post in ${community.name}: ${title}`,
                Read: false,
                date: new Date(),
                link: `/communities/${community.slug}/posts/${post.id}`,
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
      }
      
      return {
        success: true,
        message: 'Post created successfully',
        post: {
          id: completePost.id,
          title: completePost.title,
          content: completePost.content,
          type: completePost.type,
          URL: completePost.URL,
          vote: completePost.vote,
          createdAt: completePost.createdAt,
          user: completePost.user ? {
            id: completePost.user.id,
            username: completePost.user.username
          } : null,
          community: completePost.community ? {
            id: completePost.community.id,
            name: completePost.community.name,
            slug: completePost.community.slug
          } : null,
          image: completePost.image ? {
            id: completePost.image.id,
            url: completePost.image.url
          } : null
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to create post', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Update a post
   */
  updatePost: async (ctx) => {
    const { id } = ctx.params;
    const { title, content, URL, image } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to update a post');
    }
    
    try {
      // Check if post exists
      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: { user: true, community: true }
      });
      
      if (!post) {
        return ctx.notFound('Post not found');
      }
      
      // Check if user is the author or a moderator
      const isModerator = await strapi.db.query('api::community-member.community-member').findOne({
        where: {
          $and: [
            { user_id: user.id },
            { community_id: post.community.id },
            { role: { $in: ['moderator', 'admin'] } }
          ]
        }
      });
      
      if (post.user.id !== user.id && !isModerator) {
        return ctx.forbidden('You can only update your own posts');
      }
      
      // Build update data
      const updateData: any = {};
      if (title) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (URL !== undefined) updateData.URL = URL;
      
      // Update post
      await strapi.db.query('api::post.post').update({
        where: { id },
        data: updateData
      });
      
      // Handle image update if provided
      if (image && post.type === 'image') {
        await strapi.db.query('api::post.post').update({
          where: { id },
          data: {
            image: {
              connect: [{ id: image }]
            }
          }
        });
      }
      
      // Fetch updated post
      const updatedPost = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: '*'
      });
      
      return {
        success: true,
        message: 'Post updated successfully',
        post: {
          id: updatedPost.id,
          title: updatedPost.title,
          content: updatedPost.content,
          type: updatedPost.type,
          URL: updatedPost.URL,
          vote: updatedPost.vote,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
          user: {
            id: updatedPost.user.id,
            username: updatedPost.user.username
          },
          community: {
            id: updatedPost.community.id,
            name: updatedPost.community.name,
            slug: updatedPost.community.slug
          },
          image: updatedPost.image ? {
            id: updatedPost.image.id,
            url: updatedPost.image.url
          } : null
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to update post', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Delete a post
   */
  deletePost: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to delete a post');
    }
    
    try {
      // Check if post exists
      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: { user: true, community: true }
      });
      
      if (!post) {
        return ctx.notFound('Post not found');
      }
      
      // Check if user is the author or a moderator
      const isModerator = await strapi.db.query('api::community-member.community-member').findOne({
        where: {
          $and: [
            { user_id: user.id },
            { community_id: post.community.id },
            { role: { $in: ['moderator', 'admin'] } }
          ]
        }
      });
      
      if (post.user.id !== user.id && !isModerator) {
        return ctx.forbidden('You can only delete your own posts');
      }
      
      // Delete all comments
      const comments = await strapi.db.query('api::comment.comment').findMany({
        where: { 'post.id': post.id }
      });
      
      for (const comment of comments) {
        await strapi.db.query('api::comment.comment').delete({
          where: { id: comment.id }
        });
      }
      
      // Delete all votes
      const votes = await strapi.db.query('api::vote.vote').findMany({
        where: { 'post.id': post.id }
      });
      
      for (const vote of votes) {
        await strapi.db.query('api::vote.vote').delete({
          where: { id: vote.id }
        });
      }
      
      // Delete all bookmarks
      const bookmarks = await strapi.db.query('api::bookmark.bookmark').findMany({
        where: { 'post.id': post.id }
      });
      
      for (const bookmark of bookmarks) {
        await strapi.db.query('api::bookmark.bookmark').delete({
          where: { id: bookmark.id }
        });
      }
      
      // Delete the post
      await strapi.db.query('api::post.post').delete({
        where: { id }
      });
      
      return {
        success: true,
        message: 'Post deleted successfully'
      };
    } catch (err) {
      return ctx.badRequest('Failed to delete post', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get a single post with details
   */
  getPost: async (ctx) => {
    const { id } = ctx.params;
    const { user } = ctx.state;
    
    try {
      // Check if post exists
      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: '*'
      });
      
      if (!post) {
        return ctx.notFound('Post not found');
      }
      
      // Check if community is private and user is not a member
      if (post.community.privacy === 'private') {
        // If user is not logged in
        if (!user) {
          return ctx.forbidden('This post is in a private community');
        }
        
        // Check if user is a member
        const isMember = await strapi.db.query('api::community-member.community-member').findOne({
          where: {
            $and: [
              { 'user.id': user.id },
              { 'community.id': post.community.id },
              { status: 'active' }
            ]
          }
        });
        
        if (!isMember) {
          return ctx.forbidden('This post is in a private community');
        }
      }
      
      // Get comment count
      const commentCount = await strapi.db.query('api::comment.comment').count({
        where: { 'post.id': post.id }
      });
      
      // Check if user has voted on this post
      let userVote = null;
      if (user) {
        const vote = await strapi.db.query('api::vote.vote').findOne({
          where: {
            $and: [
              { 'user.id': user.id },
              { 'post.id': post.id }
            ]
          }
        });
        
        if (vote) {
          userVote = vote.value;
        }
      }
      
      // Check if user has bookmarked this post
      let isBookmarked = false;
      if (user) {
        const bookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
          where: {
            $and: [
              { 'user.id': user.id },
              { 'post.id': post.id }
            ]
          }
        });
        
        isBookmarked = !!bookmark;
      }
      
      // Format response
      const formattedPost = {
        id: post.id,
        title: post.title,
        content: post.content,
        type: post.type,
        URL: post.URL,
        vote: post.vote,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        commentCount,
        userVote,
        isBookmarked,
        user: {
          id: post.user.id,
          username: post.user.username,
          avatar: post.user.avatar
        },
        community: {
          id: post.community.id,
          name: post.community.name,
          slug: post.community.slug,
          image: post.community.image
        },
        image: post.image ? {
          id: post.image.id,
          url: post.image.url
        } : null
      };
      
      return formattedPost;
    } catch (err) {
      return ctx.badRequest('Failed to fetch post', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get posts with filtering and sorting
   */
  getPosts: async (ctx) => {
    const { 
      limit = '20', 
      page = '1', 
      sort = 'newest',
      community,
      user: userId,
      search,
      type
    } = ctx.request.query as PostQueryParams;
    const { user } = ctx.state;
    
    try {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Build filters
      const filters: any = {};
      
      // Add community filter
      if (community) {
        // Check if filter is by slug or ID
        if (isNaN(Number(community))) {
          // Filter by slug
          const communityEntity = await strapi.entityService.findMany('api::community.community', {
            filters: { slug: community }
          });
          
          if (communityEntity && communityEntity.length > 0) {
            filters.community = communityEntity[0].id;
            
            // Check if community is private and user is not a member
            if (communityEntity[0].privacy === 'private') {
              // If user is not logged in
              if (!user) {
                return {
                  data: [],
                  meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: 0
                  }
                };
              }
              
              // Check if user is a member
              const isMember = await strapi.entityService.findMany('api::community-member.community-member', {
                filters: {
                  users_permissions_user: {
                    id: {
                      $eq: user.id
                    }
                  },
                  community: {
                    id: {
                      $eq: communityEntity[0].id
                    }
                  },
                  status: 'active'
                }
              }) as unknown as StrapiCommunityMember[];
              
              if (!isMember || isMember.length === 0) {
                return {
                  data: [],
                  meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: 0
                  }
                };
              }
            }
          } else {
            // If community does not exist, return empty result
            return {
              data: [],
              meta: {
                page: pageNum,
                limit: limitNum,
                total: 0
              }
            };
          }
        } else {
          // Filter by ID
          filters.community = community;
          
          // Check if community is private
          const communityEntity = await strapi.entityService.findOne('api::community.community', community);
          
          if (communityEntity && communityEntity.privacy === 'private') {
            // If user is not logged in
            if (!user) {
              return {
                data: [],
                meta: {
                  page: pageNum,
                  limit: limitNum,
                  total: 0
                }
              };
            }
            
            // Check if user is a member
            const isMember = await strapi.entityService.findMany('api::community-member.community-member', {
              filters: {
                users_permissions_user: {
                  id: {
                    $eq: user.id
                  }
                },
                community: {
                  id: {
                    $eq: communityEntity.id
                  }
                },
                status: 'active'
              }
            }) as unknown as StrapiCommunityMember[];
            
            if (!isMember || isMember.length === 0) {
              return {
                data: [],
                meta: {
                  page: pageNum,
                  limit: limitNum,
                  total: 0
                }
              };
            }
          }
        }
      } else {
        // If no community filter, exclude private communities that user is not a member of
        if (user) {
          // Get communities user is a member of
          const memberships = await strapi.entityService.findMany('api::community-member.community-member', {
            filters: { users_permissions_user: user.id },
            populate: ['community']
          }) as unknown as StrapiCommunityMember[];
          
          const memberCommunityIds = memberships
            .map(m => m.community?.id)
            .filter((id): id is number => id !== undefined);
          
          // Get public and restricted communities
          const publicCommunities = await strapi.entityService.findMany('api::community.community', {
            filters: { privacy: { $ne: 'private' } }
          });
          
          const publicCommunityIds = publicCommunities.map(c => c.id);
          
          // Combine IDs of communities user can see
          const allowedCommunityIds = [...new Set([...memberCommunityIds, ...publicCommunityIds])];
          
          filters.community = { $in: allowedCommunityIds };
        } else {
          // For non-logged in users, only show posts from public and restricted communities
          const publicCommunities = await strapi.entityService.findMany('api::community.community', {
            filters: { privacy: { $ne: 'private' } }
          });
          
          const publicCommunityIds = publicCommunities.map(c => c.id);
          filters.community = { $in: publicCommunityIds };
        }
      }
      
      // Add user filter
      if (userId) {
        filters.user = userId;
      }
      
      // Add type filter
      if (type && ['text', 'link', 'image'].includes(type)) {
        filters.type = type;
      }
      
      // Add search filter
      if (search) {
        filters.$or = [
          { title: { $containsi: search } },
          { content: { $containsi: search } }
        ];
      }
      
      // Determine sort order
      let orderBy: any = {};
      switch (sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'top':
          orderBy = { vote: 'desc' };
          break;
        case 'controversial':
          orderBy = { vote: 'asc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
      
      // Find posts
      const posts = await strapi.entityService.findMany('api::post.post', {
        filters,
        sort: orderBy,
        populate: ['user', 'community', 'image'],
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      }) as unknown as StrapiPost[];
      
      // Count total posts matching filters
      const count = await strapi.entityService.count('api::post.post', {
        filters
      });
      
      // Get comment counts, user votes, and bookmarks for posts
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Get comment count
          const commentCount = await strapi.entityService.count('api::comment.comment', {
            filters: {
              post: {
                id: post.id
              }
            }
          });
          
          // Check if user has voted on this post
          let userVote = null;
          const vote = await strapi.entityService.findMany('api::vote.vote' as any, {
            filters: {
              users_permissions_user: {
                id: {
                  $eq: user.id
                }
              },
              post: {
                id: {
                  $eq: post.id
                }
              }
            }
          }) as unknown as StrapiVote[];
          
          if (vote && vote.length > 0) {
            userVote = vote[0].attributes.value;
          }
          
          // Check if user has bookmarked this post
          let isBookmarked = false;
          const bookmark = await strapi.entityService.findMany('api::bookmark.bookmark', {
            filters: {
              users_permissions_user: {
                id: {
                  $eq: user.id
                }
              },
              post: {
                id: {
                  $eq: post.id
                }
              }
            }
          }) as unknown as StrapiBookmark[];
          
          isBookmarked = bookmark && bookmark.length > 0;
          
          return {
            id: post.id,
            title: post.attributes.title,
            content: post.attributes.content,
            type: post.attributes.type,
            URL: post.attributes.URL,
            vote: post.attributes.vote,
            createdAt: post.attributes.createdAt,
            updatedAt: post.attributes.updatedAt,
            commentCount,
            userVote: userVote,
            isBookmarked,
            user: post.attributes.user?.data ? {
              id: post.attributes.user.data.id,
              username: post.attributes.user.data.attributes.username,
              avatar: post.attributes.user.data.attributes.avatar
            } : null,
            community: post.attributes.community?.data ? {
              id: post.attributes.community.data.id,
              name: post.attributes.community.data.attributes.name,
              slug: post.attributes.community.data.attributes.slug,
              image: post.attributes.community.data.attributes.image
            } : null,
            image: post.attributes.image?.data ? {
              id: post.attributes.image.data.id,
              url: post.attributes.image.data.attributes.url
            } : null
          };
        })
      );
      
      return {
        data: postsWithDetails,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch posts', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Vote on a post
   */
  votePost: async (ctx) => {
    const { id } = ctx.params;
    const { value } = ctx.request.body;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to vote');
    }
    
    // Validate vote value
    if (![1, -1, 0].includes(value)) {
      return ctx.badRequest('Vote value must be 1, -1, or 0');
    }
    
    try {
      // Check if post exists
      const post = await strapi.db.query('api::post.post').findOne({
        where: { id },
        populate: { user: true, community: true }
      });
      
      if (!post) {
        return ctx.notFound('Post not found');
      }
      
      // Check if community is private and user is not a member
      if (post.community.privacy === 'private') {
        // Check if user is a member
        const isMember = await strapi.db.query('api::community-member.community-member').findOne({
          where: {
            $and: [
              { 'user.id': user.id },
              { 'community.id': post.community.id },
              { status: 'active' }
            ]
          }
        });
        
        if (!isMember) {
          return ctx.forbidden('You cannot vote on posts in private communities you are not a member of');
        }
      }
      
      // Check if user has already voted
      const existingVote = await strapi.db.query('api::vote.vote').findOne({
        where: {
          $and: [
            { 'user.id': user.id },
            { 'post.id': post.id }
          ]
        }
      });
      
      let oldValue = 0;
      
      if (existingVote) {
        oldValue = existingVote.value;
        
        if (value === 0) {
          // Remove vote
          await strapi.db.query('api::vote.vote').delete({
            where: { id: existingVote.id }
          });
        } else {
          // Update vote
          await strapi.db.query('api::vote.vote').update({
            where: { id: existingVote.id },
            data: { value }
          });
        }
      } else if (value !== 0) {
        // Create new vote
        await strapi.db.query('api::vote.vote').create({
          data: {
            value,
            date: new Date(),
            user: {
              connect: [{ id: user.id }]
            },
            post: {
              connect: [{ id: post.id }]
            }
          }
        });
      }
      
      // Update post vote count
      const newVoteCount = post.vote - oldValue + value;
      await strapi.db.query('api::post.post').update({
        where: { id },
        data: { vote: newVoteCount }
      });
      
      // Create notification if upvoting (and not self-voting)
      if (value === 1 && oldValue !== 1 && post.user.id !== user.id) {
        await strapi.db.query('api::notification.notification').create({
          data: {
            type: 'vote',
            content: `${user.username} upvoted your post: ${post.title}`,
            Read: false,
            date: new Date(),
            link: `/communities/${post.community.slug}/posts/${post.id}`,
            recipient: {
              connect: [{ id: post.user.id }]
            },
            sender: {
              connect: [{ id: user.id }]
            }
          }
        });
      }
      
      return {
        success: true,
        message: value === 0 ? 'Vote removed' : `Post ${value > 0 ? 'upvoted' : 'downvoted'}`,
        newVoteCount
      };
    } catch (err) {
      return ctx.badRequest('Failed to vote on post', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get posts for the user's feed (from communities they're in)
   */
  getFeed: async (ctx) => {
    const { 
      limit = '20', 
      page = '1', 
      sort = 'newest'
    } = ctx.request.query as PostQueryParams;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view your feed');
    }
    
    try {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Get communities user is a member of
      const memberships = await strapi.db.query('api::community-member.community-member').findMany({
        where: { 'user.id': user.id },
        populate: { community: true }
      });
      
      const communityIds = memberships.map(m => m.community.id);
      
      // If user is not in any communities, return empty result
      if (communityIds.length === 0) {
        return {
          data: [],
          meta: {
            page: pageNum,
            limit: limitNum,
            total: 0
          }
        };
      }
      
      // Determine sort order
      let orderBy: any = {};
      switch (sort) {
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'top':
          orderBy = { vote: 'desc' };
          break;
        case 'controversial':
          orderBy = { vote: 'asc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
      
      // Find posts from communities user is a member of
      const posts = await strapi.db.query('api::post.post').findMany({
        where: {
          'community.id': { $in: communityIds }
        },
        orderBy,
        populate: '*',
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });
      
      // Count total posts
      const count = await strapi.db.query('api::post.post').count({
        where: {
          'community.id': { $in: communityIds }
        }
      });
      
      // Get comment counts, user votes, and bookmarks for posts
       const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Get comment count
          const commentCount = await strapi.db.query('api::comment.comment').count({
             where: { 'post.id': post.id }
          });
           // Check if user has voted on this post
          let userVote = null;
          const vote = await strapi.db.query('api::vote.vote').findOne({
            where: {
              $and: [
                { 'user.id': user.id },
                { 'post.id': post.id }
              ]
            }
          });
          
          if (vote) {
            userVote = vote.value;
          }
          
          // Check if user has bookmarked this post
          let isBookmarked = false;
          const bookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
            where: {
              $and: [
                { 'user.id': user.id },
                { 'post.id': post.id }
              ]
            }
          });
          
          isBookmarked = !!bookmark;
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            URL: post.URL,
            vote: post.vote,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount,
            userVote,
            isBookmarked,
            user: {
              id: post.user.id,
              username: post.user.username,
              avatar: post.user.avatar
            },
            community: {
              id: post.community.id,
              name: post.community.name,
              slug: post.community.slug,
              image: post.community.image
            },
            image: post.image ? {
              id: post.image.id,
              url: post.image.url
            } : null
          };
        })
      );
      
      return {
        data: postsWithDetails,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch feed', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get trending posts
   */
  getTrending: async (ctx) => {
    const { 
      limit = '20', 
      page = '1', 
      community 
    } = ctx.request.query as PostQueryParams;
    const { user } = ctx.state;
    
    try {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Calculate trending window (last 7 days)
      const trendingDate = new Date();
      trendingDate.setDate(trendingDate.getDate() - 7);
      
      // Build filters
      const filters: any = {
        createdAt: { $gte: trendingDate }
      };
      
      // Add community filter
      if (community) {
        // Check if filter is by slug or ID
        if (isNaN(Number(community))) {
          // Filter by slug
          const communityEntity = await strapi.db.query('api::community.community').findOne({
            where: { slug: community }
          });
          
          if (communityEntity) {
            filters['community.id'] = communityEntity.id;
            
            // Check if community is private and user is not a member
            if (communityEntity.privacy === 'private') {
              // If user is not logged in
              if (!user) {
                return {
                  data: [],
                  meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: 0
                  }
                };
              }
              
              // Check if user is a member
              const isMember = await strapi.db.query('api::community-member.community-member').findOne({
                where: {
                  $and: [
                    { 'user.id': user.id },
                    { 'community.id': communityEntity.id },
                    { status: 'active' }
                  ]
                }
              });
              
              if (!isMember) {
                return {
                  data: [],
                  meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: 0
                  }
                };
              }
            }
          } else {
            // If community does not exist, return empty result
            return {
              data: [],
              meta: {
                page: pageNum,
                limit: limitNum,
                total: 0
              }
            };
          }
        } else {
          // Filter by ID
          filters['community.id'] = community;
          
          // Check if community is private
          const communityEntity = await strapi.db.query('api::community.community').findOne({
            where: { id: community }
          });
          
          if (communityEntity && communityEntity.privacy === 'private') {
            // If user is not logged in
            if (!user) {
              return {
                data: [],
                meta: {
                  page: pageNum,
                  limit: limitNum,
                  total: 0
                }
              };
            }
            
            // Check if user is a member
            const isMember = await strapi.db.query('api::community-member.community-member').findOne({
              where: {
                $and: [
                  { 'user.id': user.id },
                  { 'community.id': communityEntity.id },
                  { status: 'active' }
                ]
              }
            });
            
            if (!isMember) {
              return {
                data: [],
                meta: {
                  page: pageNum,
                  limit: limitNum,
                  total: 0
                }
              };
            }
          }
        }
      } else {
        // If no community filter, exclude private communities that user is not a member of
        if (user) {
          // Get communities user is a member of
          const memberships = await strapi.db.query('api::community-member.community-member').findMany({
            where: { 'user.id': user.id },
            populate: { community: true }
          });
          
          const memberCommunityIds = memberships.map(m => m.community.id);
          
          // Get public and restricted communities
          const publicCommunities = await strapi.db.query('api::community.community').findMany({
            where: { privacy: { $ne: 'private' } }
          });
          
          const publicCommunityIds = publicCommunities.map(c => c.id);
          
          // Combine IDs of communities user can see
          const allowedCommunityIds = [...new Set([...memberCommunityIds, ...publicCommunityIds])];
          
          filters['community.id'] = { $in: allowedCommunityIds };
        } else {
          // For non-logged in users, only show posts from public and restricted communities
          const publicCommunities = await strapi.db.query('api::community.community').findMany({
            where: { privacy: { $ne: 'private' } }
          });
          
          const publicCommunityIds = publicCommunities.map(c => c.id);
          filters['community.id'] = { $in: publicCommunityIds };
        }
      }
      
      // Find posts, sorting by votes
      const posts = await strapi.db.query('api::post.post').findMany({
        where: filters,
        orderBy: { vote: 'desc' },
        populate: '*',
        limit: limitNum * 2 // Get more posts to calculate trending score
      });
      
      // Count total posts matching filters
      const count = await strapi.db.query('api::post.post').count({
        where: filters
      });
      
      // Get comment counts for posts
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          // Get comment count
          const commentCount = await strapi.db.query('api::comment.comment').count({
            where: { 'post.id': post.id }
          });
          
          // Get number of bookmarks
          const bookmarkCount = await strapi.db.query('api::bookmark.bookmark').count({
            where: { 'post.id': post.id }
          });
          
          // Check if user has voted on this post
          let userVote = null;
          if (user) {
            const vote = await strapi.db.query('api::vote.vote').findOne({
              where: {
                $and: [
                  { 'user.id': user.id },
                  { 'post.id': post.id }
                ]
              }
            });
            
            if (vote) {
              userVote = vote.value;
            }
          }
          
          // Check if user has bookmarked this post
          let isBookmarked = false;
          if (user) {
            const bookmark = await strapi.db.query('api::bookmark.bookmark').findOne({
              where: {
                $and: [
                  { 'user.id': user.id },
                  { 'post.id': post.id }
                ]
              }
            });
            
            isBookmarked = !!bookmark;
          }
          
          // Calculate trending score
          // Formula: (Votes * 1.0) + (Comments * 2.0) + (Bookmarks * 1.5) + Recency Bonus
          const now = new Date();
          const hoursAgo = (now.getTime() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
          const recencyBonus = Math.max(0, 24 - hoursAgo) / 6; // 0-4 points for recency (max for posts <6 hours old)
          
          const trendingScore = (post.vote * 1.0) + (commentCount * 2.0) + (bookmarkCount * 1.5) + recencyBonus;
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            URL: post.URL,
            vote: post.vote,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount,
            bookmarkCount,
            userVote,
            isBookmarked,
            trendingScore,
            user: {
              id: post.user.id,
              username: post.user.username,
              avatar: post.user.avatar
            },
            community: {
              id: post.community.id,
              name: post.community.name,
              slug: post.community.slug,
              image: post.community.image
            },
            image: post.image ? {
              id: post.image.id,
              url: post.image.url
            } : null
          };
        })
      );
      
      // Sort by trending score and paginate
      const sortedPosts = postsWithDetails
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice((pageNum - 1) * limitNum, pageNum * limitNum);
      
      return {
        data: sortedPosts,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch trending posts', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  },
  
  /**
   * Get user's saved/bookmarked posts
   */
  getSavedPosts: async (ctx) => {
    const { limit = '20', page = '1' } = ctx.request.query as PostQueryParams;
    const { user } = ctx.state;
    
    if (!user) {
      return ctx.unauthorized('You must be logged in to view saved posts');
    }
    
    try {
      const limitNum = parseInt(limit);
      const pageNum = parseInt(page);
      
      // Find user's bookmarks
      const bookmarks = await strapi.db.query('api::bookmark.bookmark').findMany({
        where: { 'user.id': user.id },
        orderBy: { date: 'desc' },
        populate: { post: true },
        limit: limitNum,
        offset: (pageNum - 1) * limitNum
      });
      
      // Count total bookmarks
      const count = await strapi.db.query('api::bookmark.bookmark').count({
        where: { 'user.id': user.id }
      });
      
      // Get post details for each bookmark
      const posts = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const post = await strapi.db.query('api::post.post').findOne({
            where: { id: bookmark.post.id },
            populate: '*'
          });
          
          if (!post) return null;
          
          // Get comment count
          const commentCount = await strapi.db.query('api::comment.comment').count({
            where: { 'post.id': post.id }
          });
          
          // Check if user has voted on this post
          let userVote = null;
          const vote = await strapi.db.query('api::vote.vote').findOne({
            where: {
              $and: [
                { 'user.id': user.id },
                { 'post.id': post.id }
              ]
            }
          });
          
          if (vote) {
            userVote = vote.value;
          }
          
          return {
            id: post.id,
            title: post.title,
            content: post.content,
            type: post.type,
            URL: post.URL,
            vote: post.vote,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            commentCount,
            userVote,
            isBookmarked: true,
            bookmarkDate: bookmark.date,
            user: {
              id: post.user.id,
              username: post.user.username,
              avatar: post.user.avatar
            },
            community: {
              id: post.community.id,
              name: post.community.name,
              slug: post.community.slug,
              image: post.community.image
            },
            image: post.image ? {
              id: post.image.id,
              url: post.image.url
            } : null
          };
        })
      );
      
      // Filter out any null posts (in case a post was deleted)
      const validPosts = posts.filter(p => p !== null);
      
      return {
        data: validPosts,
        meta: {
          page: pageNum,
          limit: limitNum,
          total: count
        }
      };
    } catch (err) {
      return ctx.badRequest('Failed to fetch saved posts', {
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
};