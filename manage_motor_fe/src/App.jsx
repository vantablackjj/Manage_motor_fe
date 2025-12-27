// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

// Configure dayjs locale
dayjs.locale("vi");

// Ant Design theme configuration
const theme = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    borderRadius: 8,
    fontSize: 14,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Button: {
      controlHeight: 36,
      borderRadius: 6,
      fontWeight: 500,
    },
    Input: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 6,
    },
    Table: {
      borderRadius: 8,
      headerBg: "#fafafa",
    },
    Card: {
      borderRadius: 8,
      boxShadow:
        "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)",
    },
    Modal: {
      borderRadius: 8,
    },
  },
};

function App() {
  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
