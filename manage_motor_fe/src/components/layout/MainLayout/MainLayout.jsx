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
    {
      key: "/xe",
      icon: <CarOutlined />,
      label: "Quản lý xe",
      children: [
        { key: "/xe/thuc-te", label: "Xe Thực Tế" },
        { key: "/xe/lich-su", label: "Lịch sử" },
        { key: "/xe/model-car", label: "Xe Loại" },
      ],
    },
    {
      key: "/phu-tung",
      icon: <ToolOutlined />,
      label: "Phụ tùng",
      children: [{ key: "/phu-tung/danh-muc", label: "Danh mục" }],
    },
    { key: "/don-hang", icon: <ShoppingCartOutlined />, label: "Đơn hàng mua" },
    { key: "/hoa-don", icon: <FileTextOutlined />, label: "Hóa đơn bán" },
    { key: "/chuyen-kho", icon: <SwapOutlined />, label: "Chuyển kho" },
    { key: "/thu-chi", icon: <DollarOutlined />, label: "Thu chi" },
    { key: "/khach-hang", icon: <TeamOutlined />, label: "Khách hàng" },
    { key: "/kho", icon: <HomeOutlined />, label: "Quản lý kho" },
    {
      key: "/config",
      icon: <SettingOutlined />,
      label: "Cấu hình",
      children: [
        {
          key: "/master-data/mau",
          label: "Màu",
        },
        {
          key: "/master-data/users",
          label: "Nhân Viên",
        },
        {
          key: "/master-data/noiSX",
          label: "Nơi sản xuất",
        },
        {
          key: "/master-data/khachHang",
          label: "Khách Hàng",
        },
        {
          key: "/master-data/nhanHieu",
          label: "Nhãn Hiệu Xe ",
        },
        {
          key: "/master-data/kho",
          label: "Kho",
        },
        {
          key: "/master-data/loaiHinh",
          label: "Loại hình xe",
        },
      ],
    },

    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
      children: [
        { key: "/reports/inventory", label: "Tồn kho" },
        { key: "/reports/sales", label: "Bán hàng" },
      ],
    },
  ];

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
          bodyStyle={{ padding: 0, background: "#001529" }}
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
        />

        <Content className="layout-content">
          <div className="content-wrapper">{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
