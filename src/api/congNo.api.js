// src/api/congNo.api.js
import axiosInstance from './axios.config';

const CONG_NO_ENDPOINTS = {
  BASE: '/cong-no',
  KHO: '/cong-no/kho',
  KHO_DETAIL: (ma_kho) => `/cong-no/kho/${ma_kho}`,
  CHI_TIET: '/cong-no/chi-tiet',
  CHI_TIET_DETAIL: (id) => `/cong-no/chi-tiet/${id}`,
  THANH_TOAN: '/thanh-toan-kho',
  THANH_TOAN_DETAIL: (id) => `/thanh-toan-kho/${id}`,
  THANH_TOAN_CHI_TIET: '/thanh-toan-chi-tiet'
};

export const congNoAPI = {
  // ===== CÔNG NỢ KHO (TỔNG HỢP) =====
  
  // Get all cong no kho (tong hop)
  getAllKho: async (params) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.KHO, { params });
  },
  
  // Get cong no between two kho
  getBetweenKho: async (ma_kho_no, ma_kho_co) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.KHO}/${ma_kho_no}/${ma_kho_co}`);
  },
  
  // Get cong no by kho (all debts of a warehouse)
  getByKho: async (ma_kho, params) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.KHO_DETAIL(ma_kho), { params });
  },
  
  // ===== CÔNG NỢ CHI TIẾT =====
  
  // Get all cong no chi tiet
  getAllChiTiet: async (params) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.CHI_TIET, { params });
  },
  
  // Get cong no chi tiet by id
  getChiTietById: async (id) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.CHI_TIET_DETAIL(id));
  },
  
  // Get cong no chi tiet by phieu chuyen kho
  getChiTietByPhieu: async (so_phieu_chuyen_kho) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.CHI_TIET}/phieu/${so_phieu_chuyen_kho}`);
  },
  
  // Get cong no chi tiet chua thanh toan
  getChuaThanhToan: async (params) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.CHI_TIET}/chua-thanh-toan`, { params });
  },
  
  // Get cong no chi tiet da thanh toan
  getDaThanhToan: async (params) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.CHI_TIET}/da-thanh-toan`, { params });
  },
  
  // Get cong no chi tiet qua han
  getQuaHan: async (params) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.CHI_TIET}/qua-han`, { params });
  },
  
  // ===== THANH TOÁN KHO =====
  
  // Get all thanh toan
  getAllThanhToan: async (params) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.THANH_TOAN, { params });
  },
  
  // Get thanh toan by id
  getThanhToanById: async (id) => {
    return axiosInstance.get(CONG_NO_ENDPOINTS.THANH_TOAN_DETAIL(id));
  },
  
  // Create thanh toan
  createThanhToan: async (data) => {
    return axiosInstance.post(CONG_NO_ENDPOINTS.THANH_TOAN, data);
  },
  
  // Update thanh toan
  updateThanhToan: async (id, data) => {
    return axiosInstance.put(CONG_NO_ENDPOINTS.THANH_TOAN_DETAIL(id), data);
  },
  
  // Delete thanh toan
  deleteThanhToan: async (id) => {
    return axiosInstance.delete(CONG_NO_ENDPOINTS.THANH_TOAN_DETAIL(id));
  },
  
  // Get thanh toan by kho tra
  getThanhToanByKhoTra: async (ma_kho, params) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.THANH_TOAN}/kho-tra/${ma_kho}`, { params });
  },
  
  // Get thanh toan by kho nhan
  getThanhToanByKhoNhan: async (ma_kho, params) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.THANH_TOAN}/kho-nhan/${ma_kho}`, { params });
  },
  
  // ===== THANH TOÁN CHI TIẾT =====
  
  // Get chi tiet thanh toan of a payment
  getChiTietThanhToan: async (ma_phieu_thanh_toan) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.THANH_TOAN_CHI_TIET}/${ma_phieu_thanh_toan}`);
  },
  
  // Add chi tiet to thanh toan
  addChiTietThanhToan: async (ma_phieu_thanh_toan, data) => {
    return axiosInstance.post(`${CONG_NO_ENDPOINTS.THANH_TOAN_CHI_TIET}/${ma_phieu_thanh_toan}`, data);
  },
  
  // ===== REPORTS & STATISTICS =====
  
  // Get debt summary by warehouse
  getDebtSummary: async (ma_kho) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.BASE}/summary/${ma_kho}`);
  },
  
  // Get debt aging report
  getAgingReport: async (params) => {
    return axiosInstance.get(`${CONG_NO_ENDPOINTS.BASE}/aging-report`, { params });
  },
  
  // Get payment history between two warehouses
  getPaymentHistory: async (ma_kho_no, ma_kho_co, params) => {
    return axiosInstance.get(
      `${CONG_NO_ENDPOINTS.THANH_TOAN}/history/${ma_kho_no}/${ma_kho_co}`, 
      { params }
    );
  }
};