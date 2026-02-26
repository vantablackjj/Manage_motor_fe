// src/contexts/NotificationContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { notification, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constant";
import notificationApi from "../api/notification.api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications({ limit: 50 });
      if (res) {
        // Handle both { data: [], unreadCount: 0 } and [...] structures
        const items = Array.isArray(res) ? res : res.data || [];
        const count =
          res.unreadCount !== undefined
            ? res.unreadCount
            : items.filter((n) => !n.is_read).length;

        setNotifications(items);
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      message.error("Không thể cập nhật trạng thái thông báo");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true })),
      );
      setUnreadCount(0);
      message.success("Đã đánh dấu tất cả là đã đọc");
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (user && token) {
      fetchNotifications();

      const newSocket = io(API_BASE_URL, {
        auth: { token },
        transports: ["websocket"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to notification socket");
        newSocket.emit("join", user.id);
      });

      newSocket.on("new_notification", (data) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show browser-like notification using Ant Design
        notification.info({
          message: data.title || "Thông báo mới",
          description: data.content,
          icon: <BellOutlined style={{ color: "#1890ff" }} />,
          placement: "topRight",
          duration: 5,
          onClick: () => {
            if (data.link) {
              window.location.href = data.link;
            }
          },
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [fetchNotifications, user]);

  // === WEB PUSH NOTIFICATIONS ===
  const subscribeToPush = useCallback(async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser");
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return;
      }

      // VAPID Public Key from ENV
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("VITE_VAPID_PUBLIC_KEY is not defined in .env");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to backend
      const pushApi = (await import("../api/push.api")).default;
      await pushApi.subscribe(subscription);
      console.log("Successfully subscribed to Web Push");
    } catch (error) {
      console.error("Failed to subscribe to Web Push:", error);
    }
  }, []);

  // Utility to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  useEffect(() => {
    if (user) {
      subscribeToPush();
    }
  }, [user, subscribeToPush]);
  // ===============================

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications,
        subscribeToPush, // Export if needed manually
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
