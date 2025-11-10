import axios from 'axios';
// import { toast } from 'react-toastify';

export const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const AdminApiConfig = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add token to every request
AdminApiConfig.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
AdminApiConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ==================== ADMIN API SERVICES ====================

// Movies API
export const moviesAPI = {
  getAll: () => AdminApiConfig.get('/admin/movies'),
  getById: (id) => AdminApiConfig.get(`/admin/movies/${id}`),
  create: (data) => AdminApiConfig.post('/admin/movies', data),
  update: (id, data) => AdminApiConfig.put(`/admin/movies/${id}`, data),
  delete: (id) => AdminApiConfig.delete(`/admin/movies/${id}`),
};

// Schedules API - UPDATED with weekend pricing
export const schedulesAPI = {
  getAll: () => AdminApiConfig.get('/admin/schedules'),
  getById: (id) => AdminApiConfig.get(`/admin/schedules/${id}`),
  create: (data) => AdminApiConfig.post('/admin/schedules', data),
  update: (id, data) => AdminApiConfig.put(`/admin/schedules/${id}`, data),
  delete: (id) => AdminApiConfig.delete(`/admin/schedules/${id}`),
  getByMovie: (movieId) => AdminApiConfig.get(`/admin/schedules?movie_id=${movieId}`),
  getByStudio: (studioId) => AdminApiConfig.get(`/admin/schedules?studio_id=${studioId}`),
};

// Studios API - NEW
export const studiosAPI = {
  getAll: () => AdminApiConfig.get('/admin/studios'),
  getById: (id) => AdminApiConfig.get(`/admin/studios/${id}`),
  create: (data) => AdminApiConfig.post('/admin/studios', data),
  update: (id, data) => AdminApiConfig.put(`/admin/studios/${id}`, data),
  delete: (id) => AdminApiConfig.delete(`/admin/studios/${id}`),
};

// Seats API - UPDATED
export const seatsAPI = {
  getAll: (studioId = null) => AdminApiConfig.get(`/admin/seats${studioId ? `?studio_id=${studioId}` : ''}`),
  getById: (id) => AdminApiConfig.get(`/admin/seats/${id}`),
  create: (data) => AdminApiConfig.post('/admin/seats', data),
  bulkCreate: (data) => AdminApiConfig.post('/admin/seats/bulk', data),
  update: (id, data) => AdminApiConfig.put(`/admin/seats/${id}`, data),
  delete: (id) => AdminApiConfig.delete(`/admin/seats/${id}`),
};

// Users API - NEW (replaces customers & cashiers)
export const usersAPI = {
  getAll: () => AdminApiConfig.get('/admin/users'),
  getById: (id) => AdminApiConfig.get(`/admin/users/${id}`),
  create: (data) => AdminApiConfig.post('/admin/users', data),
  update: (id, data) => AdminApiConfig.put(`/admin/users/${id}`, data),
  delete: (id) => AdminApiConfig.delete(`/admin/users/${id}`),
  getByRole: (role) => AdminApiConfig.get(`/admin/users?role=${role}`),
};

// Legacy APIs - kept for backward compatibility
export const customersAPI = {
  getAll: () => AdminApiConfig.get('/admin/users?role=customer'),
  getById: (id) => usersAPI.getById(id),
  create: (data) => usersAPI.create({ ...data, role: 'customer' }),
  update: (id, data) => usersAPI.update(id, data),
  delete: (id) => usersAPI.delete(id),
};

export const cashiersAPI = {
  getAll: () => AdminApiConfig.get('/admin/users?role=cashier'),
  getById: (id) => usersAPI.getById(id),
  create: (data) => usersAPI.create({ ...data, role: 'cashier' }),
  update: (id, data) => usersAPI.update(id, data),
  delete: (id) => usersAPI.delete(id),
};

// Prices API - DEPRECATED (pricing now in schedules)
export const pricesAPI = {
  getAll: () => {
    console.warn('pricesAPI is deprecated. Use schedulesAPI instead.');
    return AdminApiConfig.get('/admin/prices');
  },
  getById: (id) => {
    console.warn('pricesAPI is deprecated. Use schedulesAPI instead.');
    return AdminApiConfig.get(`/admin/prices/${id}`);
  },
  create: (data) => {
    console.warn('pricesAPI is deprecated. Use schedulesAPI instead.');
    return AdminApiConfig.post('/admin/prices', data);
  },
  update: (id, data) => {
    console.warn('pricesAPI is deprecated. Use schedulesAPI instead.');
    return AdminApiConfig.put(`/admin/prices/${id}`, data);
  },
  delete: (id) => {
    console.warn('pricesAPI is deprecated. Use schedulesAPI instead.');
    return AdminApiConfig.delete(`/admin/prices/${id}`);
  },
};

// ==================== PUBLIC API SERVICES ====================

// Public Movies API
export const publicMoviesAPI = {
  getAll: () => AdminApiConfig.get('/movies'),
  playingNow: () => AdminApiConfig.get('/movies/playing-now'),
  comingSoon: () => AdminApiConfig.get('/movies/coming-soon'),
  getById: (id) => AdminApiConfig.get(`/movies/${id}`),
  getSchedules: (movieId) => AdminApiConfig.get(`/movies/${movieId}/schedules`),
};

// Auth API
export const authAPI = {
  register: (data) => AdminApiConfig.post('/register', data),
  login: (data) => AdminApiConfig.post('/login', data),
  logout: () => AdminApiConfig.post('/logout'),
  logoutAll: () => AdminApiConfig.post('/logout-all'),
  me: () => AdminApiConfig.get('/me'),
  updateProfile: (data) => AdminApiConfig.put('/profile', data),
  updatePhoto: (formData) => AdminApiConfig.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => AdminApiConfig.post('/change-password', data),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => AdminApiConfig.post('/bookings', data),
  myBookings: () => AdminApiConfig.get('/bookings'),
  history: () => AdminApiConfig.get('/bookings/history'),
  getById: (id) => AdminApiConfig.get(`/bookings/${id}`),
  cancel: (id) => AdminApiConfig.post(`/bookings/${id}/cancel`),
};

// Schedules API (Public)
export const publicSchedulesAPI = {
  getById: (id) => AdminApiConfig.get(`/schedules/${id}`),
  getAvailableSeats: (scheduleId) => AdminApiConfig.get(`/schedules/${scheduleId}/seats`),
};

// Invoices API
export const invoicesAPI = {
  myInvoices: () => AdminApiConfig.get('/invoices'),
  getById: (id) => AdminApiConfig.get(`/invoices/${id}`),
  getByBooking: (bookingId) => AdminApiConfig.get(`/bookings/${bookingId}/invoice`),
};

// ==================== UTILITY FUNCTIONS ====================

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Helper function to check if date is weekend
export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Helper function to get current price based on date
export const getCurrentPrice = (schedule) => {
  if (!schedule) return 0;
  const dateIsWeekend = isWeekend(schedule.date);
  return dateIsWeekend ? schedule.price_weekend : schedule.price_weekday;
};

export default AdminApiConfig;