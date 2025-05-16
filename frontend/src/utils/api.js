import axiosClient from './axiosClient';

// Posts API
export const postsApi = {
  // Récupérer tous les posts
  getAllPosts: async (params = {}) => {
    const defaultParams = {
      'populate[user]': true,
      'populate[community]': true,
      'populate[image]': true,
      'sort[0]': 'createdAt:desc',
    };
    const queryParams = { ...defaultParams, ...params };
    const response = await axiosClient.get('/api/posts', { params: queryParams });
    return response.data;
  },

  // Récupérer un post spécifique
  getPost: async (id) => {
    const response = await axiosClient.get(`/api/posts/${id}?populate=*`);
    return response.data;
  },

  // Créer un nouveau post
  createPost: async (postData) => {
    const response = await axiosClient.post('/api/posts', { data: postData });
    return response.data;
  },

  // Mettre à jour un post
  updatePost: async (id, postData) => {
    const response = await axiosClient.put(`/api/posts/${id}`, { data: postData });
    return response.data;
  },

  // Supprimer un post
  deletePost: async (id) => {
    const response = await axiosClient.delete(`/api/posts/${id}`);
    return response.data;
  },

  // Voter pour un post
  votePost: async (id, value) => {
    const response = await axiosClient.post(`/api/posts/${id}/vote`, { value });
    return response.data;
  }
};

// Communities API
export const communitiesApi = {
  // Récupérer toutes les communautés
  getAllCommunities: async (params = {}) => {
    const response = await axiosClient.get('/api/communities', { params });
    return response.data;
  },

  // Récupérer une communauté spécifique
  getCommunity: async (id) => {
    const response = await axiosClient.get(`/api/communities/${id}?populate=*`);
    return response.data;
  },

  // Créer une nouvelle communauté
 createCommunity: async (communityData) => {
    // Make sure we're sending the correct structure
    const payload = {
      data: {
        name: communityData.name,
        description: communityData.description
      }
    };
    
    const response = await axiosClient.post('/api/communities', payload);
    return response.data;
  },

  // Rejoindre une communauté
  joinCommunity: async (communityId) => {
    const response = await axiosClient.post(`/api/communities/${communityId}/join`);
    return response.data;
  }
};

// Comments API
export const commentsApi = {
  // Récupérer les commentaires d'un post
  getPostComments: async (postId, params = {}) => {
    const response = await axiosClient.get(`/api/comments?filters[post]=${postId}&populate=*`, { params });
    return response.data;
  },

  // Créer un commentaire
  createComment: async (commentData) => {
    const response = await axiosClient.post('/api/comments', { data: commentData });
    return response.data;
  },

  // Voter pour un commentaire
  voteComment: async (id, value) => {
    const response = await axiosClient.post(`/api/comments/${id}/vote`, { value });
    return response.data;
  }
};

// User API
export const userApi = {
  // Récupérer le profil de l'utilisateur connecté
  getCurrentUser: async () => {
    const response = await axiosClient.get('/api/users/me?populate=*');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (userData) => {
    const response = await axiosClient.put('/api/users/me', userData);
    return response.data;
  },

  // Récupérer les notifications
  getNotifications: async () => {
    const response = await axiosClient.get('/api/notifications?populate=*');
    return response.data;
  }
};

// Auth API
export const authApi = {
  // Connexion
  login: async (identifier, password) => {
    const response = await axiosClient.post('/api/auth/local', {
      identifier,
      password,
    });
    return response.data;
  },

  // Inscription
  register: async (userData) => {
    const response = await axiosClient.post('/api/auth/local/register', userData);
    return response.data;
  },

  // Réinitialisation du mot de passe
  forgotPassword: async (email) => {
    const response = await axiosClient.post('/api/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  // Réinitialisation du mot de passe avec le code
  resetPassword: async (code, password, passwordConfirmation) => {
    const response = await axiosClient.post('/api/auth/reset-password', {
      code,
      password,
      passwordConfirmation,
    });
    return response.data;
  }
}; 