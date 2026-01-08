// src/utils/constant.js

export const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL || "https://motor-manage.onrender.com";

// Vai trò người dùng
export const USER_ROLES = {
  ADMIN: "ADMIN",
  QUAN_LY_CTY: "QUAN_LY_CTY",
  QUAN_LY_CHI_NHANH: "QUAN_LY_CHI_NHANH",
  NHAN_VIEN: "NHAN_VIEN",
};

export const USER_ROLE_LABELS = {
  ADMIN: "Quản trị viên",
  QUAN_LY_CTY: "Giám đốc công ty",
  QUAN_LY_CHI_NHANH: "Trưởng chi nhánh",
  NHAN_VIEN: "Nhân viên",
};

// Trạng thái giao dịch
export const TRANG_THAI = {
  NHAP: "NHAP",
  GUI_DUYET: "GUI_DUYET",
  DA_DUYET: "DA_DUYET",
  TU_CHOI: "TU_CHOI",
  DA_HUY: "DA_HUY",
};

export const TRANG_THAI_LABELS = {
  NHAP: "Đang nhập",
  GUI_DUYET: "Chờ duyệt",
  DA_DUYET: "Đã duyệt",
  TU_CHOI: "Từ chối",
  DA_HUY: "Đã hủy",
};

export const TRANG_THAI_COLORS = {
  NHAP: "default",
  GUI_DUYET: "warning",
  DA_DUYET: "success",
  TU_CHOI: "error",
  DA_HUY: "default",
};

// Trạng thái xe
export const XE_TRANG_THAI = {
  CHO_NHAP_KHO: "CHO_NHAP_KHO",
  TON_KHO: "TON_KHO",
  DANG_CHUYEN: "DANG_CHUYEN",
  DA_BAN: "DA_BAN",
  BAO_HANH: "BAO_HANH",
  HU_HONG: "HU_HONG",
};

export const XE_TRANG_THAI_LABELS = {
  CHO_NHAP_KHO: "Chờ nhập kho",
  TON_KHO: "Tồn kho",
  DANG_CHUYEN: "Đang chuyển",
  DA_BAN: "Đã bán",
  BAO_HANH: "Bảo hành",
  HU_HONG: "Hư hỏng",
};

export const XE_TRANG_THAI_COLORS = {
  CHO_NHAP_KHO: "default",
  TON_KHO: "success",
  DANG_CHUYEN: "processing",
  DA_BAN: "default",
  BAO_HANH: "warning",
  HU_HONG: "error",
};

// Loại giao dịch
export const LOAI_GIAO_DICH = {
  NHAP_KHO: "NHAP_KHO",
  XUAT_KHO: "XUAT_KHO",
  CHUYEN_KHO: "CHUYEN_KHO",
  BAN_HANG: "BAN_HANG",
  TRA_HANG: "TRA_HANG",
  KIEM_KE: "KIEM_KE",
};

export const LOAI_GIAO_DICH_LABELS = {
  NHAP_KHO: "Nhập kho",
  XUAT_KHO: "Xuất kho",
  CHUYEN_KHO: "Chuyển kho",
  BAN_HANG: "Bán hàng",
  TRA_HANG: "Trả hàng",
  KIEM_KE: "Kiểm kê",
};

// Loại phiếu xuất
export const LOAI_PHIEU_XUAT = {
  XUAT_BAN: "XUAT_BAN",
  XUAT_CHUYEN_KHO: "XUAT_CHUYEN_KHO",
  XUAT_HUY: "XUAT_HUY",
  XUAT_KHAC: "XUAT_KHAC",
};

// Loại phiếu nhập
export const LOAI_PHIEU_NHAP = {
  NHAP_MUA: "NHAP_MUA",
  NHAP_CHUYEN_KHO: "NHAP_CHUYEN_KHO",
  NHAP_TRA_HANG: "NHAP_TRA_HANG",
  NHAP_KHAC: "NHAP_KHAC",
};

// Loại thu chi
export const LOAI_THU_CHI = {
  THU: "THU",
  CHI: "CHI",
};

export const LOAI_THU_CHI_LABELS = {
  THU: "Phiếu thu",
  CHI: "Phiếu chi",
};

// Hình thức thanh toán
export const HINH_THUC_THANH_TOAN = {
  TIEN_MAT: "TIEN_MAT",
  CHUYEN_KHOAN: "CHUYEN_KHOAN",
  THE: "THE",
};

export const HINH_THUC_THANH_TOAN_LABELS = {
  TIEN_MAT: "Tiền mặt",
  CHUYEN_KHOAN: "Chuyển khoản",
  THE: "Thẻ",
};

// Loại hàng
export const LOAI_HANG = {
  XE: "XE",
  PHU_TUNG: "PHU_TUNG",
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date format
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATETIME_FORMAT = "DD/MM/YYYY HH:mm:ss";
export const API_DATE_FORMAT = "YYYY-MM-DD";

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_INFO: "user_info",
  CURRENT_KHO: "current_kho",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth

  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH_TOKEN: "/auth/refresh",

  //
  PHU_TUNG_KHOA_BY_KHO: (ma_kho) => `/phu-tung-khoa/${ma_kho}`,
  PHU_TUNG_KHOA_BY_PT: (ma_pt) => `/phu-tung-khoa/${ma_pt}/khoa`,
  // Kho
  KHO: "/kho",
  KHO_DETAIL: (ma_kho) => `/kho/${ma_kho}`,

  // Xe
  XE: "/xe",
  XE_TON_KHO: (ma_kho) => `/xe/kho/${ma_kho}`,
  XE_DETAIL: (xe_key) => `/xe/${xe_key}`,
  XE_LICH_SU: (xe_key) => `/xe/${xe_key}/lich-su`,
  XE_KHOA: (xe_key) => `/xe/${xe_key}/lock`,
  XE_MO_KHOA: (xe_key) => `/xe/${xe_key}/unlock`,
  XE_KHOA_PHIEU: (xe_key) => `/xe/${xe_key}/khoa-phieu`,
  // Phụ tùng
  PHU_TUNG: "/phu-tung",
  PHU_TUNG_TON_KHO: (ma_kho) => `/phu-tung/ton-kho/${ma_kho}`,
  PHU_TUNG_DETAIL: (ma_pt) => `/phu-tung/${ma_pt}`,
  PHU_TUNG_LICH_SU: (ma_pt) => `/phu-tung/${ma_pt}/lich-su`,

  // Tồn kho
  TON_KHO: "/ton-kho",
  TON_KHO_KHO: (ma_kho) => `/ton-kho/${ma_kho}`,
  TON_KHO_INCREASE: "/ton-kho/increase",
  TON_KHO_DECREASE: "/ton-kho/decrease",

  // Đơn hàng mua
  DON_HANG_MUA: "/don-hang-mua",
  DON_HANG_MUA_DETAIL: (ma_phieu) => `/don-hang-mua/${ma_phieu}`,
  DON_HANG_MUA_CHI_TIET: (ma_phieu) => `/don-hang-mua/${ma_phieu}/chi-tiet`,
  DON_HANG_MUA_GUI_DUYET: (ma_phieu) => `/don-hang-mua/${ma_phieu}/gui-duyet`,
  DON_HANG_MUA_PHE_DUYET: (ma_phieu) => `/don-hang-mua/${ma_phieu}/phe-duyet`,
  DON_HANG_MUA_HUY: (ma_phieu) => `/don-hang-mua/${ma_phieu}/huy-duyet`,

  // Hóa đơn bán
  HOA_DON_BAN: "/hoa-don-ban",
  HOA_DON_BAN_DETAIL: (ma_phieu) => `/hoa-don-ban/${ma_phieu}`,
  HOA_DON_BAN_GUI_DUYET: (ma_phieu) => `/hoa-don-ban/${ma_phieu}/gui-duyet`,
  HOA_DON_BAN_PHE_DUYET: (ma_phieu) => `/hoa-don-ban/${ma_phieu}/phe-duyet`,
  HOA_DON_BAN_HUY: (ma_phieu) => `/hoa-don-ban/${ma_phieu}/huy-duyet`,

  // Chuyển kho
  CHUYEN_KHO: "/chuyen-kho",
  CHUYEN_KHO_DETAIL: (ma_phieu) => `/chuyen-kho/${ma_phieu}`,
  CHUYEN_KHO_THEM_XE: (ma_phieu) => `/chuyen-kho/${ma_phieu}/xe`,
  CHUYEN_KHO_THEM_PT: (ma_phieu) => `/chuyen-kho/${ma_phieu}/phu-tung`,
  CHUYEN_KHO_GUI_DUYET: (ma_phieu) => `/chuyen-kho/${ma_phieu}/gui-duyet`,
  CHUYEN_KHO_PHE_DUYET: (ma_phieu) => `/chuyen-kho/${ma_phieu}/phe-duyet`,
  CHUYEN_KHO_HUY: (so_phieu) => `/chuyen-kho/${so_phieu}/huy`,

  // Thu chi
  THU_CHI: "/thu-chi",
  THU_CHI_DETAIL: (id) => `/thu-chi/${id}`,

  // Danh mục
  BRAND: "/brand",
  COLOR: "/color",
  LOAI_HINH: "/loai-hinh",
  NOI_SX: "/noi-sx",
  MODEL_CAR: "/model-car",
  CAR_COLOR: "/car-color",
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    CREATE: "Tạo mới thành công",
    UPDATE: "Cập nhật thành công",
    DELETE: "Xóa thành công",
    LOGIN: "Đăng nhập thành công",
    LOGOUT: "Đăng xuất thành công",
    APPROVE: "Phê duyệt thành công",
    REJECT: "Từ chối thành công",
    CANCEL: "Hủy thành công",
  },
  ERROR: {
    COMMON: "Có lỗi xảy ra, vui lòng thử lại",
    NETWORK: "Lỗi kết nối mạng",
    UNAUTHORIZED: "Phiên đăng nhập hết hạn",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này",
    NOT_FOUND: "Không tìm thấy dữ liệu",
    VALIDATION: "Dữ liệu không hợp lệ",
  },
  CONFIRM: {
    DELETE: "Bạn có chắc chắn muốn xóa?",
    CANCEL: "Bạn có chắc chắn muốn hủy?",
    APPROVE: "Bạn có chắc chắn muốn phê duyệt?",
    REJECT: "Bạn có chắc chắn muốn từ chối?",
  },
};

// Permissions
export const PERMISSIONS = {
  // Xe
  XE_VIEW: "xe_view",
  XE_CREATE: "xe_create",
  XE_UPDATE: "xe_update",
  XE_DELETE: "xe_delete",

  // Phụ tùng
  PHU_TUNG_VIEW: "phu_tung_view",
  PHU_TUNG_CREATE: "phu_tung_create",
  PHU_TUNG_UPDATE: "phu_tung_update",
  PHU_TUNG_DELETE: "phu_tung_delete",

  // Đơn hàng
  DON_HANG_VIEW: "don_hang_view",
  DON_HANG_CREATE: "don_hang_create",
  DON_HANG_APPROVE: "don_hang_approve",

  // Hóa đơn
  HOA_DON_VIEW: "hoa_don_view",
  HOA_DON_CREATE: "hoa_don_create",
  HOA_DON_APPROVE: "hoa_don_approve",

  // Chuyển kho
  CHUYEN_KHO_VIEW: "chuyen_kho_view",
  CHUYEN_KHO_CREATE: "chuyen_kho_create",
  CHUYEN_KHO_APPROVE: "chuyen_kho_approve",

  // Kho
  KHO_MANAGE: "kho_manage",

  // User
  USER_MANAGE: "user_manage",
};

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 1024,
  DESKTOP: 1280,
};
