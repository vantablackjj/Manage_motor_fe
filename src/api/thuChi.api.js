// src/api/thuChi.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const thuChiAPI = {
  // Get all thu chi
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.THU_CHI, { params });
  },

  // Get thu chi detail by so_phieu
  getBySoPhieu: async (so_phieu) => {
    return axiosInstance.get(API_ENDPOINTS.THU_CHI_DETAIL(so_phieu));
  },

  // Create thu chi (Thu or Chi)
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.THU_CHI, data);
  },

  // Send for approval (gui duyet)
  guiDuyet: async (so_phieu) => {
    return axiosInstance.post(
      `${API_ENDPOINTS.THU_CHI_DETAIL(so_phieu)}/gui-duyet`
    );
  },

  // Approve (phe duyet)
  pheDuyet: async (so_phieu) => {
    return axiosInstance.post(
      `${API_ENDPOINTS.THU_CHI_DETAIL(so_phieu)}/phe-duyet`
    );
  },

  // Cancel (huy)
  huy: async (so_phieu, data) => {
    // data: { ly_do: string }
    return axiosInstance.post(
      `${API_ENDPOINTS.THU_CHI_DETAIL(so_phieu)}/huy`,
      data
    );
  },

  // Note: Following are kept for compatibility if needed, but primary access should be via getAll with filters
  // Get thu chi by kho
  getByKho: async (ma_kho, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/kho/${ma_kho}`, {
      params,
    });
  },

  // Get thu chi by loai (THU or CHI)
  getByLoai: async (loai, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/loai/${loai}`, {
      params,
    });
  },

  // Get thu chi linked to don hang
  getByDonHang: async (ma_phieu, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/don-hang/${ma_phieu}`, {
      params,
    });
  },

  // Get thu chi linked to hoa don
  getByHoaDon: async (ma_hd, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.THU_CHI}/hoa-don/${ma_hd}`, {
      params,
    });
  },
};
