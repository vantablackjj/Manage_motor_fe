// src/services/pushNotification.service.js
// Web Push Notification integration

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || null;

/**
 * Chuyển base64 URL-safe string thành Uint8Array (cần cho VAPID key)
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const pushNotificationService = {
  /**
   * Kiểm tra trình duyệt có hỗ trợ Push không
   */
  isSupported() {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  },

  /**
   * Kiểm tra trạng thái quyền hiện tại
   */
  getPermissionState() {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission; // 'default' | 'granted' | 'denied'
  },

  /**
   * Yêu cầu quyền hiển thị thông báo
   * @returns {Promise<'granted'|'denied'|'default'>}
   */
  async requestPermission() {
    if (!this.isSupported()) {
      return "unsupported";
    }
    const permission = await Notification.requestPermission();
    return permission;
  },

  /**
   * Đăng ký Push subscription với Service Worker
   * @returns {Promise<PushSubscription|null>}
   */
  async subscribe() {
    if (!this.isSupported()) return null;
    if (!VAPID_PUBLIC_KEY) {
      console.warn(
        "[Push] VITE_VAPID_PUBLIC_KEY chưa được cấu hình. Push notifications sẽ không hoạt động.",
      );
      return null;
    }

    try {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.log("[Push] Người dùng từ chối quyền thông báo");
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      console.log("[Push] Đăng ký thành công:", subscription.endpoint);
      return subscription;
    } catch (err) {
      console.error("[Push] Lỗi đăng ký subscription:", err);
      return null;
    }
  },

  /**
   * Hủy đăng ký Push
   */
  async unsubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log("[Push] Đã hủy subscription");
        return true;
      }
    } catch (err) {
      console.error("[Push] Lỗi hủy subscription:", err);
    }
    return false;
  },

  /**
   * Gửi subscription lên backend để lưu trữ
   * @param {PushSubscription} subscription
   * @param {string} token - Access token
   */
  async sendSubscriptionToServer(subscription, token) {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL ||
        "https://motor-manage.onrender.com";
      const res = await fetch(`${API_BASE}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription,
          // Gửi thêm thông tin thiết bị để backend có thể phân loại
          userAgent: navigator.userAgent,
        }),
      });
      if (!res.ok) throw new Error(`Server trả về lỗi: ${res.status}`);
      console.log("[Push] Subscription đã được gửi lên server");
      return true;
    } catch (err) {
      console.error("[Push] Lỗi gửi subscription lên server:", err);
      return false;
    }
  },

  /**
   * Hiển thị thông báo cục bộ (không cần server gửi)
   * Dùng để test hoặc hiển thị offline notification
   */
  async showLocalNotification(title, options = {}) {
    if (!this.isSupported() || Notification.permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      requireInteraction: false,
      ...options,
    });
  },
};

export default pushNotificationService;
