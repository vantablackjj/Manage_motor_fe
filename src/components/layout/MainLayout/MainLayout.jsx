// src/components/layout/MainLayout/MainLayout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Layout, Drawer, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "../Sidebar/SideBar";
import HeaderBar from "../Header/Header";

import { useAuth } from "../../../contexts/AuthContext";
import { useResponsive } from "../../../hooks/useResponsive";
import GlobalSearch from "../../common/GlobalSearch/GlobalSearch";
import PushNotificationBanner from "../../common/PushNotificationBanner/PushNotificationBanner";

import {
  DashboardOutlined,
  CarOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  SwapOutlined,
  DollarOutlined,
  TeamOutlined,
  HomeOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CustomerServiceOutlined,
  ImportOutlined,
  ExportOutlined,
  InboxOutlined,
  ShopOutlined,
  AuditOutlined,
} from "@ant-design/icons";

import "./MainLayout.css";

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, hasRole } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const { token } = theme.useToken();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K or Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchVisible((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isTablet) setCollapsed(true);
  }, [isTablet]);

  useEffect(() => {
    if (isMobile) setMobileDrawerVisible(false);
  }, [location, isMobile]);

  // Xây dựng menu items dựa trên permissions của user
  // useMemo để tránh re-build mỗi lần render
  const menuItems = useMemo(() => {
    const items = [];

    // Dashboard - tất cả role đều xem
    items.push({ key: "/", icon: <DashboardOutlined />, label: "Tổng quan" });

    // === QUẢN LÝ GIAO DỊCH (NEW CONSOLIDATED) ===
    if (
      hasPermission("purchase_orders", "view") ||
      hasPermission("sales_orders", "view") ||
      hasPermission("inventory", "view") ||
      hasPermission("products", "approve")
    ) {
      const transactionChildren = [];

      // Nhập hàng
      if (hasPermission("purchase_orders", "view")) {
        transactionChildren.push({
          key: "/purchase/vehicles",
          label: "Nhập Xe",
        });
        transactionChildren.push({
          key: "/purchase/parts",
          label: "Nhập Phụ Tùng",
        });
      }

      // Phê duyệt
      if (hasPermission("products", "approve")) {
        transactionChildren.push({
          key: "/xe/phe-duyet",
          label: "Phê duyệt xe nhập lẻ",
        });
      }

      // Bán hàng & Xuất kho
      if (hasPermission("sales_orders", "view")) {
        transactionChildren.push({
          key: "/sales/orders",
          label: "Xuất xe & Phụ tùng",
        });
      }

      // Điều phối nội bộ
      if (hasPermission("inventory", "view")) {
        transactionChildren.push({ key: "/chuyen-kho", label: "Chuyển kho" });
      }

      if (transactionChildren.length > 0) {
        items.push({
          key: "/transaction-manage",
          icon: <SwapOutlined />,
          label: "Quản lý Giao dịch",
          children: transactionChildren,
        });
      }
    }

    // === TỒN KHO (INVENTORY VISIBILITY) ===
    if (
      hasPermission("inventory", "view") ||
      hasPermission("products", "view")
    ) {
      const tonKhoChildren = [];

      if (hasPermission("inventory", "view")) {
        tonKhoChildren.push({ key: "/xe/danh-sach", label: "Tồn kho xe" });
      }

      if (hasPermission("products", "view")) {
        tonKhoChildren.push({
          key: "/phu-tung/danh-sach",
          label: "Tồn kho phụ tùng",
        });
      }

      if (hasPermission("inventory", "view")) {
        tonKhoChildren.push({ key: "/xe/lich-su", label: "Lịch sử xe" });
      }

      if (tonKhoChildren.length > 0) {
        items.push({
          key: "/inventory-visibility",
          icon: <InboxOutlined />,
          label: "Tồn kho xe & Phụ tùng",
          children: tonKhoChildren,
        });
      }
    }

    // === DỊCH VỤ & SỬA CHỮA ===
    if (
      hasPermission("maintenance", "view") ||
      hasPermission("sales_orders", "view")
    ) {
      const serviceChildren = [];

      if (hasPermission("maintenance", "view")) {
        serviceChildren.push(
          { key: "/maintenance", label: "Tiếp nhận dịch vụ" },
          { key: "/maintenance/list", label: "Danh sách phiếu" },
          { key: "/maintenance/reminders", label: "Lịch nhắc bảo dưỡng" },
        );
      }

      if (hasPermission("sales_orders", "view")) {
        serviceChildren.push({ key: "/post-sale", label: "Dịch vụ Sau bán" });
      }

      if (serviceChildren.length > 0) {
        items.push({
          key: "/maintenance-parent",
          icon: <CustomerServiceOutlined />,
          label: "Dịch vụ & Sửa chữa",
          children: serviceChildren,
        });
      }
    }

    // === TÀI CHÍNH (debt.view OR payments.view) ===
    const taiChinhChildren = [];
    if (hasPermission("payments", "view")) {
      taiChinhChildren.push({ key: "/thu-chi", label: "Quản lý Thu Chi" });
    }
    if (hasPermission("debt", "view")) {
      taiChinhChildren.push({ key: "/cong-no/quan-ly", label: "Công nợ" });
    }
    if (taiChinhChildren.length > 0) {
      items.push({
        key: "/tai-chinh",
        icon: <DollarOutlined />,
        label: "Tài chính",
        children: taiChinhChildren,
      });
    }

    // === BÁO CÁO (reports.view) ===
    if (hasPermission("reports", "view")) {
      const baoCaoChildren = [
        { key: "/bao-cao/ton-kho", label: "Báo cáo Tồn kho" },
        { key: "/bao-cao/doanh-thu", label: "Báo cáo Doanh thu" },
        { key: "/bao-cao/nhap-xuat", label: "Báo cáo Nhập xuất" },
      ];

      // Báo cáo tài chính - chỉ KE_TOAN, QUAN_LY, ADMIN
      if (hasPermission("reports", "view_financial")) {
        baoCaoChildren.push(
          { key: "/bao-cao/thu-chi", label: "Báo cáo Thu chi" },
          { key: "/bao-cao/cong-no", label: "Báo cáo Công nợ" },
        );
      }

      items.push({
        key: "/bao-cao",
        icon: <BarChartOutlined />,
        label: "Báo cáo",
        children: baoCaoChildren,
      });
    }

    // === QUẢN LÝ DANH MỤC ===
    // Hiển thị nếu có ít nhất một trong: products.view, partners.view, warehouses.view
    if (
      hasPermission("products", "view") ||
      hasPermission("partners", "view") ||
      hasPermission("warehouses", "view")
    ) {
      const danhMucChildren = [];

      if (hasPermission("products", "view")) {
        danhMucChildren.push({
          key: "/danh-muc/xe",
          label: "Danh mục xe",
          children: [
            { key: "/danh-muc/loai-xe", label: "Loại xe" },
            { key: "/danh-muc/nhan-hieu", label: "Nhãn hiệu" },
            { key: "/danh-muc/loai-hinh", label: "Loại hình" },
            { key: "/danh-muc/noi-san-xuat", label: "Nơi sản xuất" },
            { key: "/danh-muc/mau-xe", label: "Màu sắc" },
          ],
        });
        danhMucChildren.push({
          key: "/danh-muc/phu-tung",
          label: "Danh mục phụ tùng",
          children: [
            { key: "/danh-muc/nhom-phu-tung", label: "Nhóm phụ tùng" },
          ],
        });
      }

      if (hasPermission("warehouses", "view")) {
        danhMucChildren.push({ key: "/danh-muc/kho", label: "Danh mục kho" });
      }

      if (hasPermission("partners", "view")) {
        danhMucChildren.push(
          { key: "/danh-muc/khach-hang", label: "Khách hàng" },
          { key: "/danh-muc/nha-cung-cap", label: "Nhà cung cấp" },
        );
      }

      if (danhMucChildren.length > 0) {
        items.push({
          key: "/danh-muc",
          icon: <AppstoreOutlined />,
          label: "Quản lý danh mục",
          children: danhMucChildren,
        });
      }
    }

    // === QUẢN LÝ HỆ THỐNG (users.view) ===
    if (hasPermission("users", "view")) {
      const heThongChildren = [
        { key: "/he-thong/nguoi-dung", label: "Người dùng" },
      ];

      // Chỉ ADMIN mới thấy phân quyền và cài hình
      if (hasRole("ADMIN")) {
        heThongChildren.push(
          { key: "/he-thong/phan-quyen", label: "Phân quyền" },
          { key: "/he-thong/cau-hinh", label: "Cấu hình" },
        );
      }

      items.push({
        key: "/he-thong",
        icon: <SettingOutlined />,
        label: "Quản lý hệ thống",
        children: heThongChildren,
      });
    }

    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: logout,
    },
  ];

  const handleMenuClick = ({ key }) => navigate(key);

  const toggleSidebar = () => {
    if (isMobile) setMobileDrawerVisible(true);
    else setCollapsed(!collapsed);
  };

  return (
    <Layout className="main-layout">
      {!isMobile && (
        <Sidebar
          collapsed={collapsed}
          menuItems={menuItems}
          onMenuClick={handleMenuClick}
        />
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawerVisible}
          onClose={() => setMobileDrawerVisible(false)}
          styles={{ body: { padding: 0 } }}
          width={250}
        >
          <Sidebar
            collapsed={false}
            menuItems={menuItems}
            onMenuClick={handleMenuClick}
          />
        </Drawer>
      )}

      <Layout style={{ background: token.colorBgLayout }}>
        <HeaderBar
          isMobile={isMobile}
          onToggleSidebar={toggleSidebar}
          user={user}
          userMenuItems={userMenuItems}
          onOpenSearch={() => setSearchVisible(true)}
        />

        <PushNotificationBanner />
        <Content
          className="layout-content"
          style={{ background: token.colorBgLayout, padding: 0 }}
        >
          <div
            className="content-wrapper"
            style={{ background: token.colorBgLayout, padding: "16px 24px" }}
          >
            {children}
          </div>
        </Content>
      </Layout>

      <GlobalSearch
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />
    </Layout>
  );
};

export default MainLayout;
