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
    <div style={{ padding: "16px 8px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="Tổng công nợ hệ thống"
              value={totalDebt}
              precision={0}
              valueStyle={{ color: "#cf1322", fontSize: "18px" }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12}>
              <Select
                placeholder="Lọc theo Kho Nợ"
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
            <Col xs={24} sm={12}>
              <Select
                placeholder="Lọc theo Kho Có"
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
          </Row>
          <Button onClick={() => fetchData()} block size="small">
            Làm mới
          </Button>
        </Space>
      </div>

      <Card title="Chi tiết công nợ các kho" size="small">
        <Table
          dataSource={data}
          columns={columns}
          rowKey={(r) => `${r.ma_kho_no}_${r.ma_kho_co}`}
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
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
