'use strict';

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageProcessor {
  constructor() {
    this.formats = {
      jpeg: { quality: 85 },
      png: { compression: 8 },
      webp: { quality: 85 }
    };
    
    this.sizes = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
      xlarge: { width: 1920, height: 1080 }
    };
  }
  
  // Process uploaded image
  async processUpload(file, options = {}) {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 85,
      format = 'jpeg',
      generateThumbnail = true
    } = options;
    
    try {
      // Read the file
      const buffer = await fs.readFile(file.path || file.tempFilePath);
      
      // Process main image
      const processedImage = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          inside: true,
          withoutEnlargement: true
        })
        .toFormat(format, this.formats[format])
        .toBuffer();
      
      const result = {
        main: {
          buffer: processedImage,
          format,
          width: null,
          height: null
        }
      };
      
      // Get dimensions
      const metadata = await sharp(processedImage).metadata();
      result.main.width = metadata.width;
      result.main.height = metadata.height;
      
      // Generate thumbnail if requested
      if (generateThumbnail) {
        const thumbnail = await sharp(buffer)
          .resize(this.sizes.thumbnail.width, this.sizes.thumbnail.height, {
            fit: 'cover',
            position: 'center'
          })
          .toFormat('jpeg', { quality: 80 })
          .toBuffer();
        
        result.thumbnail = {
          buffer: thumbnail,
          format: 'jpeg',
          width: this.sizes.thumbnail.width,
          height: this.sizes.thumbnail.height
        };
      }
      
      return result;
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }
  
  // Generate multiple sizes
  async generateSizes(buffer, sizes = ['thumbnail', 'small', 'medium']) {
    const results = {};
    
    for (const sizeName of sizes) {
      if (!this.sizes[sizeName]) continue;
      
      const { width, height } = this.sizes[sizeName];
      
      results[sizeName] = await sharp(buffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat('jpeg', { quality: 85 })
        .toBuffer();
    }
    
    return results;
  }
  
  // Create WebP version
  async createWebP(buffer, quality = 85) {
    return sharp(buffer)
      .toFormat('webp', { quality })
      .toBuffer();
  }
  
  // Add watermark
  async addWatermark(buffer, watermarkPath, options = {}) {
    const {
      position = 'southeast',
      opacity = 0.5,
      margin = 10
    } = options;
    
    const watermark = await sharp(watermarkPath)
      .resize(200) // Resize watermark
      .composite([
        {
          input: Buffer.from(
            `<svg width="200" height="50">
              <rect width="200" height="50" fill="white" opacity="${opacity}"/>
            </svg>`
          ),
          blend: 'multiply'
        }
      ])
      .toBuffer();
    
    return sharp(buffer)
      .composite([{
        input: watermark,
        gravity: position
      }])
      .toBuffer();
  }
  
  // Validate image file
  async validateImage(file) {
    try {
      const buffer = await fs.readFile(file.path || file.tempFilePath);
      const metadata = await sharp(buffer).metadata();
      
      // Check if it's a valid image
      if (!metadata.format) {
        throw new Error('Invalid image format');
      }
      
      // Check file size (default 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        throw new Error('Image file too large');
      }
      
      // Check dimensions
      if (metadata.width > 5000 || metadata.height > 5000) {
        throw new Error('Image dimensions too large');
      }
      
      return {
        valid: true,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
  
  // Create image sprite
  async createSprite(images, options = {}) {
    const {
      width = 100,
      height = 100,
      columns = 5
    } = options;
    
    const sprites = [];
    let currentRow = 0;
    let currentCol = 0;
    
    for (const image of images) {
      sprites.push({
        input: await sharp(image)
          .resize(width, height, { fit: 'cover' })
          .toBuffer(),
        left: currentCol * width,
        top: currentRow * height
      });
      
      currentCol++;
      if (currentCol >= columns) {
        currentCol = 0;
        currentRow++;
      }
    }
    
    const rows = Math.ceil(images.length / columns);
    
    return sharp({
      create: {
        width: columns * width,
        height: rows * height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      }
    })
    .composite(sprites)
    .toBuffer();
  }
}

module.exports = new ImageProcessor();