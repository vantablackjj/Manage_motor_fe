import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Motor Manage - Quản lý Xe & Phụ tùng",
        short_name: "Motor MS",
        description:
          "Hệ thống quản lý xe, phụ tùng, kho và bán hàng chuyên nghiệp",
        theme_color: "#001529",
        background_color: "#001529",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        lang: "vi",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "Tạo đơn bán hàng",
            short_name: "Bán hàng",
            url: "/sales/orders/create",
            icons: [{ src: "icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Danh sách xe",
            short_name: "Xe",
            url: "/xe/danh-sach",
            icons: [{ src: "icon-192.png", sizes: "192x192" }],
          },
        ],
      },
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw-custom.js",
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
      },
      devOptions: {
        enabled: false,
        type: "module",
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://motor-manage.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
