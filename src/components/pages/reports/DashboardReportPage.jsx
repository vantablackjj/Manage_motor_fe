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
} from "@ant-design/icons";
import { reportAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

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
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Doanh thu hôm nay"
              value={data.overview.revenue_today || 0}
              icon={<DollarOutlined />}
              color="#52c41a"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Doanh thu tháng"
              value={data.overview.revenue_month || 0}
              icon={<ArrowUpOutlined />}
              color="#1890ff"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Tồn kho Xe"
              value={data.overview.stock_xe || 0}
              icon={<CarOutlined />}
              color="#faad14"
              suffix=" xe"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatBox
              title="Linh kiện sắp hết"
              value={data.overview.low_stock_pt || 0}
              icon={<ArrowDownOutlined />}
              color="#ff7a45"
              suffix=" bộ"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <StatBox
              title="Nợ Khách hàng"
              value={data.overview.customer_debt || 0}
              icon={<TeamOutlined />}
              color="#ff4d4f"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatBox
              title="Nợ Nhà cung cấp"
              value={data.overview.supplier_debt || 0}
              icon={<TeamOutlined />}
              color="#722ed1"
              isCurrency
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <StatBox
              title="Nợ Nội bộ"
              value={data.overview.internal_debt || 0}
              icon={<SwapOutlined />}
              color="#13c2c2"
              isCurrency
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card title="Diễn biến doanh thu theo tháng" size="small">
              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-around",
                  background: "#f9f9f9",
                  padding: "20px 40px",
                  borderRadius: 8,
                }}
              >
                {data.revenueChart.length === 0 ? (
                  <Text type="secondary">Không có dữ liệu biểu đồ</Text>
                ) : (
                  data.revenueChart.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          height: 200,
                          width: "60%",
                          maxWidth: 40,
                          background: "#1890ff",
                          borderRadius: "4px 4px 0 0",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: -25,
                            width: "100%",
                            textAlign: "center",
                            fontSize: 10,
                          }}
                        >
                          {Math.round(item.doanh_thu / 1000000)}M
                        </div>
                      </div>
                      <Text size="small" style={{ marginTop: 8 }}>
                        Tháng {item.thang}
                      </Text>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Tồn kho theo kho" size="small">
              <div
                style={{
                  height: 300,
                  overflowY: "auto",
                  padding: 16,
                  background: "#f9f9f9",
                  borderRadius: 8,
                }}
              >
                {data.inventoryChart.length === 0 ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text type="secondary">Không có dữ liệu</Text>
                  </div>
                ) : (
                  data.inventoryChart.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text strong>{item.ten_kho}</Text>
                        <Text>{item.so_luong} xe</Text>
                      </div>
                      <div
                        style={{
                          height: 8,
                          width: "100%",
                          background: "#e8e8e8",
                          borderRadius: 4,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${Math.min((item.so_luong / data.overview.stock_xe) * 100, 100)}%`,
                            background: idx % 2 === 0 ? "#faad14" : "#ff7a45",
                            borderRadius: 4,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
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
