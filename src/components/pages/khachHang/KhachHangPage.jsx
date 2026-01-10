// src/pages/khachHang/KhachHangListPage.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  DatePicker,
  Checkbox,
  Tag,
  Tabs,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { khachHangAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
  validationService,
} from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import { useDebounce } from "../../../hooks";

const { Search } = Input;
const { TabPane } = Tabs;

const KhachHangListPage = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, debouncedSearch, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      const params = {
        page,
        limit: pageSize,
        search: debouncedSearch,
      };

      if (activeTab === "customer") {
        response = await khachHangAPI.getKhachHang(params);
      } else if (activeTab === "supplier") {
        response = await khachHangAPI.getNhaCungCap(params);
      } else {
        response = await khachHangAPI.getAll(params);
      }

      setData(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      notificationService.error("Không thể tải danh sách");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      ngay_sinh: record.ngay_sinh ? dayjs(record.ngay_sinh) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa khách hàng "${record.ho_ten}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await khachHangAPI.delete(record.ma_kh);
          notificationService.deleteSuccess("khách hàng");
          fetchData();
        } catch (error) {
          notificationService.deleteError("khách hàng", error);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    // Validate
    const validation = validationService.validateKhachHang(values);
    if (!validation.isValid) {
      Object.values(validation.errors).forEach((error) => {
        notificationService.error(error);
      });
      return;
    }

    try {
      const data = {
        ...values,
        la_ncc: values.loai === "supplier",
        ngay_sinh: values.ngay_sinh
          ? values.ngay_sinh.format("YYYY-MM-DD")
          : null,
      };

      if (editingRecord) {
        await khachHangAPI.update(editingRecord.ma_kh, data);
        notificationService.updateSuccess("khách hàng");
      } else {
        await khachHangAPI.create(data);
        notificationService.createSuccess("khách hàng");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error("Không thể lưu khách hàng");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Mã KH",
      dataIndex: "ma_kh",
      key: "ma_kh",
      width: 120,
      fixed: "left",
    },
    {
      title: "Họ tên",
      dataIndex: "ho_ten",
      key: "ho_ten",
      width: 200,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại",
      dataIndex: "la_ncc",
      key: "la_ncc",
      width: 120,
      align: "center",
      render: (isSupplier) => (
        <Tag color={isSupplier ? "blue" : "green"}>
          {isSupplier ? "Nhà cung cấp" : "Khách hàng"}
        </Tag>
      ),
    },
    {
      title: "Điện thoại",
      dataIndex: "dien_thoai",
      key: "dien_thoai",
      width: 130,
      render: (text) => formatService.formatPhoneNumber(text),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
    },
    {
      title: "CMND/CCCD",
      dataIndex: "so_cmnd",
      key: "so_cmnd",
      width: 130,
      render: (text) => (text ? formatService.formatCMND(text) : "-"),
    },
    {
      title: "Ngày sinh",
      dataIndex: "ngay_sinh",
      key: "ngay_sinh",
      width: 120,
      render: (text) => (text ? formatService.formatDate(text) : "-"),
    },
    {
      title: "Địa chỉ",
      dataIndex: "dia_chi",
      key: "dia_chi",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {authService.canEdit() && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Sửa
            </Button>
          )}
          {authService.canDelete() && (
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[8, 16]}>
          <Col xs={24} sm={16}>
            <h1
              style={{ margin: 0, fontSize: isMobile ? "1.25rem" : "1.5rem" }}
            >
              <Space wrap>
                <TeamOutlined />
                <span>Danh sách đối tác</span>
              </Space>
            </h1>
          </Col>
          <Col
            xs={24}
            sm={8}
            style={{ textAlign: isMobile ? "left" : "right" }}
          >
            {authService.canCreate() && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                block={isMobile}
                size="small"
              >
                Thêm đối tác
              </Button>
            )}
          </Col>
        </Row>
      </div>

      <Card size="small" style={{ marginBottom: "16px" }}>
        <Search
          placeholder="Tìm tên, SĐT, email..."
          allowClear
          enterButton={<SearchOutlined />}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", maxWidth: isMobile ? "100%" : 400 }}
        />
      </Card>

      <Card size="small">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size={isMobile ? "small" : "middle"}
          items={[
            {
              key: "all",
              label: "Tất cả",
            },
            {
              key: "customer",
              label: (
                <span>
                  <UserOutlined /> Khách
                </span>
              ),
            },
            {
              key: "supplier",
              label: (
                <span>
                  <TeamOutlined /> NCC
                </span>
              ),
            },
          ]}
        />

        <Table
          columns={columns.filter(
            (col) =>
              !isMobile ||
              col.fixed ||
              ["ho_ten", "la_ncc", "dien_thoai"].includes(col.dataIndex)
          )}
          dataSource={data}
          rowKey="ma_kh"
          loading={loading}
          scroll={{ x: 800 }}
          size="small"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng: ${total}`,
            size: "small",
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={`${editingRecord ? "Sửa" : "Thêm"} đối tác`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? "100%" : 700}
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="small"
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="ma_kh"
                label="Mã định danh"
                rules={[
                  { required: true, message: "Vui lòng nhập mã" },
                  {
                    pattern: /^[A-Z0-9_]+$/,
                    message: "Chỉ dùng chữ in hoa, số và _",
                  },
                ]}
              >
                <Input disabled={!!editingRecord} placeholder="VD: KH001" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="ho_ten"
                label="Họ tên"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nhập họ tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="dien_thoai"
                label="Điện thoại"
                rules={[
                  {
                    pattern: /^(0|\+84)[0-9]{9}$/,
                    message: "SĐT không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="0xxxxxxxxx" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input placeholder="email@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="so_cmnd"
                label="CMND/CCCD"
                rules={[
                  {
                    pattern: /^[0-9]{9,12}$/,
                    message: "CMND/CCCD không hợp lệ",
                  },
                ]}
              >
                <Input placeholder="9-12 số" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="ngay_sinh" label="Ngày sinh">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item name="la_ncc" valuePropName="checked">
            <Checkbox>Là nhà cung cấp</Checkbox>
          </Form.Item>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item name="dai_dien" label="Người đại diện">
                <Input placeholder="Tên người đại diện" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="ma_so_thue" label="Mã số thuế">
                <Input placeholder="Mã số thuế" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)} block={isMobile}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" block={isMobile}>
                {editingRecord ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KhachHangListPage;
