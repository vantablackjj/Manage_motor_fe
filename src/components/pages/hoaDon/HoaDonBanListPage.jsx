import React, { useState, useEffect } from "react";
import { Table, Card, Button, Input, Select, Space, Tag, Row, Col } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { hoaDonAPI, khoAPI, khachHangAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { TRANG_THAI_COLORS, TRANG_THAI_LABELS } from "../../../utils/constant";

const { Option } = Select;

const HoaDonBanListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [filters, setFilters] = useState({
    trang_thai: null,
    ma_kho: null,
    ma_kh: null,
    keyword: "",
  });

  useEffect(() => {
    fetchMasterData();
    fetchData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [khoRes, khRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll(),
      ]);
      setKhoList(khoRes || []);
      setCustomerList(khRes.data || khRes || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...currentFilters,
      };

      const res = await hoaDonAPI.getAll(params);
      if (res.success) {
        // Handle case where res.data is the array directly (based on user provided response)
        // or if it follows the standard { data: [], pagination: {} } structure
        const items = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const total =
          res.data?.pagination?.total ||
          (Array.isArray(res.data) ? res.data.length : 0);

        setData(items);
        setPagination({
          ...pagination,
          current: page,
          total: total,
        });
      }
    } catch (error) {
      notificationService.error("Lỗi tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: "Số hóa đơn",
      dataIndex: "so_hd",
      key: "so_hd",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày lập",
      dataIndex: "ngay_ban",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Khách hàng",
      dataIndex: "ten_khach_hang",
      key: "ten_khach_hang",
      render: (text, record) => text || record.ma_kh,
    },
    {
      title: "Kho",
      dataIndex: "ten_kho",
      key: "ten_kho",
      render: (text, record) => text || record.ma_kho_xuat,
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      align: "right",
      render: (val) => (
        <b style={{ color: "#1890ff" }}>
          {formatService.formatCurrency(Number(val))}
        </b>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>
          {TRANG_THAI_LABELS[status] || status}
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
          onClick={() => {
            if (record.so_hd) {
              navigate(`/sales/invoices/${record.so_hd}`);
            } else {
              notificationService.error("Số hóa đơn không hợp lệ");
            }
          }}
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
            <h3 style={{ margin: 0 }}>Danh sách hóa đơn bán</h3>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/sales/invoices/create")}
              >
                Tạo hóa đơn
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("trang_thai", v)}
                >
                  <Option value="NHAP">Nháp</Option>
                  <Option value="DA_XUAT">Đã xuất kho</Option>
                  <Option value="CHO_DUYET_GIAO">Chờ duyệt giao</Option>
                  <Option value="DA_DUYET_GIAO">Đã duyệt giao</Option>
                  <Option value="DA_GIAO">Đã giao hàng</Option>
                  <Option value="DA_THANH_TOAN">Đã thanh toán</Option>
                  <Option value="HUY">Đã hủy</Option>
                </Select>
              </Col>
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
                  placeholder="Chọn khách hàng"
                  style={{ width: "100%" }}
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  onChange={(v) => handleFilterChange("ma_kh", v)}
                >
                  {customerList.map((c) => (
                    <Option key={c.ma_kh} value={c.ma_kh}>
                      {c.ho_ten}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col xs={18} sm={20} md={20}>
                <Input
                  placeholder="Số hóa đơn, ghi chú..."
                  prefix={<SearchOutlined />}
                  style={{ width: "100%" }}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  onPressEnter={() => fetchData()}
                />
              </Col>
              <Col xs={6} sm={4} md={4}>
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
          scroll={{ x: 900 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100"],
            showTotal: (total) => `Tổng: ${total}`,
            size: "small",
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default HoaDonBanListPage;
