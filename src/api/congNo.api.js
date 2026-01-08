// src/api/congNo.api.js
import axiosInstance from "./axios.config";

const CONG_NO_ENDPOINTS = {
  BASE: "/cong-no",
  CHI_TIET: "/cong-no/chi-tiet",
  THANH_TOAN: "/cong-no/thanh-toan",
};

export const congNoAPI = {
  getAllKho: (params) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.BASE, { params });
  },

  getChiTiet: (params) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.CHI_TIET, { params });
  },

  createThanhToan: (data) => {
    return axiosInstance.post(CONG_NO_ENDPOINTS.THANH_TOAN, data);
  },

  // getAllThanhToan removed as /cong-no/thanh-toan is POST only for creating payments.
};
