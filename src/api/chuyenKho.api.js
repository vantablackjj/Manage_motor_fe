// src/api/chuyenKho.api.js
import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constant';

export const chuyenKhoAPI = {
  // Get all chuyen kho
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.CHUYEN_KHO, { params });
  },
  
  // Get chuyen kho by ma_phieu
  getById: async (ma_phieu) => {
    return axiosInstance.get(API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu));
  },
  
  // Create chuyen kho
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.CHUYEN_KHO, data);
  },
  
  // Update chuyen kho
  update: async (ma_phieu, data) => {
    return axiosInstance.put(API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu), data);
  },
  
  // Delete chuyen kho
  delete: async (ma_phieu) => {
    return axiosInstance.delete(API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu));
  },
  
  // Add xe to chuyen kho
  addXe: async (ma_phieu, data) => {
    return axiosInstance.post(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/xe`, data);
  },
  
  // Remove xe from chuyen kho
  removeXe: async (ma_phieu, xe_key) => {
    return axiosInstance.delete(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/xe/${xe_key}`);
  },
  
  // Add phu tung to chuyen kho
  addPhuTung: async (ma_phieu, data) => {
    return axiosInstance.post(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/phu-tung`, data);
  },
  
  // Update phu tung in chuyen kho
  updatePhuTung: async (ma_phieu, stt, data) => {
    return axiosInstance.put(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/phu-tung/${stt}`, data);
  },
  
  // Remove phu tung from chuyen kho
  removePhuTung: async (ma_phieu, stt) => {
    return axiosInstance.delete(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/phu-tung/${stt}`);
  },
  
  // Send for approval (gui duyet)
  guiDuyet: async (ma_phieu) => {
    return axiosInstance.post(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/gui-duyet`);
  },
  
  // Approve (phe duyet)
  pheDuyet: async (ma_phieu, data) => {
    return axiosInstance.post(API_ENDPOINTS.CHUYEN_KHO_PHE_DUYET(ma_phieu), data);
  },
  
  // Reject (tu choi)
  tuChoi: async (ma_phieu, data) => {
    return axiosInstance.post(API_ENDPOINTS.CHUYEN_KHO_TU_CHOI(ma_phieu), data);
  },
  
  // Cancel (huy)
  huy: async (ma_phieu) => {
    return axiosInstance.post(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/huy`);
  },
  
  // Get phieu xuat kho
  getPhieuXuat: async (ma_phieu) => {
    return axiosInstance.get(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/phieu-xuat`);
  },
  
  // Get phieu nhap kho
  getPhieuNhap: async (ma_phieu) => {
    return axiosInstance.get(`${API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)}/phieu-nhap`);
  }
};