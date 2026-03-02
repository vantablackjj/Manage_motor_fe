import React from "react";
import { Layout, Menu } from "antd";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../../contexts/ThemeContext";

const { Sider } = Layout;

const Sidebar = ({ collapsed, isMobile, menuItems, onMenuClick }) => {
  const location = useLocation();

  const renderSidebarContent = () => (
    <>
      <div
        className="sidebar-logo"
        style={{
          background: "#001529",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        {!collapsed ? (
          <h2
            className="logo-text"
            style={{ color: "white", fontSize: 22, fontWeight: 800, margin: 0 }}
          >
            MOTOR<span style={{ color: "#ff7a45" }}> MS</span>
          </h2>
        ) : (
          <h2
            className="logo-text-collapsed"
            style={{ color: "#ff7a45", fontSize: 26, margin: 0 }}
          >
            M
          </h2>
        )}

        {isMobile && (
          <div
            onClick={() => onMenuClick({ key: "close-drawer" })}
            style={{
              color: "rgba(255,255,255,0.45)",
              cursor: "pointer",
              fontSize: 20,
            }}
          >
            ×
          </div>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={["/transaction-manage", "/inventory-visibility"]}
        items={menuItems}
        onClick={onMenuClick}
        style={{ background: "#001529" }}
        className="sidebar-menu"
      />
    </>
  );

  if (isMobile) {
    return (
      <div
        className="mobile-sidebar"
        style={{
          background: "#001529",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRight: "none",
          outline: "none",
        }}
      >
        {renderSidebarContent()}
      </div>
    );
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={250}
      collapsedWidth={80}
      className="layout-sider"
      theme="dark"
      style={{
        background: "#001529",
        borderRight: "none",
      }}
    >
      {renderSidebarContent()}
    </Sider>
  );
};

export default Sidebar;
