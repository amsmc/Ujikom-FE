import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance for cashier API
const CashierApiService = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/cashier`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add token if needed
CashierApiService.interceptors.request.use(
  (config) => {
    // Cek token dengan urutan: token (cashier/owner) -> adminToken
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('adminToken') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('cashierToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Cashier API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
CashierApiService.interceptors.response.use(
  (response) => {
    console.log('Cashier API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Cashier API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('cashierToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Cashier API methods
export const cashierAPI = {
  // ===== OFFLINE BOOKING =====
  // Create offline booking - POST /bookings
  createOfflineBooking: async (bookingData) => {
    try {
      const response = await CashierApiService.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ===== TICKET MANAGEMENT =====
  // Verify ticket - GET /tickets/{ticketNumber}/verify
  verifyTicket: async (ticketNumber) => {
    try {
      const response = await CashierApiService.get(`/tickets/${ticketNumber}/verify`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Scan ticket - POST /tickets/{ticketNumber}/scan
  scanTicket: async (ticketNumber) => {
    try {
      const response = await CashierApiService.post(`/tickets/${ticketNumber}/scan`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get tickets by schedule - GET /schedules/{scheduleId}/tickets
  getTicketsBySchedule: async (scheduleId) => {
    try {
      const response = await CashierApiService.get(`/schedules/${scheduleId}/tickets`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default CashierApiService;