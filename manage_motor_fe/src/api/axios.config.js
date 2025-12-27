// src/api/axios.config.js
import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, MESSAGES } from '../utils/constant';
import { message } from 'antd';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token to header
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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
axiosInstance.interceptors.response.use(
  (response) => {
    // Return data directly
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_INFO);
          message.error(MESSAGES.ERROR.UNAUTHORIZED);
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          message.error(MESSAGES.ERROR.FORBIDDEN);
          break;
          
        case 404:
          // Not found
          message.error(data?.message || MESSAGES.ERROR.NOT_FOUND);
          break;
          
        case 422:
          // Validation error
          message.error(data?.message || MESSAGES.ERROR.VALIDATION);
          break;
          
        case 500:
          // Server error
          message.error(data?.message || MESSAGES.ERROR.COMMON);
          break;
          
        default:
          message.error(data?.message || MESSAGES.ERROR.COMMON);
      }
    } else if (error.request) {
      // Network error
      message.error(MESSAGES.ERROR.NETWORK);
    } else {
      message.error(MESSAGES.ERROR.COMMON);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;