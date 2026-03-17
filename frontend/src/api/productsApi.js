import { apiClient } from './apiClient';

export const productsApi = {
  getAll: async () => {
    try {
      const response = await apiClient.get('/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


  create: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


  update: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },


  delete: async (id) => {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};