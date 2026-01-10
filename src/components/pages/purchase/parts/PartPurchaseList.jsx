import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Row,
  Col,
  DatePicker,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { donHangAPI, khoAPI } from "../../../../api";
import { formatService, notificationService } from "../../../../services";
import { TRANG_THAI_COLORS } from "../../../../utils/constant";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PartPurchaseList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [filters, setFilters] = useState({
    ma_kho: null,
    trang_thai: null,
    tu_ngay: null,
    den_ngay: null,
  });
  const [stats, setStats] = useState({});

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
      const params = { ...currentFilters };
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      // Using donHangAPI which maps to generic /don-hang-mua (Parts)
      const res = await donHangAPI.getAll(params);

      // Adjust response structure handling if needed (res.data vs res)
      setData(res.data || []);
      setStats(res.stats || {});
    } catch (error) {
      notificationService.error("Lỗi tải danh sách đơn hàng phụ tùng");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "so_phieu", // API mismatch check: donHangAPI uses so_phieu usually
      key: "so_phieu",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat_hang",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "ten_ncc",
      key: "ten_ncc",
      render: (text) => text || "-",
    },
    {
      title: "Kho nhập",
      dataIndex: "ten_kho",
      key: "ten_kho",
      render: (text) => text || "-",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      align: "right",
      render: (val) => formatService.formatCurrency(Number(val)), // Ensure val is number
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>
          {status === "NHAP" ? "Nháp" : status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/purchase/parts/${record.so_phieu}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card size="small">
        <Row
          justify="space-between"
          align="middle"
          gutter={[8, 16]}
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} md={12}>
            <h2 style={{ margin: 0 }}>
              <ShoppingCartOutlined /> Mua Phụ Tùng
            </h2>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/purchase/parts/create")}
              >
                Tạo mới
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Chọn kho"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("ma_kho", v)}
                >
                  {khoList.map((k) => (
                    <Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("trang_thai", v)}
                >
                  <Option value="NHAP">Nháp</Option>
                  <Option value="GUI_DUYET">Chờ duyệt</Option>
                  <Option value="DA_DUYET">Đã duyệt</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={(dates) => {
                    handleFilterChange("tu_ngay", dates ? dates[0] : null);
                    handleFilterChange("den_ngay", dates ? dates[1] : null);
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => fetchData()}
                  block
                >
                  Tìm
                </Button>
              </Col>
            </Row>
          </Space>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="so_phieu"
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            size: "small",
            showTotal: (total) => `Tổng: ${total}`,
          }}
        />
      </Card>
    </div>
  );
};

export default PartPurchaseList;
