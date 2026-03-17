import { apiClient } from './apiClient';

export const authApi = {
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { accessToken, refreshToken, user };
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  refresh: async (refreshToken) => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMe: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  logout: async (refreshToken) => {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },


  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};