import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Hủy đăng ký tất cả Service Worker cũ (nếu có từ phiên bản PWA trước)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

createRoot(document.getElementById("root")).render(<App />);
