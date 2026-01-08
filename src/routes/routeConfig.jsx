// src/routes/routes.config.js
import LoginPage from "../components/pages/auth/LoginPage";
import DashboardPage from "../components/pages/DashboardPage/DashboardPage";
import XeListPage from "../components/pages/xe/XeThucTe";
import UserListPage from "../components/pages/user/UserManagePage";
import DonHang from "../components/pages/donHang/DonHangListPage";
import MasterDataPage from "../components/pages/masterData/MasterPage";
import DanhMucPage from "../components/pages/danhMuc/DanhMucPage";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import XeLoai from "../components/pages/xe/XeLoai";
import XeLichSu from "../components/pages/xe/XeLichSu";
import PhuTungManagement from "../components/pages/phuTung/PhuTungManage";
import KhoManage from "../components/pages/kho/KhoManage";
import KhachHangManage from "../components/pages/khachHang/KhachHangManage";
import ChuyenKhoList from "../components/pages/chuyenKho/ChuyenKhoList";
import ChuyenKhoCreate from "../components/pages/chuyenKho/ChuyenKhoCreate";
import ChuyenKhoDetail from "../components/pages/chuyenKho/ChuyenKhoDetail";
import CongNoManage from "../components/pages/congNo/CongNoManage";
import CongNoDetailView from "../components/pages/congNo/CongNoDetailView";

// Purchase - Xe
import VehiclePurchaseList from "../components/pages/purchase/vehicles/VehiclePurchaseList";
import VehiclePurchaseCreate from "../components/pages/purchase/vehicles/VehiclePurchaseCreate";
import VehiclePurchaseDetail from "../components/pages/purchase/vehicles/VehiclePurchaseDetail";

// Purchase - Phụ Tùng
import PartPurchaseList from "../components/pages/purchase/parts/PartPurchaseList";
import PartPurchaseCreate from "../components/pages/purchase/parts/PartPurchaseCreate";
import PartPurchaseDetail from "../components/pages/purchase/parts/PartPurchaseDetail";

export const publicRoutes = [
  {
    path: "/login",
    component: LoginPage,
    layout: null,
  },
];

export const privateRoutes = [
  // Dashboard
  {
    path: "/",
    component: DashboardPage,
    layout: MainLayout,
  },

  // === QUẢN LÝ MUA HÀNG (PURCHASE) ===
  // 1. Mua Xe
  {
    path: "/purchase/vehicles",
    component: VehiclePurchaseList,
    layout: MainLayout,
  },
  {
    path: "/purchase/vehicles/create",
    component: VehiclePurchaseCreate,
    layout: MainLayout,
  },
  {
    path: "/purchase/vehicles/:ma_phieu",
    component: VehiclePurchaseDetail,
    layout: MainLayout,
  },

  // 2. Mua Phụ Tùng
  {
    path: "/purchase/parts",
    component: PartPurchaseList,
    layout: MainLayout,
  },
  {
    path: "/purchase/parts/create",
    component: PartPurchaseCreate,
    layout: MainLayout,
  },
  {
    path: "/purchase/parts/:id",
    component: PartPurchaseDetail,
    layout: MainLayout,
  },
  // ===================================

  // Quản lý xe
  {
    path: "/xe/danh-sach",
    component: XeListPage,
    layout: MainLayout,
  },
  {
    path: "/xe/lich-su",
    component: XeLichSu,
    layout: MainLayout,
  },

  // Quản lý phụ tùng
  {
    path: "/phu-tung/danh-sach",
    component: PhuTungManagement,
    layout: MainLayout,
  },

  // Danh mục xe - Loại xe (chuyển từ /xe/model-car)
  {
    path: "/danh-muc/loai-xe",
    component: XeLoai,
    layout: MainLayout,
  },

  // Master data (legacy routes - giữ để backward compatibility)
  {
    path: "/master-data/:type",
    component: MasterDataPage,
    layout: MainLayout,
  },

  // Danh mục - Routes mới
  {
    path: "/danh-muc/nhan-hieu",
    component: DanhMucPage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/loai-hinh",
    component: DanhMucPage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/noi-san-xuat",
    component: DanhMucPage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/mau-xe",
    component: DanhMucPage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/kho",
    component: KhoManage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/khach-hang",
    component: KhachHangManage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/nha-cung-cap",
    component: KhachHangManage,
    layout: MainLayout,
  },

  // Chuyển kho
  {
    path: "/chuyen-kho",
    component: ChuyenKhoList,
    layout: MainLayout,
  },
  {
    path: "/chuyen-kho/tao-moi",
    component: ChuyenKhoCreate,
    layout: MainLayout,
  },
  {
    path: "/chuyen-kho/:ma_phieu",
    component: ChuyenKhoDetail,
    layout: MainLayout,
  },

  // Công nợ
  {
    path: "/cong-no/quan-ly",
    component: CongNoManage,
    layout: MainLayout,
  },

  {
    path: "/cong-no/chi-tiet/:ma_kho_no/:ma_kho_co",
    component: CongNoDetailView,
    layout: MainLayout,
  },

  // Hệ thống
  {
    path: "/he-thong/nguoi-dung",
    component: UserListPage,
    layout: MainLayout,
    role: ["ADMIN"],
  },

  // Legacy routes (giữ để không break existing links)
  {
    path: "/xe/thuc-te",
    component: XeListPage,
    layout: MainLayout,
  },
  {
    path: "/phu-tung/danh-muc",
    component: PhuTungManagement,
    layout: MainLayout,
  },
  {
    path: "/xe/model-car",
    component: XeLoai,
    layout: MainLayout,
  },
  {
    path: "/user",
    component: UserListPage,
    layout: MainLayout,
    role: ["ADMIN"],
  },
  {
    path: "/don-hang",
    component: DonHang,
    layout: MainLayout,
  },
];
