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
  ShoppingOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import { useNavigate } from "react-router-dom";
import { orderAPI, khoAPI, khachHangAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { TRANG_THAI_COLORS, LOAI_DON_HANG } from "../../../utils/constant";

const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesOrderList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  const [filters, setFilters] = useState({
    ma_ben_xuat: null,
    status: true,
    trang_thai: null,
    tu_ngay: null,
    den_ngay: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchKhoList();
    fetchCustomerList();
    fetchData();
  }, []);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {}
  };

  const fetchCustomerList = async () => {
    try {
      const res = await khachHangAPI.getAll();
      setCustomerList(res.data || res || []);
    } catch (error) {}
  };

  const fetchData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      const params = {
        ...currentFilters,
        loai_don_hang: LOAI_DON_HANG.BAN_HANG,
        page,
        limit: pageSize,
      };
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      const res = await orderAPI.getAll(params);
      const rawData = res.data || res || {};
      const list = rawData.data || (Array.isArray(rawData) ? rawData : []);
      const meta = rawData.pagination || {};

      setData(list);
      setPagination({
        ...pagination,
        current: page,
        total: meta.total || list.length,
      });
    } catch (error) {
      notificationService.error("Lỗi tải danh sách đơn bán hàng");
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
      title: "Mã đơn hàng",
      dataIndex: "so_don_hang",
      key: "so_don_hang",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày lập",
      dataIndex: "created_at",
      render: (val) => formatService.formatDateTime(val),
    },
    {
      title: "Khách hàng",
      dataIndex: "ten_ben_nhap",
      key: "ten_ben_nhap",
      render: (text, record) => text || record.ma_ben_nhap || "-",
    },
    {
      title: "Kho xuất",
      dataIndex: "ten_ben_xuat",
      key: "ten_ben_xuat",
      render: (text, record) => text || record.ma_ben_xuat || "-",
    },
    {
      title: "Thanh toán",
      dataIndex: "thanh_tien",
      align: "right",
      render: (val) => formatService.formatCurrency(Number(val || 0)),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>{status}</Tag>
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
          onClick={() => navigate(`/sales/orders/${record.id}`)}
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
                  onChange={(v) => handleFilterChange("ma_ben_xuat", v)}
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
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            size: "small",
            showTotal: (total) => `Tổng: ${total}`,
            onChange: (page, pageSize) => fetchData(page, pageSize),
          }}
        />
      </Card>
    </div>
  );
};

export default SalesOrderList;
