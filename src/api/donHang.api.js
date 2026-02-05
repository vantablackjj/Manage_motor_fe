// src/api/donHang.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const donHangAPI = {
  // Get all don hang
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.DON_HANG_MUA, { params });
  },

  // Get don hang by ma_phieu
  getById: async (ma_phieu) => {
    return axiosInstance.get(API_ENDPOINTS.DON_HANG_MUA_DETAIL(ma_phieu));
  },

  // Create don hang
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.DON_HANG_MUA, data);
  },

  // Update don hang
  update: async (ma_phieu, data) => {
    return axiosInstance.put(`${API_ENDPOINTS.ORDERS}/${ma_phieu}`, data);
  },

  // Delete don hang
  delete: async (ma_phieu) => {
    return axiosInstance.delete(API_ENDPOINTS.DON_HANG_MUA_DETAIL(ma_phieu));
  },

  // Add chi tiet (phu tung) to don hang
  addChiTiet: async (ma_phieu, data) => {
    return axiosInstance.post(
      API_ENDPOINTS.DON_HANG_MUA_CHI_TIET(ma_phieu),
      data,
    );
  },

  // Update chi tiet
  updateChiTiet: async (ma_phieu, stt, data) => {
    return axiosInstance.put(
      `${API_ENDPOINTS.DON_HANG_MUA_CHI_TIET(ma_phieu)}/${stt}`,
      data,
    );
  },

  // Delete chi tiet
  deleteChiTiet: async (ma_phieu, stt) => {
    return axiosInstance.delete(
      `${API_ENDPOINTS.DON_HANG_MUA_CHI_TIET(ma_phieu)}/${stt}`,
    );
  },

  // Send for approval (gui duyet)
  guiDuyet: async (ma_phieu) => {
    return axiosInstance.post(API_ENDPOINTS.DON_HANG_MUA_GUI_DUYET(ma_phieu));
  },

  // Approve (phe duyet)
  pheDuyet: async (ma_phieu) => {
    return axiosInstance.post(API_ENDPOINTS.DON_HANG_MUA_PHE_DUYET(ma_phieu));
  },

  // Cancel (huy duyet)
  huyDuyet: async (ma_phieu) => {
    return axiosInstance.post(API_ENDPOINTS.DON_HANG_MUA_HUY(ma_phieu));
  },

  // Nhap kho
  nhapKho: async (ma_phieu, data) => {
    return axiosInstance.post(
      API_ENDPOINTS.DON_HANG_MUA_NHAP_KHO(ma_phieu),
      data,
    );
  },
  // In don hang
  inDonHang: async (ma_phieu) => {
    return axiosInstance.get(
      `${API_ENDPOINTS.DON_HANG_MUA_DETAIL(ma_phieu)}/in-don-hang`,
      { responseType: "blob" },
    );
  },
};
