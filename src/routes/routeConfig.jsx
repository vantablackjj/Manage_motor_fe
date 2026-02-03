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
import PhuTungManage from "../components/pages/phuTung/PhuTungManage";
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

// Sales Orders
import SalesOrderList from "../components/pages/sales/SalesOrderList";
import SalesOrderCreate from "../components/pages/sales/SalesOrderCreate";
import SalesOrderDetail from "../components/pages/sales/SalesOrderDetail";

// Hoa Don Ban (Sales Invoices)
import HoaDonBanListPage from "../components/pages/hoaDon/HoaDonBanListPage";
import HoaDonBanDetail from "../components/pages/hoaDon/HoaDonBanDetail";

// Thu Chi
import ThuChiList from "../components/pages/thuChi/ThuChiList";
import ThuChiCreate from "../components/pages/thuChi/ThuChiCreate";
import ThuChiDetail from "../components/pages/thuChi/ThuChiDetail";

// Reports
import InventoryReportPage from "../components/pages/reports/InventoryReportPage";
import SalesReportPage from "../components/pages/reports/SalesReportPage";
import LogisticsReportPage from "../components/pages/reports/LogisticsReportPage";
import FinancialReportPage from "../components/pages/reports/FinancialReportPage";
import DashboardReportPage from "../components/pages/reports/DashboardReportPage";

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

  // === QUẢN LÝ BÁN HÀNG (SALES) ===
  {
    path: "/sales/orders",
    component: SalesOrderList,
    layout: MainLayout,
  },
  {
    path: "/sales/orders/create",
    component: SalesOrderCreate,
    layout: MainLayout,
  },
  {
    path: "/sales/orders/:id",
    component: SalesOrderDetail,
    layout: MainLayout,
  },
  {
    path: "/sales/invoices",
    component: HoaDonBanListPage,
    layout: MainLayout,
  },
  {
    path: "/sales/invoices/:so_hd",
    component: HoaDonBanDetail,
    layout: MainLayout,
  },
  // ===================================

  // === QUẢN LÝ THU CHI (FINANCE) ===
  {
    path: "/thu-chi",
    component: ThuChiList,
    layout: MainLayout,
  },
  {
    path: "/thu-chi/create",
    component: ThuChiCreate,
    layout: MainLayout,
  },
  {
    path: "/thu-chi/:so_phieu",
    component: ThuChiDetail,
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
    component: PhuTungManage,
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
  {
    path: "/danh-muc/doi-tac",
    component: KhachHangManage,
    layout: MainLayout,
  },
  {
    path: "/danh-muc/ca-hai",
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

  // === BÁO CÁO (REPORTS) ===
  {
    path: "/bao-cao/dashboard",
    component: DashboardReportPage,
    layout: MainLayout,
  },
  {
    path: "/bao-cao/ton-kho",
    component: InventoryReportPage,
    layout: MainLayout,
  },
  {
    path: "/bao-cao/doanh-thu",
    component: SalesReportPage,
    layout: MainLayout,
  },
  {
    path: "/bao-cao/nhap-xuat",
    component: LogisticsReportPage,
    layout: MainLayout,
  },
  {
    path: "/bao-cao/thu-chi",
    component: FinancialReportPage,
    layout: MainLayout,
  },
  {
    path: "/bao-cao/cong-no",
    component: FinancialReportPage,
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
    component: PhuTungManage,
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
