// src/api/axios.config.js
import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS, MESSAGES } from "../utils/constant";
import { message } from "antd";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 300000, // 5 min
  withCredentials: true, // Required for cookies (refreshToken)
  headers: {
    "Content-Type": "application/json",
  },
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
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Token Expired or Invalid
      // Check if it's not a retry to avoid infinite loops
      if (status === 401 && !originalRequest._retry) {
        // If it's a login request, just reject (could be wrong password)
        if (originalRequest.url.includes("/auth/login")) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;
        try {
          // Try to refresh the token
          // Post to refresh doesn't need data because refreshToken is in HTTP-only cookie
          const response = await axiosInstance.post("/auth/refresh");

          if (response.accessToken) {
            localStorage.setItem(
              STORAGE_KEYS.ACCESS_TOKEN,
              response.accessToken,
            );

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear auth and redirect to login
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_INFO);
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

      switch (status) {
        case 401:
          // If execution reaches here, it means retry failed or it was a login error
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER_INFO);
          message.error(data?.message || MESSAGES.ERROR.UNAUTHORIZED);
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
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
  },
);

export default axiosInstance;
