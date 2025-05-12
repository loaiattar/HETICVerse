'use strict';

const NodeCache = require('node-cache');

// Create cache instances with different TTL
const shortCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const mediumCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes
const longCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

class CacheService {
  // Get from cache
  async get(key, cacheType = 'medium') {
    const cache = this.getCacheInstance(cacheType);
    return cache.get(key);
  }
  
  // Set in cache
  async set(key, value, cacheType = 'medium', ttl = null) {
    const cache = this.getCacheInstance(cacheType);
    if (ttl) {
      return cache.set(key, value, ttl);
    }
    return cache.set(key, value);
  }
  
  // Delete from cache
  async del(key, cacheType = 'medium') {
    const cache = this.getCacheInstance(cacheType);
    return cache.del(key);
  }
  
  // Clear cache by pattern
  async delPattern(pattern, cacheType = 'medium') {
    const cache = this.getCacheInstance(cacheType);
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    return cache.del(matchingKeys);
  }
  
  // Get or set pattern
  async getOrSet(key, fetchFunction, cacheType = 'medium', ttl = null) {
    let value = await this.get(key, cacheType);
    
    if (value === undefined) {
      value = await fetchFunction();
      await this.set(key, value, cacheType, ttl);
    }
    
    return value;
  }
  
  // Get cache instance by type
  getCacheInstance(type) {
    switch (type) {
      case 'short':
        return shortCache;
      case 'long':
        return longCache;
      case 'medium':
      default:
        return mediumCache;
    }
  }
  
  // Cache user data
  async cacheUser(userId, userData, ttl = 1800) {
    const key = `user_${userId}`;
    await this.set(key, userData, 'medium', ttl);
  }
  
  // Get cached user
  async getCachedUser(userId) {
    const key = `user_${userId}`;
    return await this.get(key, 'medium');
  }
  
  // Cache conversation
  async cacheConversation(conversationId, conversationData, ttl = 300) {
    const key = `conversation_${conversationId}`;
    await this.set(key, conversationData, 'short', ttl);
  }
  
  // Get cached conversation
  async getCachedConversation(conversationId) {
    const key = `conversation_${conversationId}`;
    return await this.get(key, 'short');
  }
  
  // Cache post with related data
  async cachePost(postId, postData, ttl = 600) {
    const key = `post_${postId}`;
    await this.set(key, postData, 'medium', ttl);
  }
  
  // Get cached post
  async getCachedPost(postId) {
    const key = `post_${postId}`;
    return await this.get(key, 'medium');
  }
  
  // Invalidate related caches when content updates
  async invalidateRelatedCaches(type, id) {
    switch (type) {
      case 'post':
        await this.del(`post_${id}`);
        await this.delPattern(`post_${id}_`);
        break;
      case 'user':
        await this.del(`user_${id}`);
        await this.delPattern(`user_${id}_`);
        break;
      case 'conversation':
        await this.del(`conversation_${id}`);
        await this.delPattern(`conversation_${id}_`);
        break;
    }
  }
  
  // Get cache statistics
  getStats() {
    return {
      short: shortCache.getStats(),
      medium: mediumCache.getStats(),
      long: longCache.getStats()
    };
  }
}

module.exports = new CacheService();