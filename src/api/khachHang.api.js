// src/api/khachHang.api.js
import axiosInstance from "./axios.config";

const KHACH_HANG_ENDPOINTS = {
  BASE: "/khach-hang",
  DETAIL: (ma_kh) => `/khach-hang/${ma_kh}`,
};

export const khachHangAPI = {
  // Get all partners (Đối tác)
  getAll: async (params) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.BASE, { params });
  },

  // Get partner by ma_kh
  getById: async (ma_kh) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.DETAIL(ma_kh));
  },

  // Create partner
  create: async (data) => {
    return axiosInstance.post(KHACH_HANG_ENDPOINTS.BASE, data);
  },

  // Update partner
  update: async (ma_kh, data) => {
    return axiosInstance.put(KHACH_HANG_ENDPOINTS.DETAIL(ma_kh), data);
  },

  // Delete partner (Soft delete supported by backend)
  delete: async (ma_kh) => {
    return axiosInstance.delete(KHACH_HANG_ENDPOINTS.DETAIL(ma_kh));
  },

  // For compatibility and specifically requested dropdown filters
  getNhaCungCap: async (params) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.BASE, {
      params: { ...params, la_ncc: true },
    });
  },

  getKhachHang: async (params) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.BASE, {
      params: { ...params, la_ncc: false },
    });
  },

  // Search partners
  search: async (keyword, params) => {
    return axiosInstance.get(`${KHACH_HANG_ENDPOINTS.BASE}/search`, {
      params: { ...params, keyword },
    });
  },

  // Get purchase history
  getPurchaseHistory: async (ma_kh, params) => {
    return axiosInstance.get(
      `${KHACH_HANG_ENDPOINTS.DETAIL(ma_kh)}/lich-su-mua`,
      { params },
    );
  },

  // Get debt info
  getDebtInfo: async (ma_kh) => {
    return axiosInstance.get(`${KHACH_HANG_ENDPOINTS.DETAIL(ma_kh)}/cong-no`);
  },
};
