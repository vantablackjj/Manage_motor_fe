import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  DatePicker,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Typography,
} from "antd";
import {
  PhoneOutlined,
  CalendarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useDebounce } from "../../../hooks/useDebounce";
import { formatService, notificationService } from "../../../services";
import maintenanceApi from "../../../api/maintenance.api";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_COLORS = {
  CHUA_NHAC: "orange",
  DA_NHAC: "green",
  KHACH_TU_CHOI: "red",
  BO_QUA: "default",
};

const STATUS_LABELS = {
  CHUA_NHAC: "Chờ gọi",
  DA_NHAC: "Đã gọi",
  KHACH_TU_CHOI: "Từ chối",
  BO_QUA: "Bỏ qua",
};

const REMINDER_LABELS = {
  BAO_DUONG_DINH_KY: "Bảo dưỡng định kỳ",
  DANG_KIEM: "Giấy tờ gốc (CSKH)",
  BAO_HANH: "Bảo hành",
};

const MaintenanceRemindersPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0 });

  const [filters, setFilters] = useState({
    search: "",
    tu_ngay: dayjs().subtract(15, "days").startOf("day"),
    den_ngay: dayjs().add(30, "days").endOf("day"),
    trang_thai: "CHUA_NHAC",
  });

  const debouncedFilters = useDebounce(filters, 500);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [form] = Form.useForm();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData(debouncedFilters);
  }, [debouncedFilters]);

  const fetchData = async (currentFilters) => {
    setLoading(true);
    try {
      const params = {
        search: currentFilters.search,
        trang_thai: currentFilters.trang_thai,
      };

      if (currentFilters.tu_ngay) {
        params.tu_ngay = currentFilters.tu_ngay.format("YYYY-MM-DD");
      }
      if (currentFilters.den_ngay) {
        params.den_ngay = currentFilters.den_ngay.format("YYYY-MM-DD");
      }

      const res = await maintenanceApi.getReminders(params);
      const items = res.data?.data || res.data || [];
      setData(items);

      // Simple client-side stats based on fetched data
      // In a real app, backend might return absolute stats
      const pending = items.filter((i) => i.trang_thai === "CHUA_NHAC").length;
      const done = items.filter((i) => i.trang_thai === "DA_NHAC").length;
      setStats({
        total: items.length,
        pending,
        done,
      });
    } catch (error) {
      notificationService.error("Không thể tải danh sách nhắc bảo dưỡng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openUpdateModal = (record) => {
    setSelectedReminder(record);
    form.setFieldsValue({
      trang_thai: "DA_NHAC", // Default action
      ghi_chu_CSKH: record.ghi_chu_CSKH || "",
    });
    setIsModalVisible(true);
  };

  const handleUpdateSubmit = async (values) => {
    if (!selectedReminder) return;

    setUpdating(true);
    try {
      await maintenanceApi.updateReminderStatus(selectedReminder.id, {
        trang_thai: values.trang_thai,
        ghi_chu_CSKH: values.ghi_chu_CSKH,
      });

      notificationService.success("Cập nhật trạng thái thành công");
      setIsModalVisible(false);
      fetchData(filters); // Reload data
    } catch (error) {
      notificationService.error("Lỗi cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const baseColumns = [
    {
      title: "Mã Xe (Serial/Biển số)",
      dataIndex: "so_khung",
      key: "so_khung",
      width: 180,
      render: (text, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{text || record.ma_serial}</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.ten_xe || record.ten_loai_xe || "Xe máy"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Khách hàng",
      key: "khach_hang",
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong style={{ color: "#1890ff" }}>
            {record.ten_khach_hang || "Khách Vãng Lai"}
          </Text>
          <Text>
            <PhoneOutlined /> {record.dien_thoai || "N/A"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày Dự Kiến",
      dataIndex: "ngay_du_kien",
      key: "ngay_du_kien",
      render: (val) => (
        <Space>
          <CalendarOutlined />
          <Text
            type={
              dayjs(val).isBefore(dayjs().startOf("day")) ? "danger" : "default"
            }
          >
            {formatService.formatDate(val)}
          </Text>
        </Space>
      ),
    },
    {
      title: "Lý Do Nhắc",
      dataIndex: "loai_nhac_nho",
      key: "loai_nhac_nho",
      render: (text, record) => (
        <Tag color={text === "DANG_KIEM" ? "purple" : "blue"}>
          {record.noi_dung ||
            REMINDER_LABELS[text] ||
            text ||
            "Bảo dưỡng định kỳ"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      align: "center",
      render: (val) => (
        <Tag color={STATUS_COLORS[val] || "default"}>
          {STATUS_LABELS[val] || val}
        </Tag>
      ),
    },
  ];

  const columns = [
    ...baseColumns,
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type={record.trang_thai === "CHUA_NHAC" ? "primary" : "default"}
            size="small"
            icon={<PhoneOutlined />}
            onClick={() => openUpdateModal(record)}
          >
            {record.trang_thai === "CHUA_NHAC" ? "Gọi KH" : "Cập nhật"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      {/* Thống kê Tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false}>
            <Statistic title="Tổng nhắc nhở trong kỳ" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false}>
            <Statistic
              title="Chờ gọi (Cần xử lý)"
              value={stats.pending}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" bordered={false}>
            <Statistic
              title="Đã gọi thành công"
              value={stats.done}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Danh Sách Lịch Nhắc Bảo Dưỡng">
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" italic>
            * Trang này hiển thị các xe **sắp đến hạn** bảo trì (tính từ ngày
            bán/bảo trì lần cuối). Để xem lịch sử sửa chữa đã thực hiện, vui
            lòng vào mục **"Quản lý phiếu bảo trì"**.
          </Text>
        </div>
        {/* Bộ lọc */}
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm theo Số ĐT hoặc Biển số / Khung..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              value={[filters.tu_ngay, filters.den_ngay]}
              onChange={(dates) => {
                handleFilterChange("tu_ngay", dates ? dates[0] : null);
                handleFilterChange("den_ngay", dates ? dates[1] : null);
              }}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button
              type={filters.trang_thai === "CHUA_NHAC" ? "primary" : "default"}
              onClick={() => {
                const newStatus =
                  filters.trang_thai === "CHUA_NHAC" ? "" : "CHUA_NHAC";
                handleFilterChange("trang_thai", newStatus);
              }}
              block
            >
              {filters.trang_thai === "CHUA_NHAC"
                ? "Đang lọc: Chờ gọi"
                : "Lọc: Tất cả"}
            </Button>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Button onClick={() => fetchData(debouncedFilters)} block>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 15 }}
        />
      </Card>

      {/* Modal cập nhật trạng thái */}
      <Modal
        title="Cập Nhật Trạng Thái CSKH"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        {selectedReminder && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Khách hàng: </Text>
            <Text strong>{selectedReminder.ten_khach_hang}</Text>
            <br />
            <Text type="secondary">SĐT: </Text>
            <Text strong style={{ color: "#1890ff" }}>
              {selectedReminder.dien_thoai}
            </Text>
          </div>
        )}

        <Form form={form} layout="vertical" onFinish={handleUpdateSubmit}>
          <Form.Item
            name="trang_thai"
            label="Trạng thái gọi"
            rules={[{ required: true }]}
          >
            <Button.Group style={{ width: "100%", display: "flex" }}>
              <Button
                style={{ flex: 1 }}
                type={
                  form.getFieldValue("trang_thai") === "DA_NHAC"
                    ? "primary"
                    : "default"
                }
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  form.setFieldsValue({ trang_thai: "DA_NHAC" });
                  // trick to trigger re-render of Button group
                  form.validateFields(["trang_thai"]);
                }}
              >
                Đồng ý tới
              </Button>
              <Button
                style={{ flex: 1 }}
                danger={form.getFieldValue("trang_thai") === "KHACH_TU_CHOI"}
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  form.setFieldsValue({ trang_thai: "KHACH_TU_CHOI" });
                  form.validateFields(["trang_thai"]);
                }}
              >
                Từ chối
              </Button>
            </Button.Group>
          </Form.Item>

          <Form.Item name="ghi_chu_CSKH" label="Ghi chú cuộc gọi (Nếu có)">
            <Input.TextArea
              rows={4}
              placeholder="VD: Khách hẹn chiều chủ nhật mang xe qua..."
            />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={updating}>
                Lưu Trạng Thái
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceRemindersPage;
