// src/routes/routes.config.js
import LoginPage from "../components/pages/auth/LoginPage";
import DashboardPage from "../components/pages/DashboardPage/DashboardPage";
import XeListPage from "../components/pages/xe/XeThucTe";
import UserListPage from "../components/pages/user/UserManagePage";
import DonHang from "../components/pages/donHang/DonHangListPage";
import MasterDataPage from "../components/pages/masterData/MasterPage";
import MainLayout from "../components/layout/MainLayout/MainLayout";
import XeLoai from "../components/pages/xe/XeLoai";
import XeLichSu from "../components/pages/xe/XeLichSu";
import PhuTungManagement from "../components/pages/phuTung/PhuTungManage";
export const publicRoutes = [
  {
    path: "/login",
    component: LoginPage,
    layout: null,
  },
];

export const privateRoutes = [
  {
    path: "phu-tung/danh-muc",
    component: PhuTungManagement,
    layout: MainLayout,
  },
  {
    path: "/master-data/:type",
    component: MasterDataPage,
    layout: MainLayout,
  },
  {
    path: "/xe/model-car",
    component: XeLoai,
    layout: MainLayout,
  },
  {
    path: "/xe/lich-su",
    component: XeLichSu,
    layout: MainLayout,
  },
  {
    path: "/",
    component: DashboardPage,
    layout: MainLayout,
  },
  {
    path: "/xe/thuc-te",
    component: XeListPage,
    layout: MainLayout,
  },
  {
    path: "/don-hang",
    component: DonHang,
    layout: MainLayout,
  },
  {
    path: "/user",
    component: UserListPage,
    layout: MainLayout,
    role: ["ADMIN"], // rất quan trọng cho sau này
  },
];
