'use client';

import axios from 'axios';

// Create a minimal axios client with no complex error handling
const createMinimalAxiosClient = () => {
  // Simple API URL that works in both environments
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';
  
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  } );

  // Simple request interceptor with minimal error handling
  instance.interceptors.request.use(
    (config) => {
      // Only run on client side
      if (typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('jwt');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          // Silent fail
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Minimal response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle auth errors with minimal code
      if (typeof window !== 'undefined' && 
          error?.response?.status && 
          (error.response.status === 401 || error.response.status === 403)) {
        try {
          localStorage.removeItem('jwt');
          window.location.href = '/login';
        } catch (e) {
          // Silent fail
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create the client
const axiosClient = createMinimalAxiosClient();

export default axiosClient;
