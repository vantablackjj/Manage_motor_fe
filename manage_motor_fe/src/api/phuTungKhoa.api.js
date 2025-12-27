import axiosInstance from "./axios.config";
import { API_ENDPOINTS } from "../utils/constant";

export const phuTungKhoaAPI = {
  // Lấy danh sách phụ tùng đang khóa theo kho
  getAllByKho: async (ma_kho) => {
  return axiosInstance.get(API_ENDPOINTS.PHU_TUNG_KHOA_BY_KHO(ma_kho));
},


  // Lấy lịch sử khóa theo phụ tùng
  getByPhuTung: async (ma_pt, ma_kho) => {
    return axiosInstance.get(
      API_ENDPOINTS.PHU_TUNG_KHOA_BY_PT(ma_pt),
      { params: { ma_kho } }
    );
  },
};
