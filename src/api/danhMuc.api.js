// src/api/danhMuc.api.js
// API cho các danh mục (Brand, Color, Loại hình, Nơi sản xuất, Model xe, Màu xe)
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const danhMucAPI = {
  // ===== BRAND (NHÃN HIỆU) =====
  // ===== BRAND (NHÃN HIỆU & NHÓM HÀNG) =====
  brand: {
    getAll: async (params) => {
      // params can include type (XE/PT) and status (true/all)
      const res = await axiosInstance.get(API_ENDPOINTS.BRAND, { params });
      return res.data;
    },
    getById: async (ma_nh) => {
      return axiosInstance.get(`${API_ENDPOINTS.BRAND}/${ma_nh}`);
    },
    create: async (data) => {
      // data: { ten_nh, ma_nhom_cha: 'XE' | 'PT' }
      return axiosInstance.post(API_ENDPOINTS.BRAND, data);
    },
    update: async (ma_nh, data) => {
      // Supports partial update: { status: true } or { ten_nh: "..." }
      return axiosInstance.put(`${API_ENDPOINTS.BRAND}/${ma_nh}`, data);
    },
    delete: async (ma_nh) => {
      return axiosInstance.delete(`${API_ENDPOINTS.BRAND}/${ma_nh}`);
    },
  },

  // ===== COLOR (MÀU) =====
  color: {
    getAll: async (params) => {
      const res = await axiosInstance.get(API_ENDPOINTS.COLOR, { params });
      return res.data;
    },
    getById: async (ma_mau) => {
      return axiosInstance.get(`${API_ENDPOINTS.COLOR}/${ma_mau}`);
    },
    create: async (data) => {
      return axiosInstance.post(API_ENDPOINTS.COLOR, data);
    },
    update: async (ma_mau, data) => {
      return axiosInstance.put(`${API_ENDPOINTS.COLOR}/${ma_mau}`, data);
    },
    delete: async (ma_mau) => {
      return axiosInstance.delete(`${API_ENDPOINTS.COLOR}/${ma_mau}`);
    },
  },

  // ===== LOẠI HÌNH =====
  loaiHinh: {
    getAll: async (params) => {
      const res = await axiosInstance.get(API_ENDPOINTS.LOAI_HINH, { params });
      return res.data;
    },
    getById: async (ma_lh) => {
      return axiosInstance.get(`${API_ENDPOINTS.LOAI_HINH}/${ma_lh}`);
    },
    create: async (data) => {
      return axiosInstance.post(API_ENDPOINTS.LOAI_HINH, data);
    },
    update: async (ma_lh, data) => {
      return axiosInstance.put(`${API_ENDPOINTS.LOAI_HINH}/${ma_lh}`, data);
    },
    delete: async (ma_lh) => {
      return axiosInstance.delete(`${API_ENDPOINTS.LOAI_HINH}/${ma_lh}`);
    },
  },

  // ===== NƠI SẢN XUẤT =====
  noiSanXuat: {
    getAll: async (params) => {
      const res = await axiosInstance.get(API_ENDPOINTS.NOI_SX, { params });
      return res.data;
    },
    getById: async (ma) => {
      return axiosInstance.get(`${API_ENDPOINTS.NOI_SX}/${ma}`);
    },
    create: async (data) => {
      return axiosInstance.post(API_ENDPOINTS.NOI_SX, data);
    },
    update: async (ma, data) => {
      return axiosInstance.put(`${API_ENDPOINTS.NOI_SX}/${ma}`, data);
    },
    delete: async (ma) => {
      return axiosInstance.delete(`${API_ENDPOINTS.NOI_SX}/${ma}`);
    },
  },

  // ===== MODEL CAR (LOẠI XE) =====
  modelCar: {
    getAll: async (params) => {
      const res = await axiosInstance.get(API_ENDPOINTS.MODEL_CAR, { params });
      return res.data;
    },
    getById: async (ma_loai) => {
      return axiosInstance.get(`${API_ENDPOINTS.MODEL_CAR}/${ma_loai}`);
    },
    create: async (data) => {
      return axiosInstance.post(API_ENDPOINTS.MODEL_CAR, data);
    },
    update: async (ma_loai, data) => {
      return axiosInstance.put(`${API_ENDPOINTS.MODEL_CAR}/${ma_loai}`, data);
    },
    delete: async (ma_loai) => {
      return axiosInstance.delete(`${API_ENDPOINTS.MODEL_CAR}/${ma_loai}`);
    },
    // Get available colors for a model
    getColors: async (ma_loai) => {
      return axiosInstance.get(`${API_ENDPOINTS.MODEL_CAR}/${ma_loai}/colors`);
    },
    // Add color to model
    addColor: async (ma_loai, ma_mau) => {
      return axiosInstance.post(
        `${API_ENDPOINTS.MODEL_CAR}/${ma_loai}/colors`,
        { ma_mau },
      );
    },
    // Remove color from model
    removeColor: async (ma_loai, ma_mau) => {
      return axiosInstance.delete(
        `${API_ENDPOINTS.MODEL_CAR}/${ma_loai}/colors/${ma_mau}`,
      );
    },
  },

  // ===== CAR COLOR (MÀU XE - XE_MAU) =====
  carColor: {
    getAll: async (params) => {
      const res = await axiosInstance.get(API_ENDPOINTS.CAR_COLOR, { params });
      return res.data;
    },
    getByModel: async (ma_loai_xe, params) => {
      return axiosInstance.get(
        `${API_ENDPOINTS.CAR_COLOR}/model/${ma_loai_xe}`,
        { params },
      );
    },
    getByColor: async (ma_mau, params) => {
      return axiosInstance.get(`${API_ENDPOINTS.CAR_COLOR}/color/${ma_mau}`, {
        params,
      });
    },
    create: async (data) => {
      return axiosInstance.post(API_ENDPOINTS.CAR_COLOR, data);
    },
    delete: async (ma_loai_xe, ma_mau) => {
      return axiosInstance.delete(
        `${API_ENDPOINTS.CAR_COLOR}/${ma_loai_xe}/${ma_mau}`,
      );
    },
  },

  // ===== NHÓM HÀNG (Unified with Brand) =====
  nhomHang: {
    getAll: async (params) => {
      return danhMucAPI.brand.getAll({ ...params, type: "PT" });
    },
    getById: async (ma_nh) => {
      return danhMucAPI.brand.getById(ma_nh);
    },
    create: async (data) => {
      return danhMucAPI.brand.create({ ...data, ma_nhom_cha: "PT" });
    },
    update: async (ma_nh, data) => {
      return danhMucAPI.brand.update(ma_nh, data);
    },
    delete: async (ma_nh) => {
      return danhMucAPI.brand.delete(ma_nh);
    },
  },
};
