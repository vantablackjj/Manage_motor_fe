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
import { reportAPI, maintenanceAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
    supplier_debt: 0,
  });

  const [revenueChart, setRevenueChart] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [maintenanceReminders, setMaintenanceReminders] = useState([]);

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

      // Gọi API dashboard tổng quan và biểu đồ doanh thu
      const [overviewRes, revenueRes, reminderRes] = await Promise.all([
        reportAPI.dashboard.getOverview(params),
        reportAPI.dashboard.getRevenueChart(params),
        maintenanceAPI.getReminders({ limit: 5 }), // Lấy 5 nhắc nhở gần nhất
      ]);

      const overview = overviewRes?.data || overviewRes;
      const revenueData =
        revenueRes?.data || (Array.isArray(revenueRes) ? revenueRes : []);
      const reminders =
        reminderRes?.data || (Array.isArray(reminderRes) ? reminderRes : []);

      if (overview) {
        setStats((prev) => ({
          ...prev,
          ...overview,
        }));
        setRecentActivities(overview.giao_dich_gan_day || []);
        setRevenueChart(revenueData);
        setMaintenanceReminders(reminders);
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
      style={{
        borderLeft: `4px solid ${color}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      styles={{ body: { padding: isMobile ? "12px" : "16px", width: "100%" } }}
    >
      <Row align="middle" gutter={8} style={{ width: "100%" }}>
        <Col span={18}>
          <div style={{ marginBottom: 4 }}>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              {title}
            </Text>
          </div>
          <div
            style={{
              fontSize: isMobile ? "18px" : "22px",
              fontWeight: "bold",
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            {isCurrency
              ? formatService.formatCurrency(value)
              : formatService.formatNumber(value)}
          </div>
        </Col>
        <Col span={6} style={{ textAlign: "right" }}>
          <div
            style={{
              background: `${color}15`,
              padding: isMobile ? "8px" : "12px",
              borderRadius: "10px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, {
              style: { fontSize: isMobile ? "20px" : "24px", color },
            })}
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
      render: (text, record) => {
        let link = "#";
        if (record.loai_giao_dich === "BAN_HANG")
          link = `/sales/orders/${record.id}`;
        else if (record.loai_giao_dich === "NHAP_KHO")
          link = `/purchase/vehicles/${text}`;
        else if (record.loai_giao_dich === "CHUYEN_KHO")
          link = `/chuyen-kho/${text}`;

        return (
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => navigate(link)}
          >
            {text}
          </Button>
        );
      },
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

  const reminderColumns = [
    {
      title: "Xe / Số khung",
      dataIndex: "so_khung",
      key: "so_khung",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text || record.ma_serial}</div>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>
            {record.ten_xe}
          </div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "ten_khach_hang",
      key: "ten_khach_hang",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: "11px", color: "#8c8c8c" }}>
            {record.dien_thoai}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày hẹn",
      dataIndex: "ngay_du_kien",
      key: "ngay_du_kien",
      render: (date) => {
        const isPast = dayjs(date).isBefore(dayjs(), "day");
        return (
          <Tag color={isPast ? "error" : "warning"}>
            {formatService.formatDate(date)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div
      style={{
        padding: "16px",
        background: "var(--bg-layout)",
        minHeight: "100vh",
      }}
    >
      {/* Header & Filter */}
      <Row
        justify="space-between"
        align="bottom"
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} md={14}>
          <Title
            level={isMobile ? 4 : 3}
            style={{ margin: 0, marginBottom: 4 }}
          >
            Hệ thống quản lý Motor
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            Chào mừng trở lại, <b>{user?.ho_ten || user?.username}</b>
          </Text>
        </Col>
        <Col xs={24} md={10}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "flex-start" : "flex-end",
              gap: 8,
            }}
          >
            <Space
              wrap
              size={8}
              style={{
                width: "100%",
                justifyContent: isMobile ? "flex-start" : "flex-end",
              }}
            >
              <RangePicker
                style={{ width: isMobile ? "100%" : "auto", minWidth: 220 }}
                value={dateRange}
                onChange={(dates) => dates && setDateRange(dates)}
                allowClear={false}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
                loading={loading}
              >
                {isMobile ? "" : "Làm mới"}
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh thu hôm nay"
            value={stats.revenue_today}
            icon={<DollarOutlined />}
            color="#722ed1"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh thu tháng"
            value={stats.revenue_month}
            icon={<DollarOutlined />}
            color="#eb2f96"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Xe trong kho"
            value={stats.stock_xe}
            icon={<CarOutlined />}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Phụ tùng sắp hết"
            value={stats.low_stock_pt}
            icon={<ToolOutlined />}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Công nợ nội bộ"
            value={stats.internal_debt}
            icon={<SwapOutlined />}
            color="#fa8c16"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Công nợ khách hàng"
            value={stats.customer_debt}
            icon={<TeamOutlined />}
            color="#13c2c2"
            isCurrency
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Công nợ nhà cung cấp"
            value={stats.supplier_debt}
            icon={<UserOutlined />}
            color="#ff4d4f"
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
            <div style={{ height: 350, width: "100%", padding: "10px 0" }}>
              {revenueChart.length === 0 ? (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--bg-secondary)",
                    borderRadius: 8,
                    border: "1px dashed var(--border-color)",
                  }}
                >
                  <Text type="secondary">Không có dữ liệu biểu đồ</Text>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={revenueChart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--border-color)"
                    />
                    <XAxis
                      dataKey="thang"
                      tick={{ fill: "var(--text-secondary)" }}
                      label={{
                        value: "Tháng",
                        position: "insideBottom",
                        offset: -5,
                        fill: "var(--text-secondary)",
                      }}
                    />
                    <YAxis
                      tick={{ fill: "var(--text-secondary)" }}
                      tickFormatter={(value) => `${value / 1000000}M`}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-color)",
                        color: "var(--text-primary)",
                      }}
                      itemStyle={{ color: "var(--text-primary)" }}
                      formatter={(value) => formatService.formatCurrency(value)}
                    />
                    <Legend />
                    <Bar
                      name="Doanh thu"
                      dataKey="doanh_thu"
                      fill="#1890ff"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Space orientation="vertical" style={{ width: "100%" }} size={16}>
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

            <Card
              title="Nhắc nhở bảo trì sắp tới"
              size="small"
              extra={
                <Button type="link" size="small">
                  Xem thêm
                </Button>
              }
            >
              <Table
                dataSource={maintenanceReminders}
                columns={reminderColumns}
                rowKey="id"
                pagination={false}
                size="small"
                loading={loading}
                scroll={{ x: 300 }}
              />
            </Card>
          </Space>
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
