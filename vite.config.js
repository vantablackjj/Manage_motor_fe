import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,

    allowedHosts: ["jaclyn-uncaged-ecliptically.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: "http://54.254.173.166:32000",
        changeOrigin: true,
        secure: false,
      },
      "/socket.io": {
        target: "http://54.254.173.166:32000",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
