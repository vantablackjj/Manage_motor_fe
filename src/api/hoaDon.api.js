// src/api/hoaDon.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const hoaDonAPI = {
  // Get all hoa don
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.HOA_DON_BAN, { params });
  },

  // Get hoa don by ma_hd
  getById: async (ma_hd) => {
    return axiosInstance.get(API_ENDPOINTS.HOA_DON_BAN_DETAIL(ma_hd));
  },

  // Create hoa don
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.HOA_DON_BAN, data);
  },

  // Update hoa don
  update: async (ma_hd, data) => {
    return axiosInstance.put(API_ENDPOINTS.HOA_DON_BAN_DETAIL(ma_hd), data);
  },

  // Delete hoa don
  delete: async (ma_hd) => {
    return axiosInstance.delete(API_ENDPOINTS.HOA_DON_BAN_DETAIL(ma_hd));
  },

  // Add chi tiet (xe or phu tung) to hoa don
  addChiTiet: async (ma_hd, data) => {
    return axiosInstance.post(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(ma_hd)}/chi-tiet`,
      data,
    );
  },

  // Update chi tiet
  updateChiTiet: async (ma_hd, stt, data) => {
    return axiosInstance.put(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(ma_hd)}/chi-tiet/${stt}`,
      data,
    );
  },

  // Delete chi tiet
  deleteChiTiet: async (ma_hd, stt) => {
    return axiosInstance.delete(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(ma_hd)}/chi-tiet/${stt}`,
    );
  },

  // Send for approval (gui duyet)
  guiDuyet: async (ma_hd) => {
    return axiosInstance.post(API_ENDPOINTS.HOA_DON_BAN_GUI_DUYET(ma_hd));
  },

  // Approve (phe duyet)
  pheDuyet: async (ma_hd) => {
    return axiosInstance.post(API_ENDPOINTS.HOA_DON_BAN_PHE_DUYET(ma_hd));
  },

  // Cancel (huy duyet)
  huyDuyet: async (ma_hd) => {
    return axiosInstance.post(API_ENDPOINTS.HOA_DON_BAN_HUY(ma_hd));
  },

  // Delivery approval workflow
  // Send for delivery approval (gui duyet giao)
  guiDuyetGiao: async (so_hd) => {
    return axiosInstance.patch(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(so_hd)}/gui-duyet-giao`,
    );
  },

  // Approve delivery (phe duyet giao)
  pheDuyetGiao: async (so_hd, data) => {
    return axiosInstance.patch(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(so_hd)}/phe-duyet-giao`,
      data,
    );
  },

  // Confirm delivered (xac nhan da giao)
  xacNhanDaGiao: async (so_hd, data) => {
    return axiosInstance.patch(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(so_hd)}/xac-nhan-da-giao`,
      data,
    );
  },

  // Print Invoice
  inHoaDon: async (so_hd) => {
    return axiosInstance.get(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(so_hd)}/in-hoa-don`,
      {
        responseType: "blob",
      },
    );
  },

  // Payment (Thanh toan cong no)
  thanhToan: async (so_hd, data) => {
    return axiosInstance.post(
      `${API_ENDPOINTS.HOA_DON_BAN_DETAIL(so_hd)}/thanh-toan`,
      data,
    );
  },
};
