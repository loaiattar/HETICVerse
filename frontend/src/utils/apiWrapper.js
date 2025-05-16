import { postsApi, communitiesApi, commentsApi, userApi, authApi } from './api';

// Wrapper function to add consistent error handling
const withErrorHandling = (apiCall) => async (...args) => {
  try {
    return await apiCall(...args);
  } catch (error) {
    console.error(`API Error in ${apiCall.name}:`, error);
    
    // You can implement custom error handling logic here
    // For example, showing a notification to the user
    
    // Re-throw the error for the component to handle if needed
    throw error;
  }
};

// Wrap all API methods with error handling
export const enhancedPostsApi = Object.keys(postsApi).reduce((acc, key) => {
  acc[key] = withErrorHandling(postsApi[key]);
  return acc;
}, {});

export const enhancedCommunitiesApi = Object.keys(communitiesApi).reduce((acc, key) => {
  acc[key] = withErrorHandling(communitiesApi[key]);
  return acc;
}, {});

export const enhancedCommentsApi = Object.keys(commentsApi).reduce((acc, key) => {
  acc[key] = withErrorHandling(commentsApi[key]);
  return acc;
}, {});

export const enhancedUserApi = Object.keys(userApi).reduce((acc, key) => {
  acc[key] = withErrorHandling(userApi[key]);
  return acc;
}, {});

export const enhancedAuthApi = Object.keys(authApi).reduce((acc, key) => {
  acc[key] = withErrorHandling(authApi[key]);
  return acc;
}, {});
