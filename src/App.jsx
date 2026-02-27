// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntdApp, theme as antdTheme } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

// Configure dayjs locale
dayjs.extend(relativeTime);
dayjs.locale("vi");

// Shared token overrides (both modes)
const sharedToken = {
  colorPrimary: "#1677ff",
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorError: "#ff4d4f",
  colorInfo: "#1677ff",
  borderRadius: 8,
  fontSize: 14,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const sharedComponents = {
  Button: { controlHeight: 36, borderRadius: 6, fontWeight: 500 },
  Input: { controlHeight: 36, borderRadius: 6 },
  Select: { controlHeight: 36, borderRadius: 6 },
  Table: { borderRadius: 8 },
  Card: { borderRadius: 8 },
  Modal: { borderRadius: 12 },
};

// Wrapper that reads ThemeContext and passes algorithm to ConfigProvider
function ThemedApp() {
  const { isDarkMode } = useTheme();

  const themeConfig = {
    algorithm: isDarkMode
      ? antdTheme.darkAlgorithm
      : antdTheme.defaultAlgorithm,
    token: {
      ...sharedToken,
      ...(isDarkMode
        ? {
            // Dark mode token overrides
            colorBgBase: "#0d0d0d",
            colorBgContainer: "#141414",
            colorBgElevated: "#1c1c1c",
            colorBgLayout: "#0a0a0a",
            colorBorder: "#2d2d2d",
            colorBorderSecondary: "#1f1f1f",
            colorText: "rgba(255,255,255,0.87)",
            colorTextSecondary: "rgba(255,255,255,0.55)",
            colorTextTertiary: "rgba(255,255,255,0.35)",
            colorPrimary: "#4096ff",
            colorSuccess: "#49aa19",
            colorWarning: "#d89614",
            colorError: "#dc4446",
          }
        : {}),
    },
    components: {
      ...sharedComponents,
      ...(isDarkMode
        ? {
            Table: {
              borderRadius: 8,
              headerBg: "#1c1c1c",
              rowHoverBg: "#1c1c1c",
            },
            Card: {
              borderRadius: 8,
              colorBgContainer: "#141414",
            },
            Menu: {
              darkItemBg: "#0a0a0a",
              darkSubMenuItemBg: "#0d0d0d",
              darkItemSelectedBg: "#1677ff",
            },
            Layout: {
              siderBg: "#0a0a0a",
              headerBg: "#141414",
              bodyBg: "#0a0a0a",
            },
            Modal: {
              borderRadius: 12,
              contentBg: "#1c1c1c",
              headerBg: "#1c1c1c",
            },
          }
        : {
            Table: { borderRadius: 8, headerBg: "#fafafa" },
            Layout: { siderBg: "#001529" },
          }),
    },
  };

  return (
    <ConfigProvider locale={viVN} theme={themeConfig}>
      <AntdApp>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              <div className="App">
                <AppRoutes />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
}

export default App;
