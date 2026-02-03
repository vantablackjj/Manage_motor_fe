import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const productsAPI = {
  // Get all products
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.PRODUCTS, { params });
  },

  // Get product by id
  getById: async (id) => {
    return axiosInstance.get(API_ENDPOINTS.PRODUCT_DETAIL(id));
  },

  // Create product
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.PRODUCTS, data);
  },

  // Update product
  update: async (id, data) => {
    return axiosInstance.put(API_ENDPOINTS.PRODUCT_DETAIL(id), data);
  },

  // Delete product
  delete: async (id) => {
    return axiosInstance.delete(API_ENDPOINTS.PRODUCT_DETAIL(id));
  },

  // Get dynamic filters
  getFilters: async (field) => {
    return axiosInstance.get(API_ENDPOINTS.PRODUCTS_FILTERS(field));
  },

  // Get stock overview
  getStock: async (id) => {
    return axiosInstance.get(API_ENDPOINTS.PRODUCT_STOCK(id));
  },
};
