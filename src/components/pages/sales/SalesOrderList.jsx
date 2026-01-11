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
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import { useNavigate } from "react-router-dom";
import { hoaDonBanAPI, khoAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { TRANG_THAI_COLORS } from "../../../utils/constant";

const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesOrderList = () => {
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

      const res = await hoaDonBanAPI.getAll(params);
      setData(res.data || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách hóa đơn bán");
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
      title: "Số hóa đơn",
      dataIndex: "so_hd",
      key: "so_hd",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày bán",
      dataIndex: "ngay_ban",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Khách hàng",
      dataIndex: "ten_kh",
      key: "ten_kh",
      render: (text) => text || "-",
    },
    {
      title: "Kho xuất",
      dataIndex: "ten_kho",
      key: "ten_kho",
      render: (text) => text || "-",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      align: "right",
      render: (val) => formatService.formatCurrency(Number(val)),
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
          onClick={() => navigate(`/sales/orders/${record.so_hd}`)}
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
              <ShoppingOutlined /> Bán Hàng
            </h2>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <ImportButton
                module="xuat-kho"
                title="Hóa Đơn Xuất Kho"
                onSuccess={fetchData}
              />
              <ExportButton
                module="xuat-kho"
                title="Hóa Đơn Xuất Kho"
                params={filters}
              />
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/sales/orders/create")}
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
          rowKey="so_hd"
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

export default SalesOrderList;
