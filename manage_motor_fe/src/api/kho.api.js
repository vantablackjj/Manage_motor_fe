
import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constant';

export const khoAPI = {
  // Get all kho
  getAll: async (params) => {
  const res = await axiosInstance.get(API_ENDPOINTS.KHO, { params });
  return res.data;
},

  
  // Get kho by ma_kho
  getById: async (ma_kho) => {
    return axiosInstance.get(API_ENDPOINTS.KHO_DETAIL(ma_kho));
  },
  
  // Create kho
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.KHO, data);
  },
  
  // Update kho
  update: async (ma_kho, data) => {
    return axiosInstance.put(API_ENDPOINTS.KHO_DETAIL(ma_kho), data);
  },
  
  // Delete kho
  delete: async (ma_kho) => {
    return axiosInstance.delete(API_ENDPOINTS.KHO_DETAIL(ma_kho));
  }
};