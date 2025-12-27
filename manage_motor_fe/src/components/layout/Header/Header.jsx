// src/components/layout/MainLayout/HeaderBar.jsx
import React from "react";
import { Layout, Dropdown, Avatar, Space, Badge } from "antd";
import { MenuOutlined, UserOutlined, BellOutlined } from "@ant-design/icons";
import { USER_ROLE_LABELS } from "../../../utils/constant";

const { Header } = Layout;

const HeaderBar = ({ isMobile, onToggleSidebar, user, userMenuItems }) => {
  return (
    <Header className="layout-header">
      <div className="header-left">
        <MenuOutlined className="trigger" onClick={onToggleSidebar} />
      </div>

      <div className="header-right">
        <Space size={isMobile ? "middle" : "large"}>
          <Badge count={5} size="small">
            <BellOutlined className="header-icon" />
          </Badge>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Space className="user-info">
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size={isMobile ? "default" : "large"}
              />
              {!isMobile && (
                <div className="user-details">
                  <div className="user-name">
                    {user?.ho_ten || user?.username}
                  </div>
                  <div className="user-role">
                    {USER_ROLE_LABELS[user?.vai_tro] || user?.vai_tro}
                  </div>
                </div>
              )}
            </Space>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default HeaderBar;
