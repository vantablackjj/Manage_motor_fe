// src/pages/dashboard/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Space, Spin } from "antd";
import {
  CarOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { reportAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";

const DashboardPage = () => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalParts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    vehicleChange: 0,
    partsChange: 0,
    ordersChange: 0,
    revenueChange: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard overview
      const overview = await reportAPI.dashboard.getOverview(user?.ma_kho);

      setStats({
        totalVehicles: overview.totalVehicles || 0,
        totalParts: overview.totalParts || 0,
        totalOrders: overview.totalOrders || 0,
        totalRevenue: overview.totalRevenue || 0,
        vehicleChange: overview.vehicleChange || 0,
        partsChange: overview.partsChange || 0,
        ordersChange: overview.ordersChange || 0,
        revenueChange: overview.revenueChange || 0,
      });

      // Fetch recent activities
      const activities = await reportAPI.dashboard.getRecentActivities(
        10,
        user?.ma_kho
      );
      setRecentActivities(activities || []);
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, prefix, suffix, trend, color, icon }) => (
    <Card hoverable size="small" style={{ height: "100%" }}>
      <Statistic
        title={
          <span style={{ fontSize: isMobile ? "12px" : "14px" }}>{title}</span>
        }
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{
          color: color || "#3f8600",
          fontSize: isMobile ? "18px" : "24px",
        }}
      />
      {trend !== undefined && (
        <div style={{ marginTop: "4px", fontSize: isMobile ? "11px" : "13px" }}>
          {trend >= 0 ? (
            <span style={{ color: "#3f8600" }}>
              <ArrowUpOutlined /> {trend}%
            </span>
          ) : (
            <span style={{ color: "#cf1322" }}>
              <ArrowDownOutlined /> {Math.abs(trend)}%
            </span>
          )}
          <span style={{ marginLeft: "4px", color: "#8c8c8c" }}>
            so với trước
          </span>
        </div>
      )}
    </Card>
  );

  const activityColumns = [
    {
      title: "Thời gian",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      width: 120,
      render: (text) => formatService.formatRelativeTime(text),
    },
    {
      title: "Loại",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 100,
      render: (text) => (
        <Tag
          size="small"
          color={
            text === "NHAP_KHO"
              ? "green"
              : text === "XUAT_KHO"
              ? "red"
              : text === "CHUYEN_KHO"
              ? "blue"
              : text === "BAN_HANG"
              ? "purple"
              : "default"
          }
        >
          {formatService.formatLoaiGiaoDich(text)}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "mo_ta",
      key: "mo_ta",
      ellipsis: true,
    },
    {
      title: "Giá trị",
      dataIndex: "gia_tri",
      key: "gia_tri",
      width: 110,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
    },
    {
      title: "Người làm",
      dataIndex: "nguoi_thuc_hien",
      key: "nguoi_thuc_hien",
      width: 110,
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: isMobile ? "1.25rem" : "1.5rem" }}>
          Dashboard
        </h1>
        <p
          style={{
            color: "#8c8c8c",
            margin: 0,
            fontSize: isMobile ? "13px" : "14px",
          }}
        >
          Xin chào, {user?.ho_ten || user?.username}!
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Xe tồn kho"
            value={stats.totalVehicles}
            icon={<CarOutlined />}
            trend={stats.vehicleChange}
            color="#1890ff"
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Phụ tùng tồn"
            value={stats.totalParts}
            icon={<ToolOutlined />}
            trend={stats.partsChange}
            color="#52c41a"
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Đơn hàng"
            value={stats.totalOrders}
            icon={<ShoppingCartOutlined />}
            trend={stats.ordersChange}
            color="#fa8c16"
          />
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <StatCard
            title="Doanh thu"
            value={formatService.formatCompactNumber(stats.totalRevenue)}
            icon={<DollarOutlined />}
            suffix="₫"
            trend={stats.revenueChange}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
        <Col xs={24} lg={16}>
          <Card
            size="small"
            title="Biểu đồ doanh thu"
            extra={
              <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
                Năm 2025
              </span>
            }
          >
            <div
              style={{
                height: isMobile ? "200px" : "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                borderRadius: "8px",
                color: "#8c8c8c",
                fontSize: "12px",
              }}
            >
              (Biểu đồ chưa sẵn sàng)
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card size="small" title="Cơ cấu hàng hóa">
            <div
              style={{
                height: isMobile ? "200px" : "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                borderRadius: "8px",
                color: "#8c8c8c",
                fontSize: "12px",
              }}
            >
              (Phân bố)
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card
        size="small"
        title="Giao dịch mới"
        extra={
          <a
            onClick={() => (window.location.href = "/reports/activities")}
            style={{ fontSize: "12px" }}
          >
            Chi tiết
          </a>
        }
      >
        <Table
          dataSource={recentActivities}
          columns={activityColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 600 }}
          size="small"
          locale={{
            emptyText: "Chưa có dữ liệu",
          }}
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[8, 8]} style={{ marginTop: "16px" }}>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            size="small"
            onClick={() => (window.location.href = "/don-hang/create")}
            style={{ textAlign: "center", cursor: "pointer", height: "100%" }}
          >
            <ShoppingCartOutlined
              style={{ fontSize: isMobile ? "24px" : "32px", color: "#1890ff" }}
            />
            <h4
              style={{ marginTop: "8px", fontSize: isMobile ? "12px" : "14px" }}
            >
              Đơn hàng
            </h4>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            size="small"
            onClick={() => (window.location.href = "/hoa-don/create")}
            style={{ textAlign: "center", cursor: "pointer", height: "100%" }}
          >
            <DollarOutlined
              style={{ fontSize: isMobile ? "24px" : "32px", color: "#52c41a" }}
            />
            <h4
              style={{ marginTop: "8px", fontSize: isMobile ? "12px" : "14px" }}
            >
              Hóa đơn
            </h4>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            size="small"
            onClick={() => (window.location.href = "/chuyen-kho/create")}
            style={{ textAlign: "center", cursor: "pointer", height: "100%" }}
          >
            <CarOutlined
              style={{ fontSize: isMobile ? "24px" : "32px", color: "#fa8c16" }}
            />
            <h4
              style={{ marginTop: "8px", fontSize: isMobile ? "12px" : "14px" }}
            >
              Chuyển kho
            </h4>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card
            hoverable
            size="small"
            onClick={() => (window.location.href = "/xe/ton-kho")}
            style={{ textAlign: "center", cursor: "pointer", height: "100%" }}
          >
            <ToolOutlined
              style={{ fontSize: isMobile ? "24px" : "32px", color: "#722ed1" }}
            />
            <h4
              style={{ marginTop: "8px", fontSize: isMobile ? "12px" : "14px" }}
            >
              Tồn kho
            </h4>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
