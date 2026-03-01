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
import { useNavigate } from "react-router-dom";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
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
  const [inventoryChart, setInventoryChart] = useState([]);
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
      const [overviewRes, revenueRes, inventoryRes, reminderRes] =
        await Promise.all([
          reportAPI.dashboard.getOverview(params),
          reportAPI.dashboard.getRevenueChart(params),
          reportAPI.dashboard.getInventoryChart(params),
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
        setInventoryChart(
          inventoryRes?.data ||
            (Array.isArray(inventoryRes) ? inventoryRes : []),
        );
        setMaintenanceReminders(reminders);
      }
    } catch (error) {
      console.error(error);
      notificationService.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, isCurrency, suffix }) => (
    <Card
      hoverable
      size="small"
      style={{
        borderRadius: 16,
        border: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        height: "100%",
        overflow: "hidden",
      }}
      styles={{ body: { padding: 16 } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Text
            type="secondary"
            style={{ fontSize: 13, display: "block", marginBottom: 4 }}
          >
            {title}
          </Text>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--ant-color-text)",
            }}
          >
            {isCurrency
              ? formatService.formatCurrency(value)
              : formatService.formatNumber(value)}
            {suffix}
          </div>
        </div>
        <div
          style={{
            background: `${color}15`,
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {React.cloneElement(icon, { style: { fontSize: 22, color } })}
        </div>
      </div>
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
    <div style={{ padding: "0 8px" }}>
      {/* Hero Welcome Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #1f1f1f 0%, #000000 100%)",
          borderRadius: 24,
          padding: isMobile ? "24px" : "40px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          color: "white",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <Title
                level={isMobile ? 3 : 2}
                style={{ color: "white", margin: 0 }}
              >
                Chào buổi sáng, {user?.ho_ten || user?.username} 🚀
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 16 }}>
                Hệ thống đã sẵn sàng. Bạn có {maintenanceReminders.length} nhắc
                nhở bảo trì cần xử lý hôm nay.
              </Text>
            </Col>
            <Col
              xs={24}
              md={8}
              style={{ textAlign: isMobile ? "left" : "right" }}
            >
              <Space wrap size={12}>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => dates && setDateRange(dates)}
                  style={{ borderRadius: 10, border: "none", height: 40 }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchDashboardData}
                  loading={loading}
                  style={{
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.1)",
                    border: "none",
                    color: "white",
                  }}
                >
                  Làm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
        {/* Abstract decor */}
        <div
          style={{
            position: "absolute",
            right: "-5%",
            bottom: "-20%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255, 122, 69, 0.15)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Main Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {hasPermission("reports", "view") && (
          <>
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
          </>
        )}

        {hasPermission("inventory", "view") && (
          <>
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
          </>
        )}

        {hasPermission("reports", "view_financial") && (
          <>
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
          </>
        )}
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
            <Row gutter={[16, 16]}>
              {hasPermission("reports", "view") && (
                <Col xs={24} md={16}>
                  <div style={{ height: 350, width: "100%" }}>
                    {revenueChart.length === 0 ? (
                      <div
                        className="flex-center h-100"
                        style={{ background: "#f5f5f5", borderRadius: 8 }}
                      >
                        <Text type="secondary">
                          Không có dữ liệu biểu đồ doanh thu
                        </Text>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChart}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="thang" tick={{ fontSize: 12 }} />
                          <YAxis
                            tickFormatter={(v) => `${v / 1e6}M`}
                            width={60}
                          />
                          <Tooltip
                            formatter={(v) => formatService.formatCurrency(v)}
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
                </Col>
              )}

              {hasPermission("inventory", "view") && (
                <Col xs={24} md={8}>
                  <div style={{ height: 350, width: "100%" }}>
                    {inventoryChart.length === 0 ? (
                      <div
                        className="flex-center h-100"
                        style={{ background: "#f5f5f5", borderRadius: 8 }}
                      >
                        <Text type="secondary">Không có dữ liệu tồn kho</Text>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inventoryChart}
                            dataKey="so_luong"
                            nameKey="ten_kho"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={60}
                            fill="#8884d8"
                            paddingAngle={5}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {inventoryChart.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  [
                                    "#1890ff",
                                    "#52c41a",
                                    "#faad14",
                                    "#ff4d4f",
                                    "#722ed1",
                                  ][index % 5]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Col>
              )}
            </Row>
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
