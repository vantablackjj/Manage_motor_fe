import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Row,
  Col,
  DatePicker,
  Tooltip,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  PlusOutlined,
  EyeOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { maintenanceAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";

const { RangePicker } = DatePicker;

const MaintenanceListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    ma_xe: "",
    ten_khach_hang: "",
    tu_ngay: null,
    den_ngay: null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...currentFilters };
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      const res = await maintenanceAPI.getMaintenanceList(params);
      setData(res.data?.data || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách phiếu bảo trì");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "ma_phieu",
      key: "ma_phieu",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày bảo trì",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Biển số/Số khung",
      dataIndex: "ma_serial",
      key: "ma_serial",
    },
    {
      title: "Khách hàng",
      dataIndex: "Partner",
      key: "Partner",
      render: (partner) => partner?.ho_ten || "N/A",
    },
    {
      title: "Số KM",
      dataIndex: "so_km_hien_tai",
      key: "so_km_hien_tai",
      render: (val) => formatService.formatNumber(val),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Người lập",
      dataIndex: "User",
      key: "User",
      render: (user) => user?.fullname || "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/maintenance/${record.id}`)}
            />
          </Tooltip>
        </Space>
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
              <ToolOutlined /> Quản lý Bảo trì
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
                onClick={() => navigate("/maintenance/create")}
              >
                Tạo phiếu bảo trì
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Mã xe/Số khung"
                value={filters.ma_xe}
                onChange={(e) => handleFilterChange("ma_xe", e.target.value)}
                onPressEnter={() => fetchData()}
                prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tên khách hàng"
                value={filters.ten_khach_hang}
                onChange={(e) =>
                  handleFilterChange("ten_khach_hang", e.target.value)
                }
                onPressEnter={() => fetchData()}
                prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              />
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
                Tìm kiếm
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
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

export default MaintenanceListPage;
