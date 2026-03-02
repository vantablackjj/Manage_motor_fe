// src/api/auth.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const authAPI = {
  // Login
  login: async (username, password) => {
    return axiosInstance.post(API_ENDPOINTS.LOGIN, {
      username,
      password,
    });
  },

  // Logout
  logout: async () => {
    return axiosInstance.post(API_ENDPOINTS.LOGOUT);
  },

  // Refresh token
  refreshToken: async () => {
    return axiosInstance.post(API_ENDPOINTS.REFRESH_TOKEN);
  },

  signin: async (credentials) => {
    return axiosInstance.post("/auth/signin", { credentials });
  },

  getMe: async () => {
    return axiosInstance.get(API_ENDPOINTS.ME);
  },

  updateMe: async (data) => {
    return axiosInstance.put(API_ENDPOINTS.ME, data);
  },

  changePassword: async (data) => {
    return axiosInstance.put(API_ENDPOINTS.CHANGE_PASSWORD, data);
  },
};
