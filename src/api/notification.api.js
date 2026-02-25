// src/api/notification.api.js
import axiosInstance from "./axios.config";

const notificationApi = {
  // Lấy danh sách thông báo
  getNotifications: (params) => {
    return axiosInstance.get("/notifications", { params });
  },

  // Đánh dấu đã đọc một thông báo
  markAsRead: (id) => {
    return axiosInstance.patch(`/notifications/${id}/read`);
  },

  // Đánh dấu đã đọc tất cả
  markAllAsRead: () => {
    return axiosInstance.patch("/notifications/read-all");
  },

  // Xóa thông báo
  deleteNotification: (id) => {
    return axiosInstance.delete(`/notifications/${id}`);
  },
};

export default notificationApi;
