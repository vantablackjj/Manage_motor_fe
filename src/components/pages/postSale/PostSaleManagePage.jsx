// src/components/pages/postSale/PostSaleManagePage.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  Tooltip,
  Typography,
} from "antd";
import {
  FileDoneOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  AuditOutlined,
  CarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { postSaleAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import dayjs from "dayjs";

const { Option } = Select;
const { Text, Title } = Typography;

const PostSaleManagePage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    cho_dang_ky: 0,
    cho_dang_kiem: 0,
    da_hoan_thanh: 0,
    tong_cong: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: null, // chua_dang_ky, chua_dang_kiem, hoan_thanh, pending
  });

  // Modal states
  const [regModalVisible, setRegModalVisible] = useState(false);
  const [inspModalVisible, setInspModalVisible] = useState(false);
  const [selectedXe, setSelectedXe] = useState(null);
  const [regForm] = Form.useForm();
  const [inspForm] = Form.useForm();

  useEffect(() => {
    fetchStats();
    fetchData();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await postSaleAPI.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Fetch stats error:", error);
    }
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const res = await postSaleAPI.getList(currentFilters);
      if (res.success) {
        setData(Array.isArray(res.data) ? res.data : res.data?.data || []);
      }
    } catch (error) {
      notificationService.error("Lỗi tải danh sách dịch vụ sau bán");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleOpenRegModal = (record) => {
    setSelectedXe(record);
    regForm.setFieldsValue({
      bien_so: record.bien_so,
      ngay_tra_bien: record.ngay_tra_bien ? dayjs(record.ngay_tra_bien) : null,
    });
    setRegModalVisible(true);
  };

  const handleOpenInspModal = (record) => {
    setSelectedXe(record);
    inspForm.setFieldsValue({
      ngay_tra_giay_dang_kiem: record.ngay_tra_giay_dang_kiem
        ? dayjs(record.ngay_tra_giay_dang_kiem)
        : null,
    });
    setInspModalVisible(true);
  };

  const handleUpdateReg = async (values) => {
    try {
      const payload = {
        ...values,
        ngay_tra_bien: values.ngay_tra_bien
          ? values.ngay_tra_bien.format("YYYY-MM-DD")
          : null,
      };
      const res = await postSaleAPI.updateRegistration(
        selectedXe.xe_key,
        payload,
      );
      if (res.success) {
        notificationService.success("Cập nhật thông tin đăng ký thành công");
        setRegModalVisible(false);
        fetchData();
        fetchStats();
      }
    } catch (error) {
      notificationService.error("Lỗi cập nhật đăng ký");
    }
  };

  const handleUpdateInsp = async (values) => {
    try {
      const payload = {
        ngay_tra_giay_dang_kiem: values.ngay_tra_giay_dang_kiem
          ? values.ngay_tra_giay_dang_kiem.format("YYYY-MM-DD")
          : null,
      };
      const res = await postSaleAPI.updateInspection(
        selectedXe.xe_key,
        payload,
      );
      if (res.success) {
        notificationService.success("Cập nhật thông tin đăng kiểm thành công");
        setInspModalVisible(false);
        fetchData();
        fetchStats();
      }
    } catch (error) {
      notificationService.error("Lỗi cập nhật đăng kiểm");
    }
  };

  const columns = [
    {
      title: "Số khung / Xe",
      dataIndex: "so_khung",
      key: "xe_info",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.xe_key}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.ten_xe}
          </div>
        </div>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "ten_khach_hang",
      key: "khach_hang",
      render: (text, record) => (
        <div>
          <div>{record.ten_khach_hang || "N/A"}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {record.so_dien_thoai}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày bán",
      dataIndex: "ngay_ban",
      key: "ngay_ban",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Biển số",
      dataIndex: "bien_so",
      key: "bien_so",
      render: (val) => val || <Text type="secondary">Chưa có</Text>,
    },
    {
      title: "Đăng ký",
      dataIndex: "is_registered",
      key: "is_registered",
      align: "center",
      render: (status) =>
        status ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
        ) : (
          <ClockCircleOutlined style={{ color: "#faad14", fontSize: "18px" }} />
        ),
    },
    {
      title: "Đăng kiểm",
      dataIndex: "is_inspected",
      key: "is_inspected",
      align: "center",
      render: (status) =>
        status ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
        ) : (
          <ClockCircleOutlined style={{ color: "#faad14", fontSize: "18px" }} />
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Cập nhật Đăng ký">
            <Button
              icon={<AuditOutlined />}
              size="small"
              type={record.is_registered ? "default" : "primary"}
              onClick={() => handleOpenRegModal(record)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật Đăng kiểm">
            <Button
              icon={<FileDoneOutlined />}
              size="small"
              type={record.is_inspected ? "default" : "primary"}
              onClick={() => handleOpenInspModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderLeft: "4px solid #1890ff" }}>
            <Statistic
              title="Tổng xe đã bán"
              value={stats.tong_cong}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderLeft: "4px solid #faad14" }}>
            <Statistic
              title="Chờ đăng ký"
              value={stats.cho_dang_ky}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderLeft: "4px solid #722ed1" }}>
            <Statistic
              title="Chờ đăng kiểm"
              value={stats.cho_dang_kiem}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: "#722ed1" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" style={{ borderLeft: "4px solid #52c41a" }}>
            <Statistic
              title="Đã hoàn thành"
              value={stats.da_hoan_thanh}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        title={
          <span>
            <AuditOutlined /> Quản lý Dịch vụ Sau bán
          </span>
        }
      >
        <Row gutter={[8, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm số khung, tên xe, khách hàng..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc trạng thái"
              style={{ width: "100%" }}
              onChange={(val) => handleFilterChange("status", val)}
              allowClear
            >
              <Option value="chua_dang_ky">Chưa đăng ký biển</Option>
              <Option value="chua_dang_kiem">Chưa đăng kiểm</Option>
              <Option value="pending">Đang xử lý</Option>
              <Option value="hoan_thanh">Đã hoàn thành</Option>
            </Select>
          </Col>
          <Col xs={24} md={10} style={{ textAlign: "right" }}>
            <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="xe_key"
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            size: "small",
            showTotal: (total) => `Tổng: ${total}`,
          }}
        />
      </Card>

      {/* Registration Modal */}
      <Modal
        title="Cập nhật thông tin Đăng ký biển số"
        open={regModalVisible}
        onCancel={() => setRegModalVisible(false)}
        onOk={() => regForm.submit()}
        destroyOnHidden
      >
        <Form form={regForm} layout="vertical" onFinish={handleUpdateReg}>
          <Form.Item
            name="bien_so"
            label="Biển số xe"
            rules={[{ required: true, message: "Vui lòng nhập biển số!" }]}
          >
            <Input placeholder="Ví dụ: 29A-123.45" />
          </Form.Item>
          <Form.Item
            name="ngay_tra_bien"
            label="Ngày trả biển / Giấy tờ"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Inspection Modal */}
      <Modal
        title="Cập nhật thông tin Đăng kiểm"
        open={inspModalVisible}
        onCancel={() => setInspModalVisible(false)}
        onOk={() => inspForm.submit()}
        destroyOnHidden
      >
        <Form form={inspForm} layout="vertical" onFinish={handleUpdateInsp}>
          <Form.Item
            name="ngay_tra_giay_dang_kiem"
            label="Ngày trả giấy đăng kiểm"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostSaleManagePage;
