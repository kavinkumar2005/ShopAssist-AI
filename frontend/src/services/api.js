import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const searchProducts = async (payload) => {
  const response = await api.post('/search', payload);
  return response.data;
};

export const sendChatMessage = async (payload) => {
  const response = await api.post('/chat', payload);
  return response.data;
};

export const getRecommendations = async (params = {}) => {
  const response = await api.get('/recommend', { params });
  return response.data;
};

export const getSimilarProducts = async (productId) => {
  const response = await api.get(`/similar/${productId}`);
  return response.data;
};

export const getPersonalizedFeed = async (userId = 'default_user') => {
  const response = await api.get('/personalized', { params: { user_id: userId } });
  return response.data;
};

export const compareProducts = async (productIds) => {
  const response = await api.post('/compare', { product_ids: productIds });
  return response.data;
};

export const getUserPreferences = async (userId = 'default_user') => {
  const response = await api.get('/preferences', { params: { user_id: userId } });
  return response.data;
};

export const saveUserPreferences = async (payload) => {
  const response = await api.post('/preferences', payload);
  return response.data;
};

export const getAnalyticsData = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, updates) => {
  const response = await api.put(`/products/${id}`, updates);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export default api;
