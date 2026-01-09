import axiosInstance from "./axios.config";

const BASE = "/hoa-don-ban";

export const hoaDonBanAPI = {
  // Get all sales orders with optional filters
  getAll: (params) => axiosInstance.get(BASE, { params }),

  // Get sales order by so_hd
  getById: (soHd) => axiosInstance.get(`${BASE}/${soHd}`),

  // Create new sales order (Header only)
  create: (data) => axiosInstance.post(BASE, data),

  // Add vehicle to sales order
  addXe: (soHd, data) => axiosInstance.post(`${BASE}/${soHd}/xe`, data),

  // Add part to sales order
  addPhuTung: (soHd, data) =>
    axiosInstance.post(`${BASE}/${soHd}/phu-tung`, data),

  // Delete detail item (auto-unlocks stock)
  deleteDetail: (soHd, stt) =>
    axiosInstance.delete(`${BASE}/${soHd}/chi-tiet/${stt}`),

  // Send for approval
  guiDuyet: (soHd) => axiosInstance.patch(`${BASE}/${soHd}/gui-duyet`),

  // Approve (Admin only)
  pheDuyet: (soHd) => axiosInstance.patch(`${BASE}/${soHd}/phe-duyet`),

  // Reject
  tuChoi: (soHd) => axiosInstance.patch(`${BASE}/${soHd}/tu-choi`),

  // Cancel with reason
  huy: (soHd, lyDo) =>
    axiosInstance.patch(`${BASE}/${soHd}/huy`, { ly_do: lyDo }),
};
