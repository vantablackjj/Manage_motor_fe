// src/api/user.api.js
import axiosInstance from "./axios.config";

const USER_ENDPOINTS = {
  BASE: "/users",
  DETAIL: (id) => `/users/${id}`,
  BY_KHO: (ma_kho) => `/users/kho/${ma_kho}`,
  PERMISSIONS: (id) => `/users/${id}/permissions`,
  CHANGE_PASSWORD: (id) => `/users/${id}/change-password`,
  ACTIVATE: (id) => `/users/${id}/activate`,
  DEACTIVATE: (id) => `/users/${id}/deactivate`,
  RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
};

export const userAPI = {
  // Get all users
  getAll: async (params) => {
    const res = await axiosInstance.get(USER_ENDPOINTS.BASE, { params });
    return res.data;
  },

  // Get user by id
  getById: async (id) => {
    const res = await axiosInstance.get(USER_ENDPOINTS.DETAIL(id));
    return res.data;
  },

  // Create user
  create: async (data) => {
    const res = await axiosInstance.post(USER_ENDPOINTS.BASE, data);
    return res.data;
  },

  // Update user
  update: async (id, data) => {
    const res = await axiosInstance.put(USER_ENDPOINTS.DETAIL(id), data);
    return res.data;
  },

  // Delete user
  delete: async (id) => {
    return axiosInstance.delete(USER_ENDPOINTS.DETAIL(id));
  },

  // Get users by kho
  getByKho: async (ma_kho, params) => {
    const res = await axiosInstance.get(USER_ENDPOINTS.BY_KHO(ma_kho), {
      params,
    });
    return res.data;
  },

  // Get user permissions
  getPermissions: async (id) => {
    const res = await axiosInstance.get(USER_ENDPOINTS.PERMISSIONS(id));
    return res.data;
  },

  // Update user permissions
  updatePermissions: async (id, permissions) => {
    return axiosInstance.put(USER_ENDPOINTS.PERMISSIONS(id), { permissions });
  },

  // Change password
  changePassword: async (id, data) => {
    return axiosInstance.patch(USER_ENDPOINTS.CHANGE_PASSWORD(id), data);
  },

  // Activate user
  activate: async (id) => {
    return axiosInstance.patch(USER_ENDPOINTS.ACTIVATE(id));
  },

  // Deactivate user
  deactivate: async (id) => {
    return axiosInstance.patch(USER_ENDPOINTS.DEACTIVATE(id));
  },

  // Reset password (by admin)
  resetPassword: async (id, newPassword) => {
    return axiosInstance.post(USER_ENDPOINTS.RESET_PASSWORD(id), {
      newPassword,
    });
  },

  // Get current user profile
  getProfile: async () => {
    return axiosInstance.get("/user/profile");
  },

  // Update current user profile
  updateProfile: async (data) => {
    return axiosInstance.put("/user/profile", data);
  },

  // Toggle user status (active/inactive) - for internal use or simple toggle
  toggleStatus: async (id, currentStatus) => {
    if (currentStatus) {
      return axiosInstance.patch(USER_ENDPOINTS.DEACTIVATE(id));
    }
    return axiosInstance.patch(USER_ENDPOINTS.ACTIVATE(id));
  },
};
