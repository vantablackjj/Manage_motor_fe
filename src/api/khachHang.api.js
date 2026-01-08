// src/api/khachHang.api.js
import axiosInstance from "./axios.config";

const KHACH_HANG_ENDPOINTS = {
  BASE: "/khach-hang",
  DETAIL: (ma_kh) => `/khach-hang/${ma_kh}`,
  NCC: "/khach-hang/nha-cung-cap",
  CUSTOMERS: "/khach-hang",
};

export const khachHangAPI = {
  // Get all khach hang
  getAll: async (params) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.BASE, { params });
  },

  // Get khach hang by ma_kh
  getById: async (ma_kh) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.DETAIL(ma_kh));
  },

  // Create khach hang
  create: async (data) => {
    return axiosInstance.post(KHACH_HANG_ENDPOINTS.BASE, data);
  },

  // Update khach hang
  update: async (ma_kh, data) => {
    return axiosInstance.put(KHACH_HANG_ENDPOINTS.DETAIL(ma_kh), data);
  },

  // Delete khach hang
  delete: async (ma_kh) => {
    return axiosInstance.delete(KHACH_HANG_ENDPOINTS.DETAIL(ma_kh));
  },

  // Get nha cung cap (la_ncc = true)
  getNhaCungCap: async (params) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.NCC, { params });
  },

  // Get khach hang (la_ncc = false)
  getKhachHang: async (params) => {
    return axiosInstance.get(KHACH_HANG_ENDPOINTS.CUSTOMERS, { params });
  },

  // Search khach hang by name or phone
  search: async (keyword) => {
    return axiosInstance.get(`${KHACH_HANG_ENDPOINTS.BASE}/search`, {
      params: { keyword },
    });
  },

  // Get purchase history
  getPurchaseHistory: async (ma_kh, params) => {
    return axiosInstance.get(
      `${KHACH_HANG_ENDPOINTS.DETAIL(ma_kh)}/lich-su-mua`,
      { params }
    );
  },

  // Get debt info
  getDebtInfo: async (ma_kh) => {
    return axiosInstance.get(`${KHACH_HANG_ENDPOINTS.DETAIL(ma_kh)}/cong-no`);
  },
};
