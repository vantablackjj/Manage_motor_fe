// src/api/report.api.js
// API cho các báo cáo và thống kê
import axiosInstance from './axios.config';

const REPORT_ENDPOINTS = {
  BASE: '/reports',
  INVENTORY: '/reports/inventory',
  SALES: '/reports/sales',
  PURCHASE: '/reports/purchase',
  TRANSFER: '/reports/transfer',
  FINANCIAL: '/reports/financial'
};

export const reportAPI = {
  // ===== INVENTORY REPORTS (BÁO CÁO TỒN KHO) =====
  inventory: {
    // Báo cáo tồn kho tổng hợp
    getSummary: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.INVENTORY}/summary`, { params });
    },
    
    // Báo cáo tồn kho theo kho
    getByWarehouse: async (ma_kho, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.INVENTORY}/warehouse/${ma_kho}`, { params });
    },
    
    // Báo cáo tồn kho xe
    getVehicleStock: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.INVENTORY}/vehicles`, { params });
    },
    
    // Báo cáo tồn kho phụ tùng
    getPartsStock: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.INVENTORY}/parts`, { params });
    },
    
    // Báo cáo hàng tồn kho lâu
    getSlowMoving: async (days, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.INVENTORY}/slow-moving/${days}`, { params });
    },
    
    // Báo cáo cảnh báo tồn kho
    getStockAlert: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.INVENTORY}/alerts`, { params });
    }
  },

  // ===== SALES REPORTS (BÁO CÁO BÁN HÀNG) =====
  sales: {
    // Báo cáo doanh thu
    getRevenue: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/revenue`, { params });
    },
    
    // Báo cáo bán hàng theo thời gian
    getByPeriod: async (startDate, endDate, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/period`, {
        params: { startDate, endDate, ...params }
      });
    },
    
    // Báo cáo bán hàng theo kho
    getByWarehouse: async (ma_kho, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/warehouse/${ma_kho}`, { params });
    },
    
    // Báo cáo bán hàng theo sản phẩm
    getByProduct: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/products`, { params });
    },
    
    // Báo cáo bán hàng theo khách hàng
    getByCustomer: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/customers`, { params });
    },
    
    // Top selling products
    getTopSelling: async (limit, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/top-selling/${limit}`, { params });
    },
    
    // Báo cáo lợi nhuận
    getProfit: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.SALES}/profit`, { params });
    }
  },

  // ===== PURCHASE REPORTS (BÁO CÁO MUA HÀNG) =====
  purchase: {
    // Báo cáo mua hàng
    getSummary: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.PURCHASE}/summary`, { params });
    },
    
    // Báo cáo mua hàng theo thời gian
    getByPeriod: async (startDate, endDate, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.PURCHASE}/period`, {
        params: { startDate, endDate, ...params }
      });
    },
    
    // Báo cáo mua hàng theo nhà cung cấp
    getBySupplier: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.PURCHASE}/suppliers`, { params });
    },
    
    // Báo cáo mua hàng theo sản phẩm
    getByProduct: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.PURCHASE}/products`, { params });
    }
  },

  // ===== TRANSFER REPORTS (BÁO CÁO CHUYỂN KHO) =====
  transfer: {
    // Báo cáo chuyển kho
    getSummary: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.TRANSFER}/summary`, { params });
    },
    
    // Báo cáo chuyển kho theo thời gian
    getByPeriod: async (startDate, endDate, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.TRANSFER}/period`, {
        params: { startDate, endDate, ...params }
      });
    },
    
    // Báo cáo chuyển kho giữa 2 kho
    getBetweenWarehouses: async (ma_kho_xuat, ma_kho_nhap, params) => {
      return axiosInstance.get(
        `${REPORT_ENDPOINTS.TRANSFER}/between/${ma_kho_xuat}/${ma_kho_nhap}`, 
        { params }
      );
    }
  },

  // ===== FINANCIAL REPORTS (BÁO CÁO TÀI CHÍNH) =====
  financial: {
    // Báo cáo thu chi
    getCashFlow: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.FINANCIAL}/cash-flow`, { params });
    },
    
    // Báo cáo công nợ
    getDebt: async (params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.FINANCIAL}/debt`, { params });
    },
    
    // Báo cáo công nợ theo kho
    getDebtByWarehouse: async (ma_kho, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.FINANCIAL}/debt/warehouse/${ma_kho}`, { params });
    },
    
    // Báo cáo dòng tiền theo thời gian
    getCashFlowByPeriod: async (startDate, endDate, params) => {
      return axiosInstance.get(`${REPORT_ENDPOINTS.FINANCIAL}/cash-flow/period`, {
        params: { startDate, endDate, ...params }
      });
    }
  },

  // ===== DASHBOARD STATISTICS =====
  dashboard: {
    // Get dashboard overview
    getOverview: async (ma_kho) => {
      return axiosInstance.get('/reports/dashboard/overview', {
        params: { ma_kho }
      });
    },
    
    // Get sales statistics
    getSalesStats: async (period, ma_kho) => {
      return axiosInstance.get('/reports/dashboard/sales-stats', {
        params: { period, ma_kho }
      });
    },
    
    // Get inventory statistics
    getInventoryStats: async (ma_kho) => {
      return axiosInstance.get('/reports/dashboard/inventory-stats', {
        params: { ma_kho }
      });
    },
    
    // Get recent activities
    getRecentActivities: async (limit, ma_kho) => {
      return axiosInstance.get('/reports/dashboard/recent-activities', {
        params: { limit, ma_kho }
      });
    }
  },

  // ===== EXPORT REPORTS =====
  export: {
    // Export to Excel
    exportExcel: async (reportType, params) => {
      return axiosInstance.get(`/reports/export/excel/${reportType}`, {
        params,
        responseType: 'blob'
      });
    },
    
    // Export to PDF
    exportPdf: async (reportType, params) => {
      return axiosInstance.get(`/reports/export/pdf/${reportType}`, {
        params,
        responseType: 'blob'
      });
    }
  }
};