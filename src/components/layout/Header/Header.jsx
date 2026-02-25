// src/components/layout/Header/Header.jsx
import React from "react";
import {
  Layout,
  Dropdown,
  Avatar,
  Space,
  Badge,
  Popover,
  List,
  Typography,
  Button,
  Divider,
  Empty,
  Tooltip,
} from "antd";
import {
  MenuOutlined,
  UserOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { USER_ROLE_LABELS } from "../../../utils/constant";
import { useNotification } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./Header.module.css";

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar = ({ isMobile, onToggleSidebar, user, userMenuItems }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const notificationContent = (
    <div style={{ width: isMobile ? 300 : 350 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 16px",
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Thông báo
        </Typography.Title>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Đánh dấu tất cả là đã đọc
          </Button>
        )}
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        <List
          loading={loading}
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: item.is_read ? "transparent" : "#f0f7ff",
                transition: "background-color 0.3s",
              }}
              className="notification-item"
            >
              <List.Item.Meta
                title={
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Text strong={!item.is_read}>{item.title}</Text>
                    {!item.is_read && <Badge status="processing" />}
                  </Space>
                }
                description={
                  <div>
                    <div
                      style={{
                        color: "#595959",
                        fontSize: 13,
                        marginBottom: 4,
                      }}
                    >
                      {item.content}
                    </div>
                    <Space style={{ fontSize: 12, color: "#8c8c8c" }}>
                      <ClockCircleOutlined />
                      {dayjs(item.created_at).fromNow()}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: (
              <Empty
                description="Không có thông báo nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </div>
      <Divider style={{ margin: "4px 0" }} />
      <div style={{ padding: "8px", textAlign: "center" }}>
        <Button type="text" block onClick={() => navigate("/notifications")}>
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Header className="layout-header">
      <div className="header-left">
        <MenuOutlined className="trigger" onClick={onToggleSidebar} />
      </div>

      <div className="header-right">
        <Space size={isMobile ? "middle" : "large"}>
          <Popover
            content={notificationContent}
            trigger="click"
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            overlayClassName="notification-popover"
          >
            <Tooltip title={`${unreadCount} thông báo chưa đọc`}>
              <Badge
                count={unreadCount}
                size="small"
                offset={[-2, 4]}
                showZero={false}
                overflowCount={99}
              >
                <BellOutlined
                  className="header-icon"
                  style={{
                    fontSize: 22,
                    cursor: "pointer",
                    color: unreadCount > 0 ? "#1890ff" : "inherit",
                  }}
                />
              </Badge>
            </Tooltip>
          </Popover>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <Space className="user-info" style={{ cursor: "pointer" }}>
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
