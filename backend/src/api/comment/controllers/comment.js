/**
 * comment controller
 */

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::comment.comment', ({ strapi }) => {
  return {
    async find(ctx) {
      const { data, meta } = await super.find(ctx);
      const sortedData = data.sort((a, b) =>
        new Date(b.attributes.createdAt) - new Date(a.attributes.createdAt)
      );
      return { data: sortedData, meta };
    },

    async create(ctx) {
      const user = ctx.state.user;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to create a comment');
      }

      // Set the author
      ctx.request.body.data.author = user.id;

      // Extract images if they exist
      const { files } = ctx.request.files || {};
      
      // Create the comment
      const result = await super.create(ctx);
      
      // If there are image files, upload and attach them
      if (files && files.images) {
        let imagesToAttach = [];
        
        // Ensure we have an array of files
        const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
        
        // Upload each image
        for (const imageFile of imageFiles) {
          // Validate image type
          if (!imageFile.type.startsWith('image/')) {
            continue; // Skip non-image files
          }
          
          // Upload the image
          const uploadedImage = await strapi
            .plugin('upload')
            .service('upload')
            .upload({
              data: {},
              files: imageFile,
            });
          
          imagesToAttach.push(uploadedImage[0].id);
        }
        
        // Update the comment with the attached images
        if (imagesToAttach.length > 0) {
          const updatedComment = await strapi.entityService.update(
            'api::comment.comment',
            result.data.id,
            {
              data: {
                images: imagesToAttach,
              },
              populate: ['images', 'author', 'post']
            }
          );
          
          return { data: updatedComment };
        }
      }
      
      return result;
    },

    async update(ctx) {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to update a comment');
      }

      // Get the comment to verify ownership
      const comment = await strapi.entityService.findOne('api::comment.comment', id, {
        populate: ['author']
      });

      if (!comment) {
        return ctx.notFound('Comment not found');
      }

      // Check if user owns the comment
      if (comment.author.id !== user.id) {
        return ctx.forbidden('You can only update your own comments');
      }

      // Handle image uploads if present
      const { files } = ctx.request.files || {};
      
      if (files && files.images) {
        let existingImages = comment.images || [];
        let imagesToAttach = [...existingImages.map(img => img.id)];
        
        // Ensure we have an array of files
        const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
        
        // Upload each new image
        for (const imageFile of imageFiles) {
          // Validate image type
          if (!imageFile.type.startsWith('image/')) {
            continue; // Skip non-image files
          }
          
          // Upload the image
          const uploadedImage = await strapi
            .plugin('upload')
            .service('upload')
            .upload({
              data: {},
              files: imageFile,
            });
          
          imagesToAttach.push(uploadedImage[0].id);
        }
        
        // Update the comment with the new images
        ctx.request.body.data.images = imagesToAttach;
      }
      
      return await super.update(ctx);
    },

    async removeImage(ctx) {
      const user = ctx.state.user;
      const { id, imageId } = ctx.params;
      
      if (!user) {
        return ctx.unauthorized('You must be logged in to remove images');
      }

      // Get the comment to verify ownership
      const comment = await strapi.entityService.findOne('api::comment.comment', id, {
        populate: ['author', 'images']
      });

      if (!comment) {
        return ctx.notFound('Comment not found');
      }

      // Check if user owns the comment
      if (comment.author.id !== user.id) {
        return ctx.forbidden('You can only modify your own comments');
      }

      // Check if the image exists in the comment
      const imageExists = comment.images.some(img => img.id.toString() === imageId);
      if (!imageExists) {
        return ctx.notFound('Image not found in this comment');
      }

      // Remove the image from the comment
      const updatedImages = comment.images.filter(img => img.id.toString() !== imageId);
      
      // Update the comment
      const updatedComment = await strapi.entityService.update(
        'api::comment.comment',
        id,
        {
          data: {
            images: updatedImages.map(img => img.id),
          },
          populate: ['images', 'author', 'post']
        }
      );

      return { data: updatedComment };
    },
  };
});
