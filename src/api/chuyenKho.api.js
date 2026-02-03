// src/api/chuyenKho.api.js
import axiosInstance from "./axios.config";

const BASE_URL = "/chuyen-kho";

export const chuyenKhoAPI = {
  // Lấy danh sách phiếu chuyển kho
  // GET /api/chuyen-kho?page=1&limit=20&trang_thai=NHAP
  getAll: async (params) => {
    const res = await axiosInstance.get(BASE_URL, { params });
    return res.data;
  },

  // Lấy chi tiết phiếu
  // GET /api/chuyen-kho/:ma_phieu
  // Response: { phieu, chi_tiet_xe, chi_tiet_phu_tung }
  getById: async (ma_phieu) => {
    const res = await axiosInstance.get(`${BASE_URL}/${ma_phieu}`);
    return res.data;
  },

  // Tạo phiếu mới (Header only)
  // POST /api/chuyen-kho
  // Payload: { ma_phieu, ngay_chuyen_kho, ma_kho_xuat, ma_kho_nhap, dien_giai }
  create: async (data) => {
    const res = await axiosInstance.post(BASE_URL, data);
    return res.data;
  },

  // Thêm xe vào phiếu
  // POST /api/chuyen-kho/:ma_phieu/xe
  // Payload: { xe_key, ma_kho_hien_tai }
  addXe: async (ma_phieu, data) => {
    const res = await axiosInstance.post(`${BASE_URL}/${ma_phieu}/xe`, data);
    return res.data;
  },

  // Thêm phụ tùng vào phiếu
  // POST /api/chuyen-kho/:ma_phieu/phu-tung
  // Payload: { ma_pt, ten_pt, don_vi_tinh, so_luong, don_gia }
  addPhuTung: async (ma_phieu, data) => {
    const res = await axiosInstance.post(
      `${BASE_URL}/${ma_phieu}/phu-tung`,
      data,
    );
    return res.data;
  },

  // Gửi duyệt (Submit for review)
  // POST /api/chuyen-kho/:ma_phieu/gui-duyet
  // Payload: {} (empty)
  guiDuyet: async (ma_phieu) => {
    const res = await axiosInstance.post(`${BASE_URL}/${ma_phieu}/gui-duyet`);
    return res.data;
  },

  // Phê duyệt (Approve - changes status to DA_DUYET)
  // POST /api/chuyen-kho/:ma_phieu/phe-duyet
  // Payload: {} (empty)
  pheDuyet: async (ma_phieu) => {
    const res = await axiosInstance.post(`${BASE_URL}/${ma_phieu}/phe-duyet`);
    return res.data;
  },

  // Nhập kho (Execute transfer - partial or full receiving)
  // POST /api/chuyen-kho/:ma_phieu/nhap-kho
  // Payload: { danh_sach_nhap: [{ stt, so_luong_nhap, ma_serial? }] }
  nhapKho: async (ma_phieu, payload) => {
    const res = await axiosInstance.post(
      `${BASE_URL}/${ma_phieu}/nhap-kho`,
      payload,
    );
    return res.data;
  },

  // Hủy/Từ chối (Cancel/Reject)
  // POST /api/chuyen-kho/:ma_phieu/huy
  // Payload: { ly_do }
  huy: async (ma_phieu, ly_do) => {
    const res = await axiosInstance.post(`${BASE_URL}/${ma_phieu}/huy`, {
      ly_do,
    });
    return res.data;
  },

  // In Phieu chuyen kho
  inPhieu: async (ma_phieu) => {
    return axiosInstance.get(`${BASE_URL}/${ma_phieu}/in-phieu`, {
      responseType: "blob",
    });
  },
};
