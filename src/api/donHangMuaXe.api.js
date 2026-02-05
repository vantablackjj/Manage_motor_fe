import axiosInstance from "./axios.config";

const ENDPOINTS = {
  BASE: "/don-hang-mua-xe",
  DETAIL: (id) => `/don-hang-mua-xe/${id}`,
  UPDATE: (id) => `/orders/${id}`, // Use unified orders endpoint for updates
  CHI_TIET: (id) => `/don-hang-mua-xe/${id}/chi-tiet`,
  GUI_DUYET: (id) => `/don-hang-mua-xe/${id}/submit`,
  PHE_DUYET: (id) => `/don-hang-mua-xe/${id}/approve`,
  HUY: (id) => `/don-hang-mua-xe/${id}/reject`,
  NHAP_KHO: (id) => `/don-hang-mua-xe/${id}/nhap-kho`,
};

export const donHangMuaXeAPI = {
  getAll: (params) => axiosInstance.get(ENDPOINTS.BASE, { params }),

  getById: (id) => axiosInstance.get(ENDPOINTS.DETAIL(id)),
  update: (id, data) => axiosInstance.put(ENDPOINTS.UPDATE(id), data),

  create: (data) => axiosInstance.post(ENDPOINTS.BASE, data),

  createWithDetails: (data) =>
    axiosInstance.post(`${ENDPOINTS.BASE}/create-with-details`, data),

  addChiTiet: (id, data) => axiosInstance.post(ENDPOINTS.CHI_TIET(id), data),

  guiDuyet: (id) => axiosInstance.post(ENDPOINTS.GUI_DUYET(id)),

  pheDuyet: (id) => axiosInstance.post(ENDPOINTS.PHE_DUYET(id)),

  huy: (id, data) => axiosInstance.post(ENDPOINTS.HUY(id), data),

  nhapKho: (id, data) => axiosInstance.post(ENDPOINTS.NHAP_KHO(id), data),
  deleteChiTiet: (id, chiTietId) =>
    axiosInstance.delete(`${ENDPOINTS.CHI_TIET(id)}/${chiTietId}`),

  inDonHang: (id) =>
    axiosInstance.get(`${ENDPOINTS.DETAIL(id)}/in-don-hang`, {
      responseType: "blob",
    }),
};
