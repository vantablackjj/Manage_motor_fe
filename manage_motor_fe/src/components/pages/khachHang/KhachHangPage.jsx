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
import { khachHangAPI } from "../../api";
import {
  formatService,
  notificationService,
  authService,
  validationService,
} from "../../services";
import { useDebounce } from "../../hooks";

const { Search } = Input;
const { TabPane } = Tabs;

const KhachHangListPage = () => {
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <TeamOutlined /> Quản lý khách hàng
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Quản lý khách hàng và nhà cung cấp
          </p>
        </div>
        <Space>
          {authService.canCreate() && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm khách hàng
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: "16px" }}>
        <Search
          placeholder="Tìm theo tên, SĐT, email..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tất cả" key="all" />
          <TabPane
            tab={
              <span>
                <UserOutlined /> Khách hàng
              </span>
            }
            key="customer"
          />
          <TabPane
            tab={
              <span>
                <TeamOutlined /> Nhà cung cấp
              </span>
            }
            key="supplier"
          />
        </Tabs>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="ma_kh"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách hàng`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={`${editingRecord ? "Chỉnh sửa" : "Thêm"} khách hàng`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="ma_kh"
            label="Mã khách hàng"
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

          <Form.Item
            name="ho_ten"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên đầy đủ" />
          </Form.Item>

          <Form.Item
            name="dien_thoai"
            label="Điện thoại"
            rules={[
              { pattern: /^(0|\+84)[0-9]{9}$/, message: "SĐT không hợp lệ" },
            ]}
          >
            <Input placeholder="0xxxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>

          <Form.Item
            name="so_cmnd"
            label="CMND/CCCD"
            rules={[
              { pattern: /^[0-9]{9,12}$/, message: "CMND/CCCD không hợp lệ" },
            ]}
          >
            <Input placeholder="9-12 số" />
          </Form.Item>

          <Form.Item name="ngay_sinh" label="Ngày sinh">
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item name="la_ncc" valuePropName="checked">
            <Checkbox>Là nhà cung cấp</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
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
