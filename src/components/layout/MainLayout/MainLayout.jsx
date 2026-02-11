// src/components/layout/MainLayout/MainLayout.jsx
import React, { useState, useEffect, lazy } from "react";
import { Layout, Drawer } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

import Sidebar from "../Sidebar/SideBar";
import HeaderBar from "../Header/Header";

import { useAuth } from "../../../contexts/AuthContext";
import { useResponsive } from "../../../hooks/useResponsive";

import authService from "../../../services/auth.service";

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
} from "@ant-design/icons";

import "./MainLayout.css";

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    if (isTablet) setCollapsed(true);
  }, [isTablet]);

  useEffect(() => {
    if (isMobile) setMobileDrawerVisible(false);
  }, [location, isMobile]);

  const menuItems = [
    { key: "/", icon: <DashboardOutlined />, label: "Dashboard" },

    // KHO VẬN
    {
      key: "/warehouse-manage",
      icon: <HomeOutlined />,
      label: "Quản lý kho",
      children: [
        { key: "/chuyen-kho", label: "Chuyển kho" },
        { key: "/danh-muc/kho", label: "Danh mục kho" },
      ],
    },

    // NHẬP KHO (PURCHASE)
    {
      key: "/purchase",
      icon: <ImportOutlined />,
      label: "Nhập Kho",
      children: [
        { key: "/purchase/vehicles", label: "Nhập Xe" },
        { key: "/purchase/parts", label: "Nhập Phụ Tùng" },
      ],
    },

    // 1. QUẢN LÝ XE
    {
      key: "/xe",
      icon: <CarOutlined />,
      label: "Quản lý xe",
      children: [
        { key: "/xe/danh-sach", label: "Danh sách xe" },
        { key: "/xe/lich-su", label: "Lịch sử xe" },
        { key: "/xe/phe-duyet", label: "Phê duyệt xe nhập lẻ" },
      ],
    },
    // XUẤT KHO (SALES)
    {
      key: "/sales",
      icon: <ExportOutlined />,
      label: "Xuất Kho",
      children: [
        { key: "/sales/orders", label: "Đơn hàng xuất" },
        { key: "/sales/invoices", label: "Hóa đơn xuất" },
      ],
    },

    // 2. QUẢN LÝ PHỤ TÙNG
    {
      key: "/phu-tung",
      icon: <ToolOutlined />,
      label: "Quản lý phụ tùng",
      children: [{ key: "/phu-tung/danh-sach", label: "Danh sách phụ tùng" }],
    },

    // 3. DỊCH VỤ
    {
      key: "/dich-vu",
      icon: <CustomerServiceOutlined />,
      label: "Dịch vụ",
      children: [
        { key: "/dich-vu/danh-sach", label: "Danh sách dịch vụ" },
        { key: "/dich-vu/phieu-sua-chua", label: "Phiếu sửa chữa" },
      ],
    },

    // 4. TÀI CHÍNH
    {
      key: "/tai-chinh",
      icon: <DollarOutlined />,
      label: "Tài chính",
      children: [
        { key: "/thu-chi", label: "Quản lý Thu Chi" },
        { key: "/cong-no/quan-ly", label: "Công nợ" },
      ],
    },
    {
      key: "/bao-cao",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
      children: [
        { key: "/bao-cao/dashboard", label: "Dashboard Báo cáo" },
        { key: "/bao-cao/ton-kho", label: "Báo cáo Tồn kho" },
        { key: "/bao-cao/doanh-thu", label: "Báo cáo Doanh thu" },
        { key: "/bao-cao/nhap-xuat", label: "Báo cáo Nhập xuất" },
        { key: "/bao-cao/thu-chi", label: "Báo cáo Thu chi" },
        { key: "/bao-cao/cong-no", label: "Báo cáo Công nợ" },
      ],
    },

    // 6. QUẢN LÝ DANH MỤC
    {
      key: "/danh-muc",
      icon: <AppstoreOutlined />,
      label: "Quản lý danh mục",
      children: [
        {
          key: "/danh-muc/xe",
          label: "Danh mục xe",
          children: [
            { key: "/danh-muc/loai-xe", label: "Loại xe" },
            { key: "/danh-muc/nhan-hieu", label: "Nhãn hiệu" },
            { key: "/danh-muc/loai-hinh", label: "Loại hình" },
            { key: "/danh-muc/noi-san-xuat", label: "Nơi sản xuất" },
            { key: "/danh-muc/mau-xe", label: "Màu sắc" },
          ],
        },
        {
          key: "/danh-muc/phu-tung",
          label: "Danh mục phụ tùng",
          children: [
            { key: "/danh-muc/nhom-phu-tung", label: "Nhóm phụ tùng" },
          ],
        },
        { key: "/danh-muc/kho", label: "Kho" },
        { key: "/danh-muc/khach-hang", label: "Khách hàng" },
        { key: "/danh-muc/nha-cung-cap", label: "Nhà cung cấp" },
      ],
    },

    // 7. QUẢN LÝ HỆ THỐNG
    {
      key: "/he-thong",
      icon: <SettingOutlined />,
      label: "Quản lý hệ thống",
      roles: ["ADMIN"],
      children: [
        { key: "/he-thong/nguoi-dung", label: "Người dùng" },
        { key: "/he-thong/phan-quyen", label: "Phân quyền" },
        { key: "/he-thong/cau-hinh", label: "Cấu hình" },
      ],
    },
  ];

  // Lọc menu theo vai trò
  const filteredMenuItems = menuItems
    .filter((item) => !item.roles || authService.hasRole(item.roles))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(
            (child) => !child.roles || authService.hasRole(child.roles),
          ),
        };
      }
      return item;
    });

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
          menuItems={filteredMenuItems}
          onMenuClick={handleMenuClick}
        />
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={mobileDrawerVisible}
          onClose={() => setMobileDrawerVisible(false)}
          bodyStyle={{ padding: 0, background: "#001529" }}
          width={250}
        >
          <Sidebar
            collapsed={false}
            menuItems={filteredMenuItems}
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
        />

        <Content className="layout-content">
          <div className="content-wrapper">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
