import { apiCall } from './api.js';

export const authService = {
  login: async (email, password) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  register: async (registerData) => {
    const data = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData)
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  getProfile: async () => {
    return await apiCall('/auth/me');
  },

  updateProfile: async (formData) => {
    // formData must be an instance of FormData to support image uploads
    const data = await apiCall('/auth/profile', {
      method: 'PUT',
      body: formData
    });
    // Update local user cache
    if (data.token) {
      localStorage.setItem('user', JSON.stringify(data));
    }
    return data;
  }
};

export default authService;
