// src/routes/routeConfig.jsx
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
import VehicleApprovalList from "../components/pages/xe/VehicleApprovalList";
import PhuTungManage from "../components/pages/phuTung/PhuTungManage";
import KhoManage from "../components/pages/kho/KhoManage";
import KhachHangManage from "../components/pages/khachHang/KhachHangManage";
import ChuyenKhoList from "../components/pages/chuyenKho/ChuyenKhoList";
import ChuyenKhoCreate from "../components/pages/chuyenKho/ChuyenKhoCreate";
import ChuyenKhoDetail from "../components/pages/chuyenKho/ChuyenKhoDetail";
import CongNoManage from "../components/pages/congNo/CongNoManage";
import CongNoDetailView from "../components/pages/congNo/CongNoDetailView";
import AccessDenied from "../components/common/Error/AccessDenied";
import UserProfilePage from "../components/pages/user/UserProfilePage";
import NotificationPage from "../components/pages/user/NotificationPage";
import OrderRedirect from "../components/common/OrderRedirect";

// Maintenance
import MaintenanceListPage from "../components/pages/maintenance/MaintenanceListPage";
import MaintenanceFormPage from "../components/pages/maintenance/MaintenanceFormPage";
import MaintenanceDetailPage from "../components/pages/maintenance/MaintenanceDetailPage";
import MaintenanceRemindersPage from "../components/pages/maintenance/MaintenanceRemindersPage";
import WorkshopBoard from "../components/pages/maintenance/WorkshopBoard";
import PostSaleManagePage from "../components/pages/postSale/PostSaleManagePage";

