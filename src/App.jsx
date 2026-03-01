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

const sharedToken = {
  colorPrimary: "#ff7a45", // Consistent brand orange
  colorLink: "#ff7a45",
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorError: "#ff4d4f",
  colorInfo: "#ff7a45",
  borderRadius: 12,
  fontSize: 14,
  fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
  controlHeight: 40, // Balanced chunky inputs
};

const sharedComponents = {
  Button: {
    controlHeight: 40,
    borderRadius: 10,
    fontWeight: 600,
    boxShadow: "0 2px 0 rgba(255, 122, 69, 0.05)",
  },
  Input: { controlHeight: 40, borderRadius: 10 },
  Select: { controlHeight: 40, borderRadius: 10 },
  DatePicker: { controlHeight: 40, borderRadius: 10 },
  Table: {
    borderRadius: 12,
    headerBg: "#fafafa",
    headerColor: "#595959",
    headerFontWeight: 600,
  },
  Card: {
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  Modal: { borderRadius: 16 },
  Tabs: {
    titleFontSize: 15,
    fontWeightStrong: 600,
  },
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
            colorBgBase: "#0a0a0a",
            colorBgContainer: "#141414",
            colorBgElevated: "#1f1f1f",
            colorBgLayout: "#000000",
            colorBorder: "#303030",
            colorText: "rgba(255,255,255,0.85)",
            colorTextHeading: "#ffffff",
          }
        : {
            colorBgLayout: "#f8f9fa",
            colorBgContainer: "#ffffff",
            colorTextHeading: "#1f1f1f",
          }),
    },
    components: {
      ...sharedComponents,
      ...(isDarkMode
        ? {
            Table: {
              headerBg: "#2a2a2a",
              rowHoverBg: "#2a2a2a",
            },
            Menu: {
              darkItemSelectedBg: "#ff7a45",
              darkItemSelectedColor: "#ffffff",
              darkItemColor: "rgba(255, 255, 255, 0.65)",
              darkItemHoverColor: "#ffffff",
            },
            Layout: {
              siderBg: "#001529",
              headerBg: "#1f1f1f",
            },
          }
        : {
            Layout: {
              siderBg: "#ffffff",
              headerBg: "#ffffff",
            },
            Menu: {
              itemSelectedBg: "#fff7e6",
              itemSelectedColor: "#ff7a45",
            },
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
