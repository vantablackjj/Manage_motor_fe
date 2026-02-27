// src/components/layout/MainLayout/MainLayout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Layout, Drawer } from "antd";
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

    // === QUẢN LÝ XE ===
    if (hasPermission("inventory", "view") || hasPermission("purchase_orders", "view")) {
      const xeChildren = [];

      // Nhập Xe (từ Nhập Kho cũ)
      if (hasPermission("purchase_orders", "view")) {
        xeChildren.push({ key: "/purchase/vehicles", label: "Nhập Xe" });
      }

      // Danh sách xe & Lịch sử
      if (hasPermission("inventory", "view")) {
        xeChildren.push({ key: "/xe/danh-sach", label: "Danh sách xe" });
        xeChildren.push({ key: "/xe/lich-su", label: "Lịch sử xe" });
      }

      // Phê duyệt xe
      if (hasPermission("products", "approve")) {
        xeChildren.push({
          key: "/xe/phe-duyet",
          label: "Phê duyệt xe nhập lẻ",
        });
      }

      // Xuất Kho Xe (từ Xuất Kho cũ)
      if (hasPermission("sales_orders", "view")) {
        xeChildren.push({ key: "/sales/orders", label: "Đơn hàng xuất xe" });
      }

      // Quản lý kho (từ Quản lý kho cũ)
      if (hasPermission("warehouses", "view")) {
        xeChildren.push({ key: "/chuyen-kho", label: "Chuyển kho" });
        xeChildren.push({ key: "/danh-muc/kho", label: "Danh mục kho" });
      }

      if (xeChildren.length > 0) {
        items.push({
          key: "/xe-manage",
          icon: <CarOutlined />,
          label: "Quản lý xe",
          children: xeChildren,
        });
      }
    }

    // === QUẢN LÝ PHỤ TÙNG ===
    if (hasPermission("products", "view") || hasPermission("purchase_orders", "view")) {
      const ptChildren = [];

      // Nhập Phụ Tùng (từ Nhập Kho cũ)
      if (hasPermission("purchase_orders", "view")) {
        ptChildren.push({ key: "/purchase/parts", label: "Nhập Phụ Tùng" });
      }

      // Danh sách phụ tùng
      if (hasPermission("products", "view")) {
        ptChildren.push({ key: "/phu-tung/danh-sach", label: "Danh sách phụ tùng" });
      }

      // Xuất Kho Phụ Tùng (từ Xuất Kho cũ)
      // Lưu ý: hiện tại route /sales/orders dùng chung, nếu có route riêng cho PT thì add vào đây
      
      if (ptChildren.length > 0) {
        items.push({
          key: "/phu-tung-manage",
          icon: <ToolOutlined />,
          label: "Quản lý phụ tùng",
          children: ptChildren,
        });
      }
    }

    if (hasPermission("maintenance", "view")) {
      items.push({
        key: "/maintenance-parent",
        icon: <CustomerServiceOutlined />,
        label: "Dịch vụ & Sửa chữa",
        children: [
          { key: "/maintenance", label: "Điều hành bàn nâng" },
          { key: "/maintenance/list", label: "Danh sách phiếu" },
          { key: "/maintenance/reminders", label: "Lịch nhắc bảo dưỡng" },
        ],
      });
    }

    // === DỊCH VỤ SAU BÁN (sales_orders.view) ===
    if (hasPermission("sales_orders", "view")) {
      items.push({
        key: "/post-sale",
        icon: <AuditOutlined />,
        label: "Dịch vụ Sau bán",
      });
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
        { key: "/bao-cao/dashboard", label: "Dashboard Báo cáo" },
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
    // Hiển thị nếu có ít nhất một trong: products.view, partners.view
    if (
      hasPermission("products", "view") ||
      hasPermission("partners", "view")
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

      <Layout>
        <HeaderBar
          isMobile={isMobile}
          onToggleSidebar={toggleSidebar}
          user={user}
          userMenuItems={userMenuItems}
          onOpenSearch={() => setSearchVisible(true)}
        />

        <PushNotificationBanner />
        <Content className="layout-content">
          <div className="content-wrapper">{children}</div>
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
