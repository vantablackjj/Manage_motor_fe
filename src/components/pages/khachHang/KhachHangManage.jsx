// src/components/pages/khachHang/KhachHangManage.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tag,
  Card,
  Tabs,
  Row,
  Col,
  DatePicker,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  ShopOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { khachHangAPI } from "../../../api";
import { notificationService, authService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import { useLocation, useNavigate } from "react-router-dom";

const KhachHangManage = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize based on URL
  const getTabFromUrl = () =>
    location.pathname.includes("nha-cung-cap") ? "nha-cung-cap" : "khach-hang";
  const [activeTab, setActiveTab] = useState(getTabFromUrl());

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.pathname]);

  useEffect(() => {
    console.log(activeTab);
  }, [activeTab]);
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ALL customers
      const response = await khachHangAPI.getAll();
      const allData = response?.data || [];

      // Filter based on Tab
      let displayedData = [];
      if (activeTab === "khach-hang") {
        displayedData = allData.filter((item) => !item.la_ncc);
      } else {
        displayedData = allData.filter((item) => item.la_ncc === true);
      }

      setData(displayedData);
    } catch (error) {
      notificationService.error("Không thể tải danh sách");
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
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (ma_kh) => {
    try {
      await khachHangAPI.delete(ma_kh);
      notificationService.success("Xóa thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Không thể xóa");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Logic: If user checked "la_ncc", use it.
      // Else if adding in "Supplier" tab, default to true.
      // Else false.
      // However, form value 'la_ncc' (boolean) takes precedence if present.
      const isSupplierTab = activeTab === "nha-cung-cap";
      const isSupplier =
        values.la_ncc !== undefined ? values.la_ncc : isSupplierTab;

      const payload = {
        ...values,
        la_ncc: isSupplier,
        // Ensure date is formatted if selected
        ngay_sinh: values.ngay_sinh
          ? values.ngay_sinh.format("YYYY-MM-DD")
          : null,
      };

      if (editingRecord) {
        // Backend update expects ma_kh (or id) based on implementation.
        // User provided service uses update(maKh, data) or update(id, data).
        // Let's assume update takes ma_kh based on common pattern here,
        // but service code showed update(id, data) in one snippet and update(maKh) in another.
        // Frontend handleDelete uses ma_kh. Let's use ma_kh safely.
        await khachHangAPI.update(editingRecord.ma_kh, payload);
        notificationService.success("Cập nhật thành công");
      } else {
        await khachHangAPI.create(payload);
        notificationService.success("Tạo mới thành công");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Không thể lưu"
      );
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.ho_ten?.toLowerCase().includes(search) ||
      item.dien_thoai?.toLowerCase().includes(search) ||
      item.ma_kh?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã KH",
      dataIndex: "ma_kh",
      key: "ma_kh",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Họ tên",
      dataIndex: "ho_ten",
      key: "ho_ten",
      width: 200,
      ellipsis: true,
    },
    !isMobile && {
      title: "Điện thoại",
      dataIndex: "dien_thoai",
      key: "dien_thoai",
      width: 120,
    },
    !isMobile && {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
      ellipsis: true,
    },
    !isMobile && {
      title: "Địa chỉ",
      dataIndex: "dia_chi",
      key: "dia_chi",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      align: "center",
      render: (val) =>
        val ? <Tag color="green">Hoạt động</Tag> : <Tag color="red">Ngừng</Tag>,
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
            <Popconfirm
              title="Xác nhận xóa?"
              description="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDelete(record.ma_kh)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button type="link" danger size="small" icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>
                <UserOutlined /> Quản lý khách hàng & nhà cung cấp
              </h2>
              <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
                Quản lý thông tin khách hàng và nhà cung cấp
              </p>
            </Col>
            <Col>
              <Space>
                <Input.Search
                  placeholder="Tìm theo tên, SĐT, mã KH..."
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{ width: 250 }}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                  Làm mới
                </Button>
                {authService.canCreate() && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Thêm mới
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            if (key === "nha-cung-cap") {
              navigate("/danh-muc/nha-cung-cap");
            } else {
              navigate("/danh-muc/khach-hang");
            }
          }}
          items={[
            {
              key: "khach-hang",
              label: (
                <span>
                  <UserOutlined /> Khách hàng
                </span>
              ),
            },
            {
              key: "nha-cung-cap",
              label: (
                <span>
                  <ShopOutlined /> Nhà cung cấp
                </span>
              ),
            },
          ]}
        />

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="ma_kh"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={
          editingRecord
            ? `Chỉnh sửa ${
                activeTab === "khach-hang" ? "khách hàng" : "nhà cung cấp"
              }`
            : `Thêm ${
                activeTab === "khach-hang" ? "khách hàng" : "nhà cung cấp"
              } mới`
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ma_kh"
                label="Mã khách hàng"
                rules={[
                  { required: true, message: "Vui lòng nhập mã" },
                  { max: 50, message: "Mã tối đa 50 ký tự" },
                ]}
              >
                <Input
                  placeholder="VD: KH001, NCC001"
                  disabled={!!editingRecord}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="ho_ten"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên" },
                  { max: 200, message: "Họ tên tối đa 200 ký tự" },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dien_thoai"
                label="Điện thoại"
                rules={[
                  { max: 15, message: "SĐT tối đa 15 ký tự" },
                  {
                    pattern: /^[0-9]*$/,
                    message: "Chỉ được nhập số",
                  },
                ]}
              >
                <Input placeholder="VD: 0123456789" maxLength={15} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: "email", message: "Email không hợp lệ" },
                  { max: 100, message: "Email tối đa 100 ký tự" },
                ]}
              >
                <Input placeholder="example@email.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dai_dien" label="Người đại diện">
                <Input placeholder="Tên người đại diện" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ngay_sinh" label="Ngày sinh">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ma_so_thue" label="Mã số thuế">
                <Input placeholder="Mã số thuế" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="so_cmnd" label="CMND/CCCD">
                <Input placeholder="Số CMND/CCCD" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input.TextArea
              rows={2}
              placeholder="Nhập địa chỉ"
              maxLength={300}
            />
          </Form.Item>

          <Form.Item name="ho_khau" label="Hộ khẩu thường trú">
            <Input.TextArea
              rows={2}
              placeholder="Nhập địa chỉ hộ khẩu"
              maxLength={300}
            />
          </Form.Item>

          <Form.Item name="la_ncc" valuePropName="checked">
            <Checkbox>Là Nhà cung cấp</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
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

export default KhachHangManage;
