// src/sw-custom.js
// Custom Service Worker được inject bởi vite-plugin-pwa
// File này chứa logic xử lý Push Notification và Offline

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Precache tất cả assets được generate bởi Vite
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// ===== CACHE STRATEGIES ===== //

// HTML pages: Network first với fallback
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  }),
);

// API: Network first với 10s timeout
registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 }),
    ],
  }),
);

// Static assets: Cache first
registerRoute(
  ({ request }) =>
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

// ===== PUSH NOTIFICATION HANDLER ===== //

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Thông báo mới", body: event.data.text() };
  }

  const {
    title = "Motor Manage",
    body = "Bạn có thông báo mới",
    icon = "/icon-192.png",
    badge = "/icon-192.png",
    tag = "motor-notification",
    url = "/",
    type,
    requireInteraction = false,
  } = data;

  // Các loại thông báo quan trọng cần interaction
  const importantTypes = ["DON_CAN_DUYET", "TON_KHO_THAP", "HOA_DON_QUA_HAN"];
  const needsInteraction = requireInteraction || importantTypes.includes(type);

  const notificationOptions = {
    body,
    icon,
    badge,
    tag,
    vibrate: [100, 50, 100, 50, 100],
    requireInteraction: needsInteraction,
    data: { url, type },
    actions: getActionsForType(type),
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions),
  );
});

// Xác định action buttons theo loại thông báo
function getActionsForType(type) {
  switch (type) {
    case "DON_CAN_DUYET":
      return [
        { action: "view", title: "👁️ Xem ngay" },
        { action: "dismiss", title: "❌ Bỏ qua" },
      ];
    case "TON_KHO_THAP":
      return [{ action: "view", title: "📦 Xem tồn kho" }];
    default:
      return [{ action: "view", title: "Xem chi tiết" }];
  }
}

// Handle click trên notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { action } = event;
  const { url } = event.notification.data || {};

  if (action === "dismiss") return;

  const targetUrl = url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Nếu app đang mở, focus vào window đó
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // Nếu không có window nào, mở tab mới
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

// Handle background sync (gửi lại request khi có mạng)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-actions") {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  // Đọc các action pending từ IndexedDB và retry
  console.log("[SW] Syncing pending actions...");
}

// Nhận message từ app
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
