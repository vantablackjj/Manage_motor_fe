// src/api/report.api.js
import axiosInstance from "./axios.config";

const BAO_CAO_BASE = "/bao-cao";

export const reportAPI = {
  // ===== DASHBOARD & THỐNG KÊ TỔNG HỢP =====
  dashboard: {
    // Get dashboard overview (doanh thu, tồn kho, công nợ...)
    getOverview: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/dashboard`, { params });
    },

    // Dữ liệu biểu đồ doanh thu
    getRevenueChart: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/bieu-do/doanh-thu`, { params });
    },

    // Dữ liệu biểu đồ tồn kho
    getInventoryChart: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/bieu-do/ton-kho`, { params });
    },
  },

  // ===== BÁO CÁO TỒN KHO =====
  inventory: {
    getVehicles: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/ton-kho/xe`, { params });
    },
    getParts: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/ton-kho/phu-tung`, { params });
    },
    getSummary: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/ton-kho/tong-hop`, { params });
    },
  },

  // ===== BÁO CÁO DOANH THU =====
  sales: {
    getByMonth: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/doanh-thu/theo-thang`, {
        params,
      });
    },
    getByWarehouse: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/doanh-thu/theo-kho`, {
        params,
      });
    },
    getByProduct: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/doanh-thu/theo-san-pham`, {
        params,
      });
    },
    getSummary: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/doanh-thu/tong-hop`, {
        params,
      });
    },
  },

  // ===== BÁO CÁO NHẬP XUẤT =====
  logistics: {
    getVehicleInOutput: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/nhap-xuat/xe`, { params });
    },
    getPartInOutput: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/nhap-xuat/phu-tung`, {
        params,
      });
    },
    getPartCard: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/nhap-xuat/the-kho`, { params });
    },
  },

  // ===== BÁO CÁO CHUYỂN KHO =====
  transfer: {
    getSummary: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/chuyen-kho/tong-hop`, {
        params,
      });
    },
    getDetail: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/chuyen-kho/chi-tiet`, {
        params,
      });
    },
  },

  // ===== BÁO CÁO CÔNG NỢ =====
  debt: {
    getInternal: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/cong-no/noi-bo`, { params });
    },
    getCustomer: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/cong-no/khach-hang`, {
        params,
      });
    },
  },

  // ===== BÁO CÁO THU CHI =====
  finance: {
    getByDay: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/thu-chi/theo-ngay`, { params });
    },
    getSummary: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/thu-chi/tong-hop`, { params });
    },
  },

  // ===== BÁO CÁO KHÁCH HÀNG =====
  customer: {
    getTopSelling: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/khach-hang/top-mua-hang`, {
        params,
      });
    },
    getHistory: async (params) => {
      return axiosInstance.get(`${BAO_CAO_BASE}/khach-hang/lich-su-mua-hang`, {
        params,
      });
    },
  },

  // ===== EXPORT =====
  export: {
    excel: async (data) => {
      return axiosInstance.post(`${BAO_CAO_BASE}/xuat-excel`, data, {
        responseType: "blob",
      });
    },
    pdf: async (data) => {
      return axiosInstance.post(`${BAO_CAO_BASE}/xuat-pdf`, data, {
        responseType: "blob",
      });
    },
  },
};
