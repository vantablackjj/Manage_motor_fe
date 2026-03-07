// src/api/maintenance.api.js
import axiosInstance from "./axios.config";

const maintenanceApi = {
  // Lấy danh sách phiếu bảo trì
  getMaintenanceList: (params) => {
    return axiosInstance.get("/maintenance", { params });
  },

  // Lấy chi tiết một phiếu bảo trì
  getMaintenanceDetail: (id) => {
    return axiosInstance.get(`/maintenance/${id}`);
  },

  // Tạo mới phiếu bảo trì
  createMaintenance: (data) => {
    return axiosInstance.post("/maintenance", data);
  },

  // Cập nhật phiếu bảo trì
  updateMaintenance: (id, data) => {
    return axiosInstance.put(`/maintenance/${id}`, data);
  },

  // Xóa phiếu bảo trì
  deleteMaintenance: (id) => {
    return axiosInstance.delete(`/maintenance/${id}`);
  },

  // Lấy lịch sử bảo trì theo xe
  getVehicleMaintenanceHistory: (ma_serial) => {
    return axiosInstance.get(`/maintenance/vehicle/${ma_serial}`);
  },

  // Lấy danh sách bàn nâng (Workshop Board)
  getWorkshopBoard: (params) => {
    return axiosInstance.get("/maintenance/ban-nang/list", { params });
  },

  // Thêm bàn nâng mới
  addBanNang: (data) => {
    return axiosInstance.post("/maintenance/ban-nang", data);
  },

  // Cập nhật bàn nâng
  updateBanNang: (id, data) => {
    return axiosInstance.put(`/maintenance/ban-nang/${id}`, data);
  },

  // Xóa bàn nâng
  deleteBanNang: (id) => {
    return axiosInstance.delete(`/maintenance/ban-nang/${id}`);
  },

  // Cập nhật trạng thái phiếu (Tiếp nhận -> Đang sửa -> Thanh toán -> Hoàn thành)
  updateStatus: (id, payload) => {
    return axiosInstance.put(`/maintenance/${id}/status`, payload);
  },

  // Lấy danh sách nhắc nhở bảo trì
  getReminders: (params) => {
    return axiosInstance.get("/maintenance/reminders", { params });
  },

  // Cập nhật trạng thái nhắc nhở bảo trì
  updateReminderStatus: (id, payload) => {
    return axiosInstance.patch(`/maintenance/reminders/${id}`, payload);
  },

  // Lấy danh sách kỹ thuật viên theo kho
  getTechnicians: (params) => {
    return axiosInstance.get("/maintenance/technicians/list", { params });
  },
};

export default maintenanceApi;
