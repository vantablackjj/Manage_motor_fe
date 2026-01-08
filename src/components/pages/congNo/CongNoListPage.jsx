import React, { useState, useEffect } from "react";
import { Table, Card, Button, Space, Row, Col, Statistic, Select } from "antd";
import { DollarOutlined, EyeOutlined } from "@ant-design/icons";
import { congNoAPI, khoAPI } from "../../../api";
import { formatService } from "../../../services";
import { useNavigate } from "react-router-dom";
import ThanhToanModal from "./ThanhToanModal";

const { Option } = Select;

const CongNoListPage = () => {
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
      setData(res.data || []);
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
    setSelectedPair({
      ma_kho_tra: record.ma_kho_no,
      ma_kho_nhan: record.ma_kho_co,
      so_tien_no: record.so_tien_con_lai,
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
      dataIndex: "da_thanh_toan",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Còn lại",
      dataIndex: "so_tien_con_lai",
      align: "right",
      render: (val) => (
        <span style={{ color: "red", fontWeight: "bold" }}>
          {formatService.formatCurrency(val)}
        </span>
      ),
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
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(
                `/cong-no/chi-tiet/${record.ma_kho_no}/${record.ma_kho_co}`
              )
            }
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<DollarOutlined />}
            disabled={!record.so_tien_con_lai || record.so_tien_con_lai <= 0}
            onClick={() => handleOpenPayment(record)}
          >
            Thanh toán
          </Button>
        </Space>
      ),
    },
  ];

  const totalDebt = data.reduce(
    (acc, curr) => acc + (curr.so_tien_con_lai || 0),
    0
  );

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng công nợ toàn hệ thống"
              value={totalDebt}
              precision={0}
              valueStyle={{ color: "#cf1322" }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="Lọc theo Kho Nợ"
            style={{ width: 200 }}
            allowClear
            onChange={(v) => handleFilterChange("ma_kho_no", v)}
          >
            {khoList.map((k) => (
              <Option key={k.ma_kho} value={k.ma_kho}>
                {k.ten_kho}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Lọc theo Kho Có"
            style={{ width: 200 }}
            allowClear
            onChange={(v) => handleFilterChange("ma_kho_co", v)}
          >
            {khoList.map((k) => (
              <Option key={k.ma_kho} value={k.ma_kho}>
                {k.ten_kho}
              </Option>
            ))}
          </Select>
          <Button onClick={() => fetchData()}>Làm mới</Button>
        </Space>
      </div>

      <Card title="Chi tiết công nợ các kho">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => `${r.ma_kho_no}_${r.ma_kho_co}`}
          loading={loading}
          locale={{ emptyText: "Không có dữ liệu công nợ" }}
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
    </div>
  );
};

export default CongNoListPage;
