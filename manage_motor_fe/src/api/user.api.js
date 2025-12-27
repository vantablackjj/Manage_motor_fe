// src/api/user.api.js
import axiosInstance from './axios.config';

const USER_ENDPOINTS = {
  BASE: '/user',
  DETAIL: (id) => `/user/${id}`,
  BY_KHO: (ma_kho) => `/user/kho/${ma_kho}`,
  PERMISSIONS: (id) => `/user/${id}/permissions`,
  CHANGE_PASSWORD: (id) => `/user/${id}/change-password`,
  RESET_PASSWORD: (id) => `/user/${id}/reset-password`
};

export const userAPI = {
  // Get all users
  getAll: async (params) => {
    return axiosInstance.get(USER_ENDPOINTS.BASE, { params });
  },
  
  // Get user by id
  getById: async (id) => {
    return axiosInstance.get(USER_ENDPOINTS.DETAIL(id));
  },
  
  // Create user
  create: async (data) => {
    return axiosInstance.post(USER_ENDPOINTS.BASE, data);
  },
  
  // Update user
  update: async (id, data) => {
    return axiosInstance.put(USER_ENDPOINTS.DETAIL(id), data);
  },
  
  // Delete user
  delete: async (id) => {
    return axiosInstance.delete(USER_ENDPOINTS.DETAIL(id));
  },
  
  // Get users by kho
  getByKho: async (ma_kho, params) => {
    return axiosInstance.get(USER_ENDPOINTS.BY_KHO(ma_kho), { params });
  },
  
  // Get user permissions
  getPermissions: async (id) => {
    return axiosInstance.get(USER_ENDPOINTS.PERMISSIONS(id));
  },
  
  // Update user permissions
  updatePermissions: async (id, permissions) => {
    return axiosInstance.put(USER_ENDPOINTS.PERMISSIONS(id), { permissions });
  },
  
  // Change password (by user)
  changePassword: async (id, data) => {
    return axiosInstance.post(USER_ENDPOINTS.CHANGE_PASSWORD(id), data);
  },
  
  // Reset password (by admin)
  resetPassword: async (id, newPassword) => {
    return axiosInstance.post(USER_ENDPOINTS.RESET_PASSWORD(id), { newPassword });
  },
  
  // Get current user profile
  getProfile: async () => {
    return axiosInstance.get('/user/profile');
  },
  
  // Update current user profile
  updateProfile: async (data) => {
    return axiosInstance.put('/user/profile', data);
  },
  
  // Toggle user status (active/inactive)
  toggleStatus: async (id) => {
    return axiosInstance.post(`${USER_ENDPOINTS.DETAIL(id)}/toggle-status`);
  }
};