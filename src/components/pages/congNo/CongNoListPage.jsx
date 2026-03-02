import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Select,
  DatePicker,
} from "antd";
import { useResponsive } from "../../../hooks/useResponsive";
import {
  DollarOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  TableOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { congNoAPI, khoAPI } from "../../../api";
import { formatService } from "../../../services";
import { useNavigate } from "react-router-dom";
import ThanhToanModal from "./ThanhToanModal";

const { Option } = Select;
const { Title, Text } = Typography;

const CongNoListPage = () => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [filters, setFilters] = useState({ ma_kho_no: null, ma_kho_co: null });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPair, setSelectedPair] = useState(null);

  useEffect(() => {
    fetchKhoList();
    fetchData();
  }, []);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {}
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await congNoAPI.getAllKho(currentFilters);
      const rawData = res.data || [];
      // Sắp xếp: Cập nhật mới nhất lên đầu (theo updated_at)
      const sortedData = [...rawData].sort((a, b) => {
        const tA = new Date(a.updated_at || 0).getTime();
        const tB = new Date(b.updated_at || 0).getTime();
        return tB - tA;
      });
      setData(sortedData);
    } catch (error) {
      console.error("Error fetching debt summary", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleOpenPayment = (record) => {
    const con_lai = Number(record.tong_no) - Number(record.tong_da_tra);
    setSelectedPair({
      ma_kho_tra: record.ma_kho_no,
      ma_kho_nhan: record.ma_kho_co,
      so_tien_no: con_lai,
    });
    setShowPaymentModal(true);
  };

  const columns = [
    {
      title: "Kho Nợ",
      dataIndex: "ma_kho_no",
      render: (text, record) => record.ten_kho_no || text,
    },
    {
      title: "Kho Có",
      dataIndex: "ma_kho_co",
      render: (text, record) => record.ten_kho_co || text,
    },
    {
      title: "Tổng nợ gốc",
      dataIndex: "tong_no",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Đã thanh toán",
      dataIndex: "tong_da_tra",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Còn lại",
      key: "con_lai",
      align: "right",
      render: (_, record) => {
        const con_lai = Number(record.tong_no) - Number(record.tong_da_tra);
        return (
          <span style={{ color: "red", fontWeight: "bold" }}>
            {formatService.formatCurrency(con_lai)}
          </span>
        );
      },
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "updated_at",
      render: (val) => formatService.formatDateTime(val),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => {
        const con_lai = Number(record.tong_no) - Number(record.tong_da_tra);
        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() =>
                navigate(
                  `/cong-no/chi-tiet/${record.ma_kho_no}/${record.ma_kho_co}`,
                )
              }
            >
              Chi tiết
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<DollarOutlined />}
              disabled={con_lai <= 0}
              onClick={() => handleOpenPayment(record)}
            >
              Thanh toán
            </Button>
          </Space>
        );
      },
    },
  ];

  const totalDebt = data.reduce(
    (acc, curr) => acc + (Number(curr.tong_no) - Number(curr.tong_da_tra)),
    0,
  );

  return (
    <div className="manage-page-container">
      {/* Hero Summary Card */}
      <div
        style={{
          background: "linear-gradient(135deg, #ff9c6e 0%, #ff7a45 100%)",
          borderRadius: 20,
          padding: isMobile ? "24px" : "32px",
          marginBottom: 32,
          position: "relative",
          overflow: "hidden",
          color: "white",
          boxShadow: "0 10px 30px rgba(255, 122, 69, 0.2)",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
            ● Cập nhật lúc: {formatService.formatDateTime(new Date())}
          </Text>
          <div style={{ marginTop: 8 }}>
            <Title
              level={5}
              style={{ color: "white", margin: 0, fontWeight: 500 }}
            >
              Tổng công nợ hệ thống
            </Title>
            <div
              style={{
                fontSize: isMobile ? 32 : 40,
                fontWeight: 700,
                margin: "8px 0",
              }}
            >
              {formatService.formatCurrency(totalDebt)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span
              style={{
                fontSize: 13,
                background: "rgba(255,255,255,0.2)",
                padding: "2px 10px",
                borderRadius: 20,
              }}
            >
              ↗ +2.5% so với tháng trước
            </span>
          </div>
        </div>
        {/* Abstract shape decoration */}
        <div
          style={{
            position: "absolute",
            right: "-10%",
            top: "-50%",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <Card
        size="small"
        title={
          <Space>
            <FilterOutlined /> Bộ lọc tìm kiếm
          </Space>
        }
        extra={
          <Button onClick={fetchData} icon={<ReloadOutlined />} type="text">
            Làm mới
          </Button>
        }
        style={{ marginBottom: 24, borderRadius: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 6 }}
            >
              Lọc theo Kho Nợ
            </Text>
            <Select
              placeholder="Tất cả kho nợ"
              style={{ width: "100%" }}
              allowClear
              onChange={(v) => handleFilterChange("ma_kho_no", v)}
            >
              {khoList.map((k) => (
                <Option key={k.ma_kho} value={k.ma_kho}>
                  {k.ten_kho}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 6 }}
            >
              Lọc theo Kho Có
            </Text>
            <Select
              placeholder="Tất cả kho có"
              style={{ width: "100%" }}
              allowClear
              onChange={(v) => handleFilterChange("ma_kho_co", v)}
            >
              {khoList.map((k) => (
                <Option key={k.ma_kho} value={k.ma_kho}>
                  {k.ten_kho}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 6 }}
            >
              Khoảng thời gian
            </Text>
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <TableOutlined /> Danh sách công nợ chi tiết
          </Space>
        }
        size="small"
        style={{ borderRadius: 16 }}
        extra={
          <Button type="link" icon={<ExportOutlined />}>
            Xuất báo cáo
          </Button>
        }
      >
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => `${r.ma_kho_no}_${r.ma_kho_co}`}
          loading={loading}
          size="middle"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 5,
            showTotal: (total) => `Tổng ${total} mục công nợ`,
            size: "small",
          }}
        />
      </Card>

      <ThanhToanModal
        visible={showPaymentModal}
        onCancel={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          fetchData();
        }}
        initData={selectedPair}
      />
      <style>{`
        .manage-page-container {
          padding: 16px;
          background: var(--bg-layout, #f0f2f5);
          min-height: 100vh;
        }
        @media (max-width: 640px) {
          .manage-page-container {
            padding: 8px 4px;
          }
          .ant-card-body {
            padding: 12px !important;
          }
          h5 {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CongNoListPage;
