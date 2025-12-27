// src/api/thuChi.api.js
import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constant';

export const thuChiAPI = {
  // Get all thu chi
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.THU_CHI, { params });
  },
  
  // Get thu chi by id
  getById: async (id) => {
    return axiosInstance.get(API_ENDPOINTS.THU_CHI_DETAIL(id));
  },
  
  // Create thu chi (Thu or Chi)
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.THU_CHI, data);
  },
  
  // Update thu chi
  update: async (id, data) => {
    return axiosInstance.put(API_ENDPOINTS.THU_CHI_DETAIL(id), data);
  },
  
  // Delete thu chi
  delete: async (id) => {
    return axiosInstance.delete(API_ENDPOINTS.THU_CHI_DETAIL(id));
  },
  
  // Send for approval (gui duyet)
  guiDuyet: async (id) => {
    return axiosInstance.post(`${API_ENDPOINTS.THU_CHI_DETAIL(id)}/gui-duyet`);
  },
  
  // Approve (phe duyet)
  pheDuyet: async (id) => {
    return axiosInstance.post(`${API_ENDPOINTS.THU_CHI_DETAIL(id)}/phe-duyet`);
  },
  
  // Cancel (huy)
  huy: async (id) => {
    return axiosInstance.post(`${API_ENDPOINTS.THU_CHI_DETAIL(id)}/huy`);
  },
  
  // Get thu chi by kho
  getByKho: async (ma_kho, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/kho/${ma_kho}`, { params });
  },
  
  // Get thu chi by loai (THU or CHI)
  getByLoai: async (loai, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/loai/${loai}`, { params });
  },
  
  // Get thu chi linked to don hang
  getByDonHang: async (ma_phieu, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/don-hang/${ma_phieu}`, { params });
  },
  
  // Get thu chi linked to hoa don
  getByHoaDon: async (ma_hd, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/hoa-don/${ma_hd}`, { params });
  }
};