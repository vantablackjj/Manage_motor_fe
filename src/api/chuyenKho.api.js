// src/api/chuyenKho.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const chuyenKhoAPI = {
  // Lấy danh sách phiếu chuyển kho
  getAll: async (params) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CHUYEN_KHO, { params });
    return res;
  },

  // Lấy chi tiết phiếu
  getById: async (ma_phieu) => {
    const res = await axiosInstance.get(
      API_ENDPOINTS.CHUYEN_KHO_DETAIL(ma_phieu)
    );
    return res;
  },

  // Tạo phiếu mới
  create: async (data) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CHUYEN_KHO, data);
    return res;
  },

  // Thêm xe vào phiếu
  addXe: async (ma_phieu, data) => {
    // data: { xe_key, ma_kho_hien_tai }
    const res = await axiosInstance.post(
      API_ENDPOINTS.CHUYEN_KHO_THEM_XE(ma_phieu),
      data
    );
    return res;
  },

  // Thêm phụ tùng vào phiếu
  addPhuTung: async (ma_phieu, data) => {
    // data: { ma_pt, ten_pt, don_vi_tinh, so_luong, don_gia }
    const res = await axiosInstance.post(
      API_ENDPOINTS.CHUYEN_KHO_THEM_PT(ma_phieu),
      data
    );
    return res;
  },

  // Gửi duyệt
  guiDuyet: async (ma_phieu) => {
    const res = await axiosInstance.post(
      API_ENDPOINTS.CHUYEN_KHO_GUI_DUYET(ma_phieu)
    );
    return res;
  },

  // Phê duyệt
  pheDuyet: async (ma_phieu) => {
    const res = await axiosInstance.post(
      API_ENDPOINTS.CHUYEN_KHO_PHE_DUYET(ma_phieu)
    );
    return res;
  },

  // Hủy/Từ chối duyệt
  huy: async (so_phieu, ly_do) => {
    const res = await axiosInstance.post(
      API_ENDPOINTS.CHUYEN_KHO_HUY(so_phieu),
      { ly_do }
    );
    return res;
  },
};
