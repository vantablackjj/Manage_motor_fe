// src/api/postSale.api.js
import axiosInstance from "./axios.config";

export const postSaleAPI = {
  // Lấy danh sách xe đã bán & dịch vụ sau bán
  getList: (params) => {
    return axiosInstance.get("/dich-vu-sau-ban", { params });
  },

  // Lấy số liệu thống kê tổng hợp
  getStats: () => {
    return axiosInstance.get("/dich-vu-sau-ban/stats");
  },

  // Cập nhật thông tin đăng ký biển số
  updateRegistration: (xe_key, data) => {
    // data: { bien_so, ngay_tra_bien }
    return axiosInstance.patch(`/dich-vu-sau-ban/${xe_key}/dang-ky`, data);
  },

  // Cập nhật thông tin đăng kiểm
  updateInspection: (xe_key, data) => {
    // data: { ngay_tra_giay_dang_kiem }
    return axiosInstance.patch(`/dich-vu-sau-ban/${xe_key}/dang-kiem`, data);
  },
};
