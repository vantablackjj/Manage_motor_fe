// src/api/phuTung.api.js
import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '../utils/constant';

export const phuTungAPI = {
  // Get all phu tung
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.PHU_TUNG, { params });
  },
  
  // Get phu tung ton kho
  getTonKho: async (ma_kho, params) => {
    return axiosInstance.get(API_ENDPOINTS.PHU_TUNG_TON_KHO(ma_kho), { params });
  },
  
  // Get phu tung detail
  getDetail: async (ma_pt) => {
    return axiosInstance.get(API_ENDPOINTS.PHU_TUNG_DETAIL(ma_pt));
  },
  
  // Create phu tung
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.PHU_TUNG, data);
  },
  
  // Update phu tung
  update: async (ma_pt, data) => {
    return axiosInstance.put(API_ENDPOINTS.PHU_TUNG_DETAIL(ma_pt), data);
  },
  
  // Delete phu tung
  delete: async (ma_pt) => {
    return axiosInstance.delete(API_ENDPOINTS.PHU_TUNG_DETAIL(ma_pt));
  },
  lock :async (ma_pt)=>{
    return axiosInstance.patch(API_ENDPOINTS.PHU_TUNG_KHOA_BY_KHO,{ma_pt})
  },
  unLock : async(ma_phieu,ma_pt)=>{
    return axiosInstance.patch(API_ENDPOINTS.PHU_TUNG_KHOA_BY_PT,{ma_phieu,ma_pt})
  },
  getLichSu: async (ma_pt) => {
  return axiosInstance.get(API_ENDPOINTS.PHU_TUNG_LICH_SU(ma_pt));
}

};