import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const OwnerApiService = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/owner`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
// Request interceptor
OwnerApiService.interceptors.request.use(
  (config) => {
    // ✅ Sesuaikan dengan key yang digunakan saat login
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
// Response interceptor
OwnerApiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ Hapus token yang benar
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken'); // hapus juga yang lama jika ada
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const ownerAPI = {
  // Get revenue data
  getRevenue: async (params = {}) => {
    try {
      const response = await OwnerApiService.get('/revenue', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get revenue by movie
  getRevenueByMovie: async (params = {}) => {
    try {
      const response = await OwnerApiService.get('/revenue/movies', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get daily revenue
  getDailyRevenue: async (params = {}) => {
    try {
      const response = await OwnerApiService.get('/revenue/daily', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default OwnerApiService;