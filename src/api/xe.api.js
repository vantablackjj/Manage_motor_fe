// src/api/xe.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const xeAPI = {
  // Get xe ton kho
  getTonKho: async (ma_kho, params) => {
    return axiosInstance.get(API_ENDPOINTS.XE_TON_KHO(ma_kho), { params });
  },

  // Get xe detail
  getDetail: async (xe_key) => {
    return axiosInstance.get(API_ENDPOINTS.XE_DETAIL(xe_key));
  },

  // Get xe lich su
  getLichSu: async (xe_key) => {
    return axiosInstance.get(API_ENDPOINTS.XE_LICH_SU(xe_key));
  },

  // Create xe
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.XE, data);
  },

  // Update xe
  update: async (xe_key, data) => {
    return axiosInstance.put(API_ENDPOINTS.XE_DETAIL(xe_key), data);
  },

  // Delete xe
  delete: async (xe_key) => {
    return axiosInstance.put(API_ENDPOINTS.XE_KHOA(xe_key));
  },
  unlock: async (xe_key) => {
    return axiosInstance.put(API_ENDPOINTS.XE_MO_KHOA(xe_key));
  },
  lockPhieu: async (xe_key) => {
    return axiosInstance.put(API_ENDPOINTS.XE_KHOA_PHIEU(xe_key));
  },
  // Approval Workflow
  getApprovalList: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.XE_APPROVAL_LIST, { params });
  },
  submitApproval: async (xe_key) => {
    return axiosInstance.post(API_ENDPOINTS.XE_SUBMIT(xe_key));
  },
  approve: async (xe_key) => {
    return axiosInstance.post(API_ENDPOINTS.XE_APPROVE(xe_key));
  },
  reject: async (xe_key, data) => {
    return axiosInstance.post(API_ENDPOINTS.XE_REJECT(xe_key), data);
  },
};
