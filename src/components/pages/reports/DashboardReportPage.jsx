// src/components/pages/reports/DashboardReportPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  DatePicker,
  Button,
  Spin,
} from "antd";
import {
  DashboardOutlined,
  ReloadOutlined,
  DollarOutlined,
  CarOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { reportAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardReportPage = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    overview: {},
    revenueChart: [],
    inventoryChart: [],
  });

  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    const params = {
      tu_ngay: dateRange[0].format("YYYY-MM-DD"),
      den_ngay: dateRange[1].format("YYYY-MM-DD"),
    };

    try {
      const [overviewRes, revenueRes, inventoryRes] = await Promise.all([
        reportAPI.dashboard.getOverview(params),
        reportAPI.dashboard.getRevenueChart(params),
        reportAPI.dashboard.getInventoryChart(params),
      ]);

      setData({
        overview: overviewRes?.data || overviewRes || {},
        revenueChart:
          revenueRes?.data || (Array.isArray(revenueRes) ? revenueRes : []),
        inventoryChart:
          inventoryRes?.data ||
          (Array.isArray(inventoryRes) ? inventoryRes : []),
      });
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu Dashboard");
    } finally {
      setLoading(false);
    }
  };

  const StatBox = ({ title, value, icon, color, isCurrency, suffix }) => (
    <Card
      size="small"
      style={{ height: "100%", borderTop: `4px solid ${color}` }}
    >
      <Statistic
        title={<Text type="secondary">{title}</Text>}
        value={value}
        prefix={icon}
        suffix={suffix}
        formatter={(val) =>
          isCurrency
            ? formatService.formatCurrency(val)
            : formatService.formatNumber(val)
        }
        valueStyle={{ color, fontSize: isMobile ? 18 : 24, fontWeight: "bold" }}
      />
    </Card>
  );

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          <DashboardOutlined /> Tổng quan hệ thống
        </Title>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates)}
            format="DD/MM/YYYY"
            size="small"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAllData}
            loading={loading}
            size="small"
          >
            Làm mới
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <StatBox
              title="Doanh thu Hóa đơn"
              value={data.overview.revenue_month || 0}
              icon={<ArrowUpOutlined />}
              color="#1890ff"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatBox
              title="Thực thu tiền mặt"
              value={data.overview.cash_collection_month || 0}
              icon={<DollarOutlined />}
              color="#52c41a"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatBox
              title="Linh kiện sắp hết"
              value={data.overview.low_stock_pt || 0}
              icon={<ArrowDownOutlined />}
              color="#ff7a45"
              suffix=" mã"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Xe đang sửa"
              value={data.overview.stock_xe_fixing || 0}
              icon={<ToolOutlined />}
              color="#722ed1"
              suffix=" xe"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Xe tồn kho"
              value={data.overview.stock_xe || 0}
              icon={<CarOutlined />}
              color="#faad14"
              suffix=" xe"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Nợ Khách hàng"
              value={data.overview.customer_debt || 0}
              icon={<TeamOutlined />}
              color="#ff4d4f"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Nợ Nhà cung cấp"
              value={data.overview.supplier_debt || 0}
              icon={<TeamOutlined />}
              color="#722ed1"
              isCurrency
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card title="Diễn biến doanh thu theo tháng" size="small">
              <div style={{ height: 350, width: "100%", padding: "10px 0" }}>
                {data.revenueChart.length === 0 ? (
                  <div className="flex-center h-100">
                    <Text type="secondary">Không có dữ liệu biểu đồ</Text>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.revenueChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="thang"
                        label={{
                          value: "Tháng",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${value / 1000000}M`}
                        width={60}
                      />
                      <Tooltip
                        formatter={(value) =>
                          formatService.formatCurrency(value)
                        }
                        labelStyle={{ fontWeight: "bold" }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        name="Doanh thu"
                        dataKey="doanh_thu"
                        fill="#1890ff"
                        radius={[4, 4, 0, 0]}
                        barSize={isMobile ? 20 : 40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Cơ cấu tồn kho (Xe)" size="small">
              <div style={{ height: 350, width: "100%" }}>
                {data.inventoryChart.length === 0 ? (
                  <div className="flex-center h-100">
                    <Text type="secondary">Không có dữ liệu</Text>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.inventoryChart}
                        dataKey="so_luong"
                        nameKey="ten_kho"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={isMobile ? 40 : 60}
                        fill="#8884d8"
                        paddingAngle={5}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {data.inventoryChart.map((entry, index) => (
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
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DashboardReportPage;
