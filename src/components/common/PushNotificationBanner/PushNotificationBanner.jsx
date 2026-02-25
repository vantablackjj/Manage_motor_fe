// src/components/common/PushNotificationBanner/PushNotificationBanner.jsx
// Banner nhắc người dùng bật Push Notification
import React, { useState, useEffect } from "react";
import { Alert, Button, Space } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { pushNotificationService } from "../../../services/pushNotification.service";
import { useAuth } from "../../../contexts/AuthContext";

const DISMISSED_KEY = "push_banner_dismissed";

const PushNotificationBanner = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!pushNotificationService.isSupported()) return;
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    const state = pushNotificationService.getPermissionState();
    if (state === "default") {
      // Chưa hỏi quyền — hiện banner sau 3 giây
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const subscription = await pushNotificationService.subscribe();
      if (subscription) {
        const token = localStorage.getItem("access_token");
        await pushNotificationService.sendSubscriptionToServer(
          subscription,
          token,
        );

        // Test: hiện thông báo chào mừng
        await pushNotificationService.showLocalNotification("Motor Manage 🔔", {
          body: "Push Notification đã được bật! Bạn sẽ nhận được thông báo về đơn hàng và tồn kho.",
          tag: "welcome-push",
        });
      }
    } finally {
      setLoading(false);
      setVisible(false);
      localStorage.setItem(DISMISSED_KEY, "true");
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "true");
  };

  if (!visible) return null;

  return (
    <Alert
      message={
        <Space>
          <BellOutlined style={{ color: "#1677ff" }} />
          <span>
            <strong>Bật thông báo Push</strong> để nhận cảnh báo đơn hàng cần
            duyệt và tồn kho thấp ngay trên điện thoại/màn hình máy tính
          </span>
        </Space>
      }
      type="info"
      style={{
        margin: "0 16px 12px",
        borderRadius: 8,
        border: "1px solid #91caff",
      }}
      action={
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<BellOutlined />}
            loading={loading}
            onClick={handleEnable}
          >
            Bật thông báo
          </Button>
          <Button size="small" icon={<CloseOutlined />} onClick={handleDismiss}>
            Để sau
          </Button>
        </Space>
      }
      closable={false}
    />
  );
};

export default PushNotificationBanner;
