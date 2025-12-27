// src/api/auth.api.js
import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constant';

export const authAPI = {
  // Login
  login: async (username,password) => {
    return axiosInstance.post(API_ENDPOINTS.LOGIN, {
      username,
      password
    });
  },
  
  // Logout
  logout: async () => {
    return axiosInstance.post(API_ENDPOINTS.LOGOUT);
  },
  
  // Refresh token
  refreshToken: async (refreshToken) => {
    return axiosInstance.post(API_ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  },

  signin :async(credentials)=>{
    return axiosInstance.post(API_ENDPOINTS.signin,{credentials})
  }

};

