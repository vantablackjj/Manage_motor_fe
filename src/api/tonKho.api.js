// src/api/tonKho.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const tonKhoAPI = {
  // Get all ton kho (tong hop)
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.TON_KHO, { params });
  },

  // Get ton kho by kho
  getByKho: async (ma_kho, params) => {
    return axiosInstance.get(API_ENDPOINTS.TON_KHO_KHO(ma_kho), { params });
  },

  // Increase stock (nhap kho)
  increase: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.TON_KHO_INCREASE, data);
  },

  // Decrease stock (xuat kho)
  decrease: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.TON_KHO_DECREASE, data);
  },

  // Get ton kho of specific phu tung in kho
  getPhuTungInKho: async (ma_kho, ma_pt) => {
    return axiosInstance.get(
      `${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/phu-tung/${ma_pt}`
    );
  },

  // Get low stock items (canh bao ton kho thap)
  getLowStock: async (ma_kho) => {
    return axiosInstance.get(`${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/low-stock`);
  },

  // Get out of stock items
  getOutOfStock: async (ma_kho) => {
    return axiosInstance.get(
      `${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/out-of-stock`
    );
  },

  // Adjust stock (dieu chinh ton kho - kiem ke)
  adjustStock: async (ma_kho, ma_pt, data) => {
    return axiosInstance.post(
      `${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/adjust/${ma_pt}`,
      data
    );
  },

  // Get stock history
  getStockHistory: async (ma_kho, ma_pt, params) => {
    return axiosInstance.get(
      `${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/history/${ma_pt}`,
      { params }
    );
  },

  // Get stock movements (nhap/xuat) for a period
  getStockMovements: async (ma_kho, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/movements`, {
      params,
    });
  },

  // Get ton kho xe (vehicle inventory by warehouse)
  getTonKhoXe: async (ma_kho, params) => {
    return axiosInstance.get(`${API_ENDPOINTS.TON_KHO_KHO(ma_kho)}/xe`, {
      params,
    });
  },
};
