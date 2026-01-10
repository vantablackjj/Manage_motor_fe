// src/api/report.api.js
import axiosInstance from "./axios.config";

const BAO_CAO_BASE = "/bao-cao";

export const reportAPI = {
  // ===== DASHBOARD & THỐNG KÊ TỔNG HỢP =====
  dashboard: {
    // Get dashboard overview (doanh thu, tồn kho, công nợ...)
    getOverview: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/dashboard`, {
        params,
      });
      return res.data;
    },

    // Dữ liệu biểu đồ doanh thu
    getRevenueChart: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/bieu-do/doanh-thu`, {
        params,
      });
      return res.data;
    },

    // Dữ liệu biểu đồ tồn kho
    getInventoryChart: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/bieu-do/ton-kho`, {
        params,
      });
      return res.data;
    },
  },

  // ===== BÁO CÁO TỒN KHO =====
  inventory: {
    getVehicles: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/ton-kho/xe`, {
        params,
      });
      return res.data;
    },
    getParts: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/ton-kho/phu-tung`, {
        params,
      });
      return res.data;
    },
    getSummary: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/ton-kho/tong-hop`, {
        params,
      });
      return res.data;
    },
  },

  // ===== BÁO CÁO DOANH THU =====
  sales: {
    getByMonth: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/doanh-thu/theo-thang`,
        { params }
      );
      return res.data;
    },
    getByWarehouse: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/doanh-thu/theo-kho`,
        { params }
      );
      return res.data;
    },
    getByProduct: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/doanh-thu/theo-san-pham`,
        { params }
      );
      return res.data;
    },
    getSummary: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/doanh-thu/tong-hop`,
        { params }
      );
      return res.data;
    },
  },

  // ===== BÁO CÁO NHẬP XUẤT =====
  logistics: {
    getVehicleInOutput: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/nhap-xuat/xe`, {
        params,
      });
      return res.data;
    },
    getPartInOutput: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/nhap-xuat/phu-tung`,
        { params }
      );
      return res.data;
    },
    getPartCard: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/nhap-xuat/the-kho`, {
        params,
      });
      return res.data;
    },
  },

  // ===== BÁO CÁO CHUYỂN KHO =====
  transfer: {
    getSummary: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/chuyen-kho/tong-hop`,
        { params }
      );
      return res.data;
    },
    getDetail: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/chuyen-kho/chi-tiet`,
        { params }
      );
      return res.data;
    },
  },

  // ===== BÁO CÁO CÔNG NỢ =====
  debt: {
    getInternal: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/cong-no/noi-bo`, {
        params,
      });
      return res.data;
    },
    getCustomer: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/cong-no/khach-hang`,
        { params }
      );
      return res.data;
    },
  },

  // ===== BÁO CÁO THU CHI =====
  finance: {
    getByDay: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/thu-chi/theo-ngay`, {
        params,
      });
      return res.data;
    },
    getSummary: async (params) => {
      const res = await axiosInstance.get(`${BAO_CAO_BASE}/thu-chi/tong-hop`, {
        params,
      });
      return res.data;
    },
  },

  // ===== BÁO CÁO KHÁCH HÀNG =====
  customer: {
    getTopSelling: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/khach-hang/top-mua-hang`,
        { params }
      );
      return res.data;
    },
    getHistory: async (params) => {
      const res = await axiosInstance.get(
        `${BAO_CAO_BASE}/khach-hang/lich-su-mua-hang`,
        { params }
      );
      return res.data;
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
