import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Tự động hủy đăng ký Service Worker trong môi trường phát triển (DEV)
// Điều này giúp tránh xung đột với Vite HMR và các lỗi "No route found"
if (import.meta.env.DEV) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log("Service Worker unregistered in DEV mode:", registration);
      }
    });
  }
}

createRoot(document.getElementById("root")).render(<App />);