// Purchase - Unified
import PurchaseOrderList from "../components/pages/purchase/PurchaseOrderList";
import VehiclePurchaseCreate from "../components/pages/purchase/vehicles/VehiclePurchaseCreate";
import VehiclePurchaseDetail from "../components/pages/purchase/vehicles/VehiclePurchaseDetail";
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
  // Dashboard - tất cả role đều xem được
  {
    path: "/",
    component: DashboardPage,
    layout: MainLayout,
  },
  {
    path: "/403",
    component: AccessDenied,
    layout: MainLayout,
  },

  // === QUẢN LÝ NHẬP HÀNG (PURCHASE) ===
  {
    path: "/purchase",
    component: PurchaseOrderList,
    layout: MainLayout,
    permissions: "purchase_orders.view",
  },
  // Sub-routes for creation and details remain specific
  {
    path: "/purchase/vehicles/create",
    component: VehiclePurchaseCreate,
    layout: MainLayout,
    permissions: "purchase_orders.create",
  },
  {
    path: "/purchase/vehicles/:ma_phieu",
    component: VehiclePurchaseDetail,
    layout: MainLayout,
    permissions: "purchase_orders.view",
  },
  {
    path: "/purchase/parts/create",
    component: PartPurchaseCreate,
    layout: MainLayout,
    permissions: "purchase_orders.create",
  },
  {
    path: "/purchase/parts/:id",
    component: PartPurchaseDetail,
    layout: MainLayout,
    permissions: "purchase_orders.view",
  },

  // Legacy fallback
  {
    path: "/purchase/vehicles",
    component: PurchaseOrderList,
    layout: MainLayout,
    permissions: "purchase_orders.view",
  },
  {
    path: "/purchase/parts",
    component: PurchaseOrderList,
    layout: MainLayout,
    permissions: "purchase_orders.view",
  },

  // === QUẢN LÝ BÁN HÀNG (SALES) ===
  {
    path: "/sales/orders",
    component: SalesOrderList,
    layout: MainLayout,
    permissions: "sales_orders.view",
  },
  {
    path: "/sales/orders/create",
    component: SalesOrderCreate,
    layout: MainLayout,
    permissions: "sales_orders.create",
  },
  {
    path: "/sales/orders/:id",
    component: SalesOrderDetail,
    layout: MainLayout,
    permissions: "sales_orders.view",
  },
  {
    path: "/sales/invoices",
    component: HoaDonBanListPage,
    layout: MainLayout,
    permissions: "invoices.view",
  },
  {
    path: "/sales/invoices/:so_hd",
    component: HoaDonBanDetail,
    layout: MainLayout,
    permissions: "invoices.view",
  },

  // === QUẢN LÝ THU CHI (FINANCE) ===
  {
    path: "/thu-chi",
    component: ThuChiList,
    layout: MainLayout,
    permissions: "payments.view",
  },
  {
    path: "/thu-chi/create",
    component: ThuChiCreate,
    layout: MainLayout,
    permissions: "payments.create",
  },
  {
    path: "/thu-chi/:so_phieu",
    component: ThuChiDetail,
    layout: MainLayout,
    permissions: "payments.view",
  },

  // Quản lý xe (inventory)
  {
    path: "/xe/danh-sach",
    component: XeListPage,
    layout: MainLayout,
    permissions: "inventory.view",
  },
  {
    path: "/xe/lich-su",
    component: XeLichSu,
    layout: MainLayout,
    permissions: "inventory.view",
  },

  // Quản lý phụ tùng
  {
    path: "/phu-tung/danh-sach",
    component: PhuTungManage,
    layout: MainLayout,
    permissions: "products.view",
  },

  // Danh mục xe - Loại xe
  {
    path: "/danh-muc/loai-xe",
    component: XeLoai,
    layout: MainLayout,
    permissions: "products.view",
  },

  // Master data
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
    path: "/danh-muc/nhom-phu-tung",
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
    permissions: "warehouses.view",
  },
  {
    path: "/danh-muc/khach-hang",
    component: KhachHangManage,
    layout: MainLayout,
    permissions: "partners.view",
  },
  {
    path: "/danh-muc/nha-cung-cap",
    component: KhachHangManage,
    layout: MainLayout,
    permissions: "partners.view",
  },
  {
    path: "/danh-muc/doi-tac",
    component: KhachHangManage,
    layout: MainLayout,
    permissions: "partners.view",
  },
  {
    path: "/danh-muc/ca-hai",
    component: KhachHangManage,
    layout: MainLayout,
    permissions: "partners.view",
  },

  // Chuyển kho
  {
    path: "/chuyen-kho",
    component: ChuyenKhoList,
    layout: MainLayout,
    permissions: "inventory.view",
  },
  {
    path: "/chuyen-kho/tao-moi",
    component: ChuyenKhoCreate,
    layout: MainLayout,
    permissions: "inventory.transfer",
  },
  {
    path: "/chuyen-kho/:ma_phieu",
    component: ChuyenKhoDetail,
    layout: MainLayout,
    permissions: "inventory.view",
  },

  {
    path: "/maintenance",
    component: WorkshopBoard,
    layout: MainLayout,
    permissions: "maintenance.view",
  },
  {
    path: "/maintenance/list",
    component: MaintenanceListPage,
    layout: MainLayout,
    permissions: "maintenance.view",
  },
  {
    path: "/maintenance/create",
    component: MaintenanceFormPage,
    layout: MainLayout,
    permissions: "maintenance.create",
  },
  {
    path: "/maintenance/reminders",
    component: MaintenanceRemindersPage,
    layout: MainLayout,
    permissions: "maintenance.view", // Re-use maintenance view permissions
  },
  {
    path: "/maintenance/:id",
    component: MaintenanceDetailPage,
    layout: MainLayout,
    permissions: "maintenance.view",
  },

  // Công nợ
  {
    path: "/cong-no/quan-ly",
    component: CongNoManage,
    layout: MainLayout,
    permissions: "debt.view",
  },
  {
    path: "/cong-no/chi-tiet/:ma_kho_no/:ma_kho_co",
    component: CongNoDetailView,
    layout: MainLayout,
    permissions: "debt.view",
  },

  // === BÁO CÁO (REPORTS) ===
  {
    path: "/bao-cao/dashboard",
    component: DashboardReportPage,
    layout: MainLayout,
    permissions: "reports.view",
  },
  {
    path: "/bao-cao/ton-kho",
    component: InventoryReportPage,
    layout: MainLayout,
    permissions: "reports.view",
  },
  {
    path: "/bao-cao/doanh-thu",
    component: SalesReportPage,
    layout: MainLayout,
    permissions: "reports.view",
  },
  {
    path: "/bao-cao/nhap-xuat",
    component: LogisticsReportPage,
    layout: MainLayout,
    permissions: "reports.view",
  },
  {
    path: "/bao-cao/thu-chi",
    component: FinancialReportPage,
    layout: MainLayout,
    permissions: "reports.view_financial",
  },
  {
    path: "/bao-cao/cong-no",
    component: FinancialReportPage,
    layout: MainLayout,
    permissions: "reports.view_financial",
  },

  // Hệ thống
  {
    path: "/he-thong/nguoi-dung",
    component: UserListPage,
    layout: MainLayout,
    permissions: "users.view",
  },

  // Legacy routes
  {
    path: "/xe/thuc-te",
    component: XeListPage,
    layout: MainLayout,
    permissions: "inventory.view",
  },
  {
    path: "/phu-tung/danh-muc",
    component: PhuTungManage,
    layout: MainLayout,
    permissions: "products.view",
  },
  {
    path: "/xe/model-car",
    component: XeLoai,
    layout: MainLayout,
    permissions: "products.view",
  },
  {
    path: "/user",
    component: UserListPage,
    layout: MainLayout,
    permissions: "users.view",
  },
  {
    path: "/profile",
    component: UserProfilePage,
    layout: MainLayout,
  },
  {
    path: "/notifications",
    component: NotificationPage,
    layout: MainLayout,
  },
  {
    path: "/don-hang",
    component: DonHang,
    layout: MainLayout,
    permissions: "sales_orders.view",
  },
  {
    path: "/orders/view/:id",
    component: OrderRedirect,
    layout: MainLayout,
  },
  {
    path: "/post-sale",
    component: PostSaleManagePage,
    layout: MainLayout,
    permissions: "sales_orders.view",
  },
];
