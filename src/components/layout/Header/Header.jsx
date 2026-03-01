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
  Switch,
  theme,
} from "antd";
import {
  MenuOutlined,
  UserOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { USER_ROLE_LABELS } from "../../../utils/constant";
import { useNotification } from "../../../contexts/NotificationContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./Header.module.css";

const { Header } = Layout;
const { Text } = Typography;

const HeaderBar = ({
  isMobile,
  onToggleSidebar,
  user,
  userMenuItems,
  onOpenSearch,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } =
    useNotification();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { token } = theme.useToken();

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const notificationContent = (
    <div style={{ width: isMobile ? "90vw" : 350, maxWidth: 350 }}>
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
            {isMobile ? "Đọc hết" : "Đánh dấu tất cả là đã đọc"}
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
                avatar={
                  <div style={{ marginTop: 4 }}>
                    {item.type === "MAINTENANCE" ||
                    item.content?.includes("bảo trì") ? (
                      <BellOutlined
                        style={{ color: "#faad14", fontSize: 20 }}
                      />
                    ) : item.type === "BIRTHDAY" ||
                      item.content?.includes("sinh nhật") ? (
                      <SunOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
                    ) : (
                      <BellOutlined
                        style={{
                          color: item.is_read ? "#8c8c8c" : "#1890ff",
                          fontSize: 20,
                        }}
                      />
                    )}
                  </div>
                }
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
                      {item.content?.replace(
                        /bởi \d+/g,
                        `bởi ${item.user_name || "Hệ thống"}`,
                      )}
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
    <Header
      className="layout-header"
      style={{
        padding: isMobile ? "0 10px" : "0 16px",
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div className="header-left">
        <MenuOutlined className="trigger" onClick={onToggleSidebar} />
      </div>

      <div className="header-right">
        <Space size={isMobile ? 4 : "large"}>
          <Tooltip title={isDarkMode ? "Chế độ sáng" : "Chế độ tối"}>
            <Switch
              checkedChildren={<MoonOutlined style={{ fontSize: 12 }} />}
              unCheckedChildren={<SunOutlined style={{ fontSize: 12 }} />}
              checked={isDarkMode}
              onChange={toggleTheme}
              size="small"
              style={{ minWidth: isMobile ? 32 : 44 }}
            />
          </Tooltip>

          <Tooltip title={isMobile ? "Tìm kiếm" : "Tìm kiếm nhanh (Ctrl + K)"}>
            <SearchOutlined
              className="header-icon"
              style={{ fontSize: isMobile ? 18 : 20, cursor: "pointer" }}
              onClick={onOpenSearch}
            />
          </Tooltip>

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
                    fontSize: isMobile ? 20 : 22,
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
            <div
              className="user-info"
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size={isMobile ? "small" : "large"}
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
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
};

export default HeaderBar;
