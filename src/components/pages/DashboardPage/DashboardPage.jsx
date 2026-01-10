// src/components/pages/DashboardPage/DashboardPage.jsx
import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Spin,
  DatePicker,
  Button,
  Typography,
} from "antd";
import {
  CarOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  FilterOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { reportAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);

  const [stats, setStats] = useState({
    revenue_today: 0,
    revenue_month: 0,
    stock_xe: 0,
    low_stock_pt: 0,
    internal_debt: 0,
    customer_debt: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        ma_kho: user?.ma_kho,
        tu_ngay: dateRange[0].format("YYYY-MM-DD"),
        den_ngay: dateRange[1].format("YYYY-MM-DD"),
      };

      // Gọi API dashboard tổng quan
      const overview = await reportAPI.dashboard.getOverview(params);
      console.log("Dashboard overview data:", overview);

      if (overview) {
        setStats((prev) => ({
          ...prev,
          ...overview,
        }));
        setRecentActivities(overview.giao_dich_gan_day || []);
      }
    } catch (error) {
      console.error(error);
      notificationService.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, growth, color, isCurrency }) => (
    <Card
      hoverable
      size="small"
      className="stat-card"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <Row align="middle" gutter={16}>
        <Col span={18}>
          <Text type="secondary" size="small">
            {title}
          </Text>
          <div
            style={{
              fontSize: isMobile ? "20px" : "24px",
              fontWeight: "bold",
              margin: "4px 0",
            }}
          >
            {isCurrency
              ? formatService.formatCurrency(value)
              : formatService.formatNumber(value)}
          </div>
          <div style={{ fontSize: "12px" }}>
            {growth !== undefined &&
              (growth >= 0 ? (
                <Text type="success">
                  <ArrowUpOutlined /> {growth}%{" "}
                  <Text type="secondary">so với trước</Text>
                </Text>
              ) : (
                <Text type="danger">
                  <ArrowDownOutlined /> {Math.abs(growth)}%{" "}
                  <Text type="secondary">so với trước</Text>
                </Text>
              ))}
          </div>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <div
            style={{
              background: `${color}15`,
              padding: "12px",
              borderRadius: "12px",
              display: "inline-block",
            }}
          >
            {React.cloneElement(icon, { style: { fontSize: "24px", color } })}
          </div>
        </Col>
      </Row>
    </Card>
  );

  const activityColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 120,
      render: (text) => (
        <Tag
          color={
            text === "BAN_HANG"
              ? "purple"
              : text === "NHAP_KHO"
              ? "green"
              : text === "CHUYEN_KHO"
              ? "orange"
              : "blue"
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Ngày",
      dataIndex: "ngay_lap",
      key: "ngay_lap",
      render: (date) => formatService.formatDate(date),
    },
  ];

  return (
    <div style={{ padding: "16px", background: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header & Filter */}
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} md={12}>
          <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
            Hệ thống quản lý Motor
          </Title>
          <Text type="secondary">
            Chào mừng trở lại, {user?.ho_ten || user?.username}
          </Text>
        </Col>
        <Col xs={24} md={12} style={{ textAlign: isMobile ? "left" : "right" }}>
          <Space wrap>
            <RangePicker
              size="small"
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates)}
              allowClear={false}
            />
            <Button
              icon={<ReloadOutlined />}
              size="small"
              onClick={fetchDashboardData}
              loading={loading}
            >
              Làm mới
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Doanh thu hôm nay"
            value={stats.revenue_today}
            icon={<DollarOutlined />}
            color="#722ed1"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Doanh thu tháng"
            value={stats.revenue_month}
            icon={<DollarOutlined />}
            color="#eb2f96"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Xe trong kho"
            value={stats.stock_xe}
            icon={<CarOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Phụ tùng sắp hết"
            value={stats.low_stock_pt}
            icon={<ToolOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Công nợ nội bộ"
            value={stats.internal_debt}
            icon={<SwapOutlined />}
            color="#fa8c16"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard
            title="Công nợ khách hàng"
            value={stats.customer_debt}
            icon={<TeamOutlined />}
            color="#13c2c2"
            isCurrency
          />
        </Col>
      </Row>

      {/* Charts & Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Biểu đồ doanh thu"
            size="small"
            extra={
              <Button type="link" size="small">
                Xem chi tiết
              </Button>
            }
          >
            <div
              style={{
                height: 350,
                background: "#fcfcfc",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #d9d9d9",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Text type="secondary">Biểu đồ đang được thiết kế...</Text>
                <br />
                <Text type="secondary" size="small">
                  Gợi ý: Cài đặt "recharts" để hiển thị biểu đồ
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title="Giao dịch mới nhất"
            size="small"
            extra={
              <Button type="link" size="small">
                Tất cả
              </Button>
            }
          >
            <Table
              dataSource={recentActivities}
              columns={activityColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
              scroll={{ x: 300 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions at bottom for mobile */}
      {isMobile && (
        <Card size="small" title="Thao tác nhanh" style={{ marginTop: 16 }}>
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Button
                block
                icon={<ShoppingCartOutlined />}
                onClick={() => (window.location.href = "/sales/orders/create")}
              >
                Bán hàng
              </Button>
            </Col>
            <Col span={12}>
              <Button
                block
                icon={<CarOutlined />}
                onClick={() => (window.location.href = "/xe/danh-sach")}
              >
                Khai kho
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
