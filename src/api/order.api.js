// src/api/order.api.js
import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const orderAPI = {
  // 1. Tạo đơn hàng (Ghi nhận ý định)
  create: async (data) => {
    return axiosInstance.post(API_ENDPOINTS.ORDERS, data);
  },

  // 2. Thực hiện giao/nhập/chuyển (Tạo Invoice/Slip thực tế)
  deliver: async (id, data) => {
    return axiosInstance.post(API_ENDPOINTS.ORDER_DELIVER(id), data);
  },

  // 3. Lấy tất cả đơn hàng (Hỗ trợ lọc theo loai_don_hang)
  getAll: async (params) => {
    return axiosInstance.get(API_ENDPOINTS.ORDERS, { params });
  },

  // 4. Lấy chi tiết đơn hàng
  getById: async (id) => {
    return axiosInstance.get(API_ENDPOINTS.ORDER_DETAIL(id));
  },

  // 5. Cập nhật đơn hàng
  update: async (id, data) => {
    return axiosInstance.put(API_ENDPOINTS.ORDER_DETAIL(id), data);
  },

  // 6. Xóa đơn hàng (Thường là soft delete qua status)
  delete: async (id) => {
    return axiosInstance.delete(API_ENDPOINTS.ORDER_DETAIL(id));
  },

  // 7. Thêm chi tiết vào đơn hàng
  addDetail: async (id, data) => {
    return axiosInstance.post(
      `${API_ENDPOINTS.ORDER_DETAIL(id)}/details`,
      data,
    );
  },

  // 8. Xóa chi tiết
  deleteDetail: async (id, stt) => {
    return axiosInstance.delete(
      `${API_ENDPOINTS.ORDER_DETAIL(id)}/details/${stt}`,
    );
  },
  // 9. Cập nhật trạng thái (Approve/Cancel)
  updateStatus: async (id, status) => {
    return axiosInstance.patch(`${API_ENDPOINTS.ORDER_DETAIL(id)}/status`, {
      status,
    });
  },
};
