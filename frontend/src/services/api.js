import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401s and attempt refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/accounts/token/refresh/`, {
            refresh: refreshToken,
          });
          if (res.status === 200) {
            localStorage.setItem('access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

// Helper to format image URLs
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${BACKEND_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

// API Services
export const authService = {
  register: (data) => api.post('/accounts/register/', data),
  login: (credentials) => api.post('/accounts/login/', credentials),
  getProfile: () => api.get('/accounts/profile/'),
  updateProfile: (data) => api.put('/accounts/profile/', data),
  getDashboardStats: () => api.get('/accounts/dashboard/stats/'),
};

export const productService = {
  getProducts: (params = {}) => api.get('/products/', { params }),
  getProduct: (id) => api.get(`/products/${id}/`),
  createProduct: (formData) => api.post('/products/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateProduct: (id, formData) => api.put(`/products/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteProduct: (id) => api.delete(`/products/${id}/`),
  updateStatus: (id, status) => api.patch(`/products/${id}/status/`, { status }),
  getMyListings: (params = {}) => api.get('/products/my-listings/', { params }),
};

export const favoriteService = {
  getFavorites: () => api.get('/favorites/'),
  addFavorite: (productId) => api.post('/favorites/', { product_id: productId }),
  removeFavorite: (id) => api.delete(`/favorites/${id}/`),
};

export const messagingService = {
  getEnquiries: (type = 'all') => api.get('/messages/', { params: { type } }),
  getEnquiryDetail: (id) => api.get(`/messages/${id}/`),
  sendEnquiry: (data) => api.post('/messages/', data),
  sendReply: (data) => api.post('/messages/', data),
};

export const pricingService = {
  getPriceSuggestion: (data) => api.post('/price-suggestion/', data),
};

export default api;
