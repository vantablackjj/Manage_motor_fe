// src/api/index.js
// Export tất cả API services để dễ dàng import

export { authAPI } from "./auth.config";
export { khoAPI } from "./kho.api";
export { xeAPI } from "./xe.api";
export { phuTungAPI } from "./phuTung.api";
export { tonKhoAPI } from "./tonKho.api";
export { donHangAPI } from "./donHang.api";
export { hoaDonAPI } from "./hoaDon.api";
export { chuyenKhoAPI } from "./chuyenKho.api";
export { thuChiAPI } from "./thuChi.api";
export { khachHangAPI } from "./khachHang.api";
export { congNoAPI } from "./congNo.api";
export { danhMucAPI } from "./danhMuc.api";
export { userAPI } from "./user.api";
export { reportAPI } from "./report.api";
export { masterDataApi } from "./masterData.api";
export { phuTungKhoaAPI } from "./phuTungKhoa.api";
export { donHangMuaXeAPI } from "./donHangMuaXe.api";
export { hoaDonBanAPI } from "./hoaDonBan.api";
export { importApi } from "./import.api";
export { exportApi } from "./export.api";
// Re-export axios instance nếu cần
export { default as axiosInstance } from "./axios.config";
