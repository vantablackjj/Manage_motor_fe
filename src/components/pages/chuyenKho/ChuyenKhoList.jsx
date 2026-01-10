// src/components/pages/chuyenKho/ChuyenKhoList.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Tag,
  Space,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { chuyenKhoAPI, khoAPI } from "../../../api";
import {
  notificationService,
  formatService,
  authService,
} from "../../../services";
import {
  TRANG_THAI,
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
} from "../../../utils/constant";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const ChuyenKhoList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);

  const [filters, setFilters] = useState({
    ma_kho_xuat: null,
    ma_kho_nhap: null,
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
    } catch (error) {
      console.error("Lỗi tải danh sách kho", error);
    }
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        ...currentFilters,
      };
      // Format dates if present
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      const response = await chuyenKhoAPI.getAll(params);
      setData(response.data || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách phiếu chuyển kho");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      const newFilters = {
        ...filters,
        tu_ngay: dates[0],
        den_ngay: dates[1],
      };
      setFilters(newFilters);
      fetchData(newFilters);
    } else {
      const newFilters = {
        ...filters,
        tu_ngay: null,
        den_ngay: null,
      };
      setFilters(newFilters);
      fetchData(newFilters);
    }
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Ngày chuyển",
      dataIndex: "ngay_chuyen_kho",
      key: "ngay_chuyen_kho",
      render: (text) => formatService.formatDate(text),
    },
    {
      title: "Kho xuất",
      dataIndex: "ma_kho_xuat",
      key: "ma_kho_xuat",
      render: (ma_kho) => {
        const kho = khoList.find((k) => k.ma_kho === ma_kho);
        return kho ? kho.ten_kho : ma_kho;
      },
    },
    {
      title: "Kho nhập",
      dataIndex: "ma_kho_nhap",
      key: "ma_kho_nhap",
      render: (ma_kho) => {
        const kho = khoList.find((k) => k.ma_kho === ma_kho);
        return kho ? kho.ten_kho : ma_kho;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>
          {TRANG_THAI_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: "Người tạo",
      dataIndex: "nguoi_tao",
      key: "nguoi_tao",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/chuyen-kho/${record.so_phieu}`)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card size="small">
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[8, 16]}>
            <Col xs={24} md={12}>
              <h2 style={{ margin: 0 }}>Chuyển kho</h2>
            </Col>
            <Col xs={24} md={12} style={{ textAlign: "right" }}>
              <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                  Làm mới
                </Button>
                {authService.canCreate() && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate("/chuyen-kho/tao-moi")}
                  >
                    Tạo mới
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Chọn kho xuất"
                style={{ width: "100%" }}
                allowClear
                onChange={(val) => handleFilterChange("ma_kho_xuat", val)}
              >
                {khoList.map((kho) => (
                  <Option key={kho.ma_kho} value={kho.ma_kho}>
                    {kho.ten_kho}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Chọn kho nhập"
                style={{ width: "100%" }}
                allowClear
                onChange={(val) => handleFilterChange("ma_kho_nhap", val)}
              >
                {khoList.map((kho) => (
                  <Option key={kho.ma_kho} value={kho.ma_kho}>
                    {kho.ten_kho}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Trạng thái"
                style={{ width: "100%" }}
                allowClear
                onChange={(val) => handleFilterChange("trang_thai", val)}
              >
                {Object.keys(TRANG_THAI).map((key) => (
                  <Option key={key} value={key}>
                    {TRANG_THAI_LABELS[key]}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                onChange={handleDateRangeChange}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
          </Row>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="so_phieu"
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total}`,
            size: "small",
          }}
        />
      </Card>
    </div>
  );
};

export default ChuyenKhoList;
