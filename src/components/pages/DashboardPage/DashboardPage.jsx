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
  Modal,
  Badge,
  Descriptions,
  Popover,
} from "antd";
import {
  ToolOutlined,
  DollarOutlined,
  ReloadOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MotorcycleIcon from "../../common/MotorcycleIcon";
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
  const { user, hasPermission, activeWarehouse } = useAuth();
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);

  const [stats, setStats] = useState({
    revenue_today: 0,
    revenue_month: 0,
    cash_collection_today: 0,
    cash_collection_month: 0,
    stock_xe: 0,
    stock_xe_fixing: 0,
    low_stock_pt: 0,
    internal_debt: 0,
    customer_debt: 0,
    supplier_debt: 0,
    revenue_today_detail: {},
    revenue_month_detail: {},
    cash_collection_today_detail: {},
    cash_collection_month_detail: {},
  });

  const [revenueChart, setRevenueChart] = useState([]);
  const [inventoryChart, setInventoryChart] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [maintenanceReminders, setMaintenanceReminders] = useState([]);
  const [lowStockDetail, setLowStockDetail] = useState([]);
  const [lowStockModalOpen, setLowStockModalOpen] = useState(false);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, activeWarehouse]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        ma_kho: user?.vai_tro === "ADMIN" ? activeWarehouse : user?.ma_kho,
        tu_ngay: dateRange[0].format("YYYY-MM-DD"),
        den_ngay: dateRange[1].format("YYYY-MM-DD"),
      };

      // Gọi API dashboard tổng quan và biểu đồ doanh thu
      const [overviewRes, revenueRes, inventoryRes, reminderRes] =
        await Promise.all([
          reportAPI.dashboard.getOverview(params),
          reportAPI.dashboard.getRevenueChart(params),
          reportAPI.dashboard.getInventoryChart(params),
          maintenanceAPI.getReminders({ limit: 5, trang_thai: "CHUA_NHAC" }), // Lấy 5 nhắc nhở chưa xử lý gần nhất
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

  const fetchLowStockDetail = async () => {
    setLoadingLowStock(true);
    try {
      const res = await reportAPI.inventory.getParts({
        ma_kho: user?.vai_tro === "ADMIN" ? activeWarehouse : user?.ma_kho,
        canh_bao: true,
      });
      setLowStockDetail(res?.data || (Array.isArray(res) ? res : []));
      setLowStockModalOpen(true);
    } catch (error) {
      notificationService.error("Không thể tải chi tiết phụ tùng sắp hết");
    } finally {
      setLoadingLowStock(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    isCurrency,
    suffix,
    onClick,
    detail,
    detailTitle,
  }) => {
    const renderDetail = () => {
      if (!detail || Object.keys(detail).length === 0) return null;

      const labels = {
        SALES: "Bán hàng",
        MAINTENANCE: "Dịch vụ & Bảo trì",
        OTHER: "Khác",
      };

      return (
        <div style={{ minWidth: 200 }}>
          <div
            style={{
              fontWeight: 600,
              marginBottom: 8,
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: 4,
            }}
          >
            {detailTitle || "Chi tiết"}
          </div>
          {Object.entries(detail).map(([key, val]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                {labels[key] || key}:
              </Text>
              <Text strong style={{ fontSize: 12 }}>
                {isCurrency
                  ? formatService.formatCurrency(val)
                  : formatService.formatNumber(val)}
              </Text>
            </div>
          ))}
        </div>
      );
    };

    const cardContent = (
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
              fontSize: isMobile ? 20 : 24,
              fontWeight: 700,
              color: "var(--ant-color-text)",
            }}
          >
            {isCurrency
              ? formatService.formatCurrency(value)
              : formatService.formatNumber(value)}
            {suffix}
          </div>
          {onClick && (
            <Text
              type="link"
              style={{ fontSize: 11, marginTop: 8, display: "block" }}
            >
              Chi tiết →
            </Text>
          )}
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
    );

    return (
      <Popover
        content={renderDetail()}
        trigger="hover"
        placement="bottom"
        mouseEnterDelay={0.2}
        open={detail ? undefined : false}
      >
        <Card
          hoverable
          size="small"
          onClick={onClick}
          style={{
            borderRadius: 16,
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            height: "100%",
            overflow: "hidden",
            cursor: onClick ? "pointer" : "default",
            transition: "all 0.3s ease",
          }}
          styles={{
            body: { padding: 16 },
          }}
          className="dashboard-stat-card"
        >
          {cardContent}
        </Card>
      </Popover>
    );
  };

  const activityColumns = [
    {
      title: "Mã phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      width: 120,
      render: (text, record) => {
        let link = "#";
        if (record.loai_giao_dich === "BAN_HANG")
          link = `/sales/orders/view/${text}`;
        else if (record.loai_giao_dich === "NHAP_KHO")
          link = `/purchase/orders/view/${text}`;
        else if (record.loai_giao_dich === "CHUYEN_KHO")
          link = `/chuyen-kho/${text}`;
        else if (record.loai_giao_dich === "DICH_VU_BAO_TRI")
          link = `/maintenance/view/${text}`;

        return (
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={() => link !== "#" && navigate(link)}
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
      width: 150,
      render: (text) => {
        const config = {
          BAN_HANG: { color: "purple", label: "Bán hàng" },
          NHAP_KHO: { color: "green", label: "Nhập kho" },
          CHUYEN_KHO: { color: "orange", label: "Chuyển kho" },
          DICH_VU_BAO_TRI: { color: "blue", label: "Sửa chữa & Bảo trì" },
        };
        const item = config[text] || { color: "default", label: text };
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "Khách hàng / Đối tác",
      dataIndex: "ten_doi_tac",
      key: "ten_doi_tac",
      width: 150,
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Mô tả",
      dataIndex: "dien_giai",
      key: "dien_giai",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      width: 120,
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
    <div className="manage-page-container">
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
                level={isMobile ? 4 : 2}
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: isMobile ? "1.25rem" : "2rem",
                }}
              >
                Chào buổi sáng, {user?.ho_ten || user?.username} 🚀
              </Title>
              <Text
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: isMobile ? 14 : 16,
                }}
              >
                Hệ thống đã sẵn sàng. Bạn có {maintenanceReminders.length} nhắc
                nhở bảo trì cần xử lý hôm nay. (Vai trò:{" "}
                {user?.vai_tro || "Trống"}) | Phiên bản: v1.0.2
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
                onClick={() => navigate("/bao-cao/doanh-thu")}
                detail={stats.revenue_today_detail}
                detailTitle="Cơ cấu doanh thu hôm nay"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Doanh thu tháng"
                value={stats.revenue_month}
                icon={<DollarOutlined />}
                color="#eb2f96"
                isCurrency
                onClick={() => navigate("/bao-cao/doanh-thu")}
                detail={stats.revenue_month_detail}
                detailTitle="Cơ cấu doanh thu tháng"
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
                icon={<MotorcycleIcon />}
                color="#1890ff"
                onClick={() => navigate("/xe/danh-sach")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Xe đang sửa"
                value={stats.stock_xe_fixing}
                icon={<ToolOutlined />}
                color="#52c41a"
                onClick={() => navigate("/maintenance")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Phụ tùng sắp hết"
                value={stats.low_stock_pt}
                icon={<ToolOutlined />}
                color="#faad14"
                onClick={fetchLowStockDetail}
              />
            </Col>
          </>
        )}

        {hasPermission("reports", "view_financial") && (
          <>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Thực thu hôm nay"
                value={stats.cash_collection_today}
                icon={<DollarOutlined />}
                color="#52c41a"
                isCurrency
                onClick={() => navigate("/thu-chi")}
                detail={stats.cash_collection_today_detail}
                detailTitle="Cơ cấu thực thu hôm nay"
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Công nợ nội bộ"
                value={stats.internal_debt}
                icon={<SwapOutlined />}
                color="#fa8c16"
                isCurrency
                onClick={() => navigate("/cong-no/quan-ly")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Công nợ khách hàng"
                value={stats.customer_debt}
                icon={<TeamOutlined />}
                color="#13c2c2"
                isCurrency
                onClick={() => navigate("/bao-cao/cong-no")}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Công nợ nhà cung cấp"
                value={stats.supplier_debt}
                icon={<UserOutlined />}
                color="#ff4d4f"
                isCurrency
                onClick={() => navigate("/bao-cao/cong-no")}
              />
            </Col>
          </>
        )}
      </Row>

      {/* Charts & Recent Activities */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Xu hướng doanh thu"
            size="small"
            extra={
              <Button
                type="link"
                size="small"
                onClick={() => navigate("/bao-cao/doanh-thu")}
              >
                Xem chi tiết
              </Button>
            }
          >
            {hasPermission("reports", "view") && (
              <div style={{ height: 350, width: "100%", marginTop: 16 }}>
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="thang" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${v / 1e6}M`} width={60} />
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
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Space orientation="vertical" style={{ width: "100%" }} size={16}>
            <Card
              title="Giao dịch mới nhất"
              size="small"
              extra={
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate("/sales/orders")}
                >
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
                scroll={{ x: 800 }}
              />
            </Card>

            <Card
              title="Nhắc nhở bảo trì sắp tới"
              size="small"
              extra={
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate("/maintenance/reminders")}
                >
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
                scroll={{ x: 800 }}
              />
            </Card>
          </Space>
        </Col>
      </Row>

      {/* Modals for Quick Details */}
      <Modal
        title={
          <Space>
            <ToolOutlined style={{ color: "#faad14" }} />
            <span>Phụ tùng sắp hết (Cảnh báo tồn kho)</span>
          </Space>
        }
        open={lowStockModalOpen}
        onCancel={() => setLowStockModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setLowStockModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="report"
            type="primary"
            onClick={() => {
              setLowStockModalOpen(false);
              navigate("/phu-tung/danh-sach");
            }}
          >
            Quản lý tồn kho
          </Button>,
        ]}
        width={800}
        loading={loadingLowStock}
      >
        <Table
          size="small"
          dataSource={lowStockDetail}
          pagination={{ pageSize: 8 }}
          rowKey={(record) => `${record.ma_pt}_${record.ten_kho}`}
          columns={[
            {
              title: "Tên phụ tùng",
              dataIndex: "ten_pt",
              key: "ten_pt",
            },
            {
              title: "Kho",
              dataIndex: "ten_kho",
              key: "ten_kho",
            },
            {
              title: "Tồn thực",
              dataIndex: "so_luong_ton",
              key: "so_luong_ton",
              align: "right",
              render: (val, record) => (
                <Text type="danger" strong>
                  {val} {record.don_vi_tinh}
                </Text>
              ),
            },
            {
              title: "Tối thiểu",
              dataIndex: "so_luong_toi_thieu",
              key: "so_luong_toi_thieu",
              align: "right",
            },
          ]}
        />
      </Modal>

      <style>{`
        .manage-page-container {
          padding: 16px;
          background: var(--bg-layout, #f0f2f5);
          min-height: 100vh;
        }
        .dashboard-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.08) !important;
        }
        @media (max-width: 640px) {
          .manage-page-container {
            padding: 8px 4px;
          }
          .ant-card-body {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
