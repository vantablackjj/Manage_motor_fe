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
  getWorkshopBoard: () => {
    return axiosInstance.get("/maintenance/ban-nang/list");
  },

  // Cập nhật trạng thái phiếu (Tiếp nhận -> Đang sửa -> Thanh toán -> Hoàn thành)
  updateStatus: (id, payload) => {
    return axiosInstance.put(`/maintenance/${id}/status`, payload);
  },
};

export default maintenanceApi;
