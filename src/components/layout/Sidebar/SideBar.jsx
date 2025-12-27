// src/components/layout/MainLayout/Sidebar.jsx
import React from "react";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = ({ collapsed, isMobile, menuItems, onMenuClick }) => {
  const location = useLocation();

  const renderSidebarContent = () => (
    <>
      <div className="sidebar-logo">
        {!collapsed ? (
          <h2 className="logo-text">Motor MS</h2>
        ) : (
          <h2 className="logo-text-collapsed">M</h2>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["/xe", "/phu-tung"]}
        items={menuItems}
        onClick={onMenuClick}
        className="sidebar-menu"
      />
    </>
  );

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      className="layout-sider"
    >
      {renderSidebarContent()}
    </Sider>
  );
};

export default Sidebar;
