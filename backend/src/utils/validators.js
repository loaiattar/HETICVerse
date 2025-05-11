'use strict';

const joi = require('joi');

// Post validation
const validatePost = (data) => {
  const schema = joi.object({
    content: joi.string().required().min(1).max(5000),
    title: joi.string().optional().max(200),
    sub_hetic_verse: joi.number().integer().positive().optional(),
    isAnonymous: joi.boolean().optional(),
    anonymousName: joi.string().optional().max(100),
    images: joi.array().optional()
  });
  
  return schema.validate(data);
};

// Comment validation
const validateComment = (data) => {
  const schema = joi.object({
    content: joi.string().required().min(1).max(2000),
    post: joi.number().integer().positive().required(),
    images: joi.array().optional()
  });
  
  return schema.validate(data);
};

// Message validation
const validateMessage = (data) => {
  const schema = joi.object({
    content: joi.string().required().min(1).max(2000),
    conversationId: joi.number().integer().positive().required(),
    attachments: joi.array().optional()
  });
  
  return schema.validate(data);
};

// User registration validation
const validateUserRegistration = (data) => {
  const schema = joi.object({
    username: joi.string().required().min(3).max(30).pattern(/^[a-zA-Z0-9_]+$/),
    email: joi.string().required().email(),
    password: joi.string().required().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    confirmPassword: joi.ref('password')
  });
  
  return schema.validate(data);
};

// File upload validation
const validateFileUpload = (file) => {
  const allowedMimes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/webm'],
    audio: ['audio/mp3', 'audio/wav', 'audio/ogg']
  };
  
  const maxSizes = {
    image: 5 * 1024 * 1024, // 5MB
    video: 50 * 1024 * 1024, // 50MB
    audio: 10 * 1024 * 1024 // 10MB
  };
  
  // Determine file type
  let fileType = 'other';
  for (const [type, mimes] of Object.entries(allowedMimes)) {
    if (mimes.includes(file.type)) {
      fileType = type;
      break;
    }
  }
  
  // Check if file type is allowed
  if (fileType === 'other') {
    return { error: 'File type not allowed' };
  }
  
  // Check file size
  if (file.size > maxSizes[fileType]) {
    return { error: `File too large. Maximum size for ${fileType} is ${maxSizes[fileType] / 1024 / 1024}MB` };
  }
  
  return { success: true, fileType };
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>]/g, '') // Remove < and > characters
      .trim()
      .slice(0, 5000); // Limit length
  }
  return input;
};

// Sanitize object recursively
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeInput(obj);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
};

module.exports = {
  validatePost,
  validateComment,
  validateMessage,
  validateUserRegistration,
  validateFileUpload,
  sanitizeInput,
  sanitizeObject
};