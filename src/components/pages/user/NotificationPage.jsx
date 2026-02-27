// src/components/pages/user/NotificationPage.jsx
import React, { useState } from "react";
import {
  Card,
  List,
  Typography,
  Button,
  Badge,
  Tag,
  Space,
  Tooltip,
  Empty,
  Tabs,
  Skeleton,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  BellOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useNotification } from "../../../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const NotificationPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
    refresh,
  } = useNotification();
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.is_read;
    if (activeTab === "read") return item.is_read;
    return true;
  });

  const getUnreadByTab = (tab) => {
    if (tab === "unread") return unreadCount;
    return 0;
  };

  const getTypeBadge = (type) => {
    switch (type?.toUpperCase()) {
      case "APPROVAL":
        return <Tag color="blue">Phê duyệt</Tag>;
      case "INVENTORY":
        return <Tag color="orange">Kho hàng</Tag>;
      case "DEBT":
        return <Tag color="red">Công nợ</Tag>;
      case "SYSTEM":
        return <Tag color="green">Hệ thống</Tag>;
      default:
        return <Tag color="default">Thông báo</Tag>;
    }
  };

  return (
    <div
      className="page-container"
      style={{ padding: "24px", maxWidth: 1000, margin: "0 auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Space direction="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>
            Tất cả thông báo
            <Badge
              count={unreadCount}
              style={{ marginLeft: 12, backgroundColor: "#1890ff" }}
            />
          </Title>
          <Text type="secondary">
            Quản lý và cập nhật các thông báo từ hệ thống
          </Text>
        </Space>

        <Space>
          <Button
            icon={<CheckCircleOutlined />}
            disabled={unreadCount === 0}
            onClick={markAllAsRead}
          >
            Đọc tất cả
          </Button>
          <Button
            type="primary"
            icon={<ClockCircleOutlined />}
            onClick={refresh}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      <Card styles={{ body: { padding: 0 } }} className="custom-shadow-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: "0 24px" }}
          items={[
            { key: "all", label: "Tất cả" },
            { key: "unread", label: "Chưa đọc" },
            { key: "read", label: "Đã đọc" },
          ]}
        />

        <List
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Bạn không có thông báo nào trong danh sách này"
                style={{ padding: "40px 0" }}
              />
            ),
          }}
          loading={loading && notifications.length === 0}
          dataSource={filteredNotifications}
          renderItem={(item) => (
            <List.Item
              className={`clickable-item ${!item.is_read ? "unread-item" : ""}`}
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
                backgroundColor: !item.is_read ? "#f0f7ff" : "white",
                transition: "all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)",
                display: "block",
              }}
              onClick={() => handleNotificationClick(item)}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Space style={{ marginBottom: 8 }}>
                    {getTypeBadge(item.type)}
                    {!item.is_read && (
                      <Badge status="processing" color="blue" />
                    )}
                  </Space>

                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Text strong={!item.is_read} style={{ fontSize: 16 }}>
                      {item.title}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {dayjs(item.created_at).format("HH:mm DD/MM/YYYY")} (
                      {dayjs(item.created_at).fromNow()})
                    </Text>
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ marginTop: 8, color: "#595959", marginBottom: 0 }}
                  >
                    {item.content}
                  </Paragraph>

                  {item.link && (
                    <div style={{ marginTop: 12 }}>
                      <Button
                        type="link"
                        icon={<LinkOutlined />}
                        style={{ padding: 0 }}
                      >
                        Chi tiết hành động
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .unread-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background-color: #1890ff;
        }
        .clickable-item:hover {
          background-color: var(--bg-secondary, #fafafa) !important;
          transform: translateX(4px);
        }
        .custom-shadow-card {
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-radius: 12px;
          overflow: hidden;
        }
      `,
        }}
      />
    </div>
  );
};

export default NotificationPage;
