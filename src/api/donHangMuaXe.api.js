import axiosInstance from "./axios.config";

const ENDPOINTS = {
  BASE: "/don-hang-mua-xe",
  DETAIL: (id) => `/don-hang-mua-xe/${id}`,
  CHI_TIET: (id) => `/don-hang-mua-xe/${id}/chi-tiet`,
  GUI_DUYET: (id) => `/don-hang-mua-xe/${id}/submit`,
  PHE_DUYET: (id) => `/don-hang-mua-xe/${id}/approve`,
  HUY: (id) => `/don-hang-mua-xe/${id}/reject`,
  NHAP_KHO: (id) => `/don-hang-mua-xe/${id}/nhap-kho`,
};

export const donHangMuaXeAPI = {
  getAll: (params) => axiosInstance.get(ENDPOINTS.BASE, { params }),

  getById: (id) => axiosInstance.get(ENDPOINTS.DETAIL(id)),

  create: (data) => axiosInstance.post(ENDPOINTS.BASE, data),

  createWithDetails: (data) =>
    axiosInstance.post(`${ENDPOINTS.BASE}/create-with-details`, data),

  addChiTiet: (id, data) => axiosInstance.post(ENDPOINTS.CHI_TIET(id), data),

  guiDuyet: (id) => axiosInstance.post(ENDPOINTS.GUI_DUYET(id)),

  pheDuyet: (id) => axiosInstance.post(ENDPOINTS.PHE_DUYET(id)),

  huy: (id) => axiosInstance.post(ENDPOINTS.HUY(id)),

  nhapKho: (id, data) => axiosInstance.post(ENDPOINTS.NHAP_KHO(id), data),
};
