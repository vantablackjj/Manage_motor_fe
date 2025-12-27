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

const DashboardPage = () => {
  const { user } = useAuth();
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
    <Card hoverable style={{ height: "100%" }}>
      <Statistic
        title={title}
        value={value}
        prefix={icon}
        suffix={suffix}
        valueStyle={{ color: color || "#3f8600" }}
      />
      {trend !== undefined && (
        <div style={{ marginTop: "8px", fontSize: "14px" }}>
          {trend >= 0 ? (
            <span style={{ color: "#3f8600" }}>
              <ArrowUpOutlined /> {trend}%
            </span>
          ) : (
            <span style={{ color: "#cf1322" }}>
              <ArrowDownOutlined /> {Math.abs(trend)}%
            </span>
          )}
          <span style={{ marginLeft: "8px", color: "#8c8c8c" }}>
            so với tháng trước
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
      width: 180,
      render: (text) => formatService.formatRelativeTime(text),
    },
    {
      title: "Loại",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 120,
      render: (text) => (
        <Tag
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
      width: 150,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
    },
    {
      title: "Người thực hiện",
      dataIndex: "nguoi_thuc_hien",
      key: "nguoi_thuc_hien",
      width: 150,
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
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Xin chào, {user?.ho_ten || user?.username}! Chào mừng trở lại.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng xe tồn kho"
            value={stats.totalVehicles}
            icon={<CarOutlined />}
            trend={stats.vehicleChange}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Phụ tùng tồn kho"
            value={stats.totalParts}
            icon={<ToolOutlined />}
            trend={stats.partsChange}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Đơn hàng tháng này"
            value={stats.totalOrders}
            icon={<ShoppingCartOutlined />}
            trend={stats.ordersChange}
            color="#fa8c16"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh thu tháng này"
            value={formatService.formatCompactNumber(stats.totalRevenue)}
            icon={<DollarOutlined />}
            suffix="₫"
            trend={stats.revenueChange}
            color="#722ed1"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={16}>
          <Card
            title="Doanh thu theo tháng"
            extra={
              <Space>
                <span style={{ color: "#8c8c8c" }}>Năm 2025</span>
                {/* <TrendingUpOutlined style={{ color: "#52c41a" }} /> */}
              </Space>
            }
          >
            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                borderRadius: "8px",
                color: "#8c8c8c",
              }}
            >
              Biểu đồ doanh thu (Sẽ tích hợp Chart.js hoặc Recharts)
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố sản phẩm">
            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
                borderRadius: "8px",
                color: "#8c8c8c",
              }}
            >
              Biểu đồ tròn phân bố
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card
        title="Hoạt động gần đây"
        extra={
          <a onClick={() => (window.location.href = "/reports/activities")}>
            Xem tất cả
          </a>
        }
      >
        <Table
          dataSource={recentActivities}
          columns={activityColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
          locale={{
            emptyText: "Chưa có hoạt động nào",
          }}
        />
      </Card>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => (window.location.href = "/don-hang/create")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <ShoppingCartOutlined
              style={{ fontSize: "32px", color: "#1890ff" }}
            />
            <h3 style={{ marginTop: "16px" }}>Tạo đơn hàng</h3>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => (window.location.href = "/hoa-don/create")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <DollarOutlined style={{ fontSize: "32px", color: "#52c41a" }} />
            <h3 style={{ marginTop: "16px" }}>Tạo hóa đơn</h3>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => (window.location.href = "/chuyen-kho/create")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <CarOutlined style={{ fontSize: "32px", color: "#fa8c16" }} />
            <h3 style={{ marginTop: "16px" }}>Chuyển kho</h3>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => (window.location.href = "/xe/ton-kho")}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <ToolOutlined style={{ fontSize: "32px", color: "#722ed1" }} />
            <h3 style={{ marginTop: "16px" }}>Tồn kho</h3>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
