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
  Row,
  Col,
  Select,
  Switch,
  List,
  Typography,
  Tooltip,
  Divider,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  KeyOutlined,
  LockOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
  AppstoreAddOutlined,
  FormOutlined,
  SwapOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { userAPI, khoAPI } from "../../../api";
import { authService, notificationService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  USER_ROLE_COLORS,
  USER_ROLE_LABELS,
  USER_ROLES,
} from "../../../utils/constant";

const { Text, Title } = Typography;

const UserManagePage = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);

  // Modals visibility
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);

  // Selected records for editing
  const [editingRecord, setEditingRecord] = useState(null);
  const [permissionUser, setPermissionUser] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [permissionForm] = Form.useForm();

  const [userWarehouses, setUserWarehouses] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    fetchData();
    fetchKhoList();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setData(response?.data || response || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchKhoList = async () => {
    try {
      const response = await khoAPI.getAll();
      setKhoList(response?.data || response || []);
    } catch (error) {
      console.error("Error fetching kho list", error);
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

  const handleToggleStatus = async (record) => {
    try {
      await userAPI.toggleStatus(record.id, record);
      notificationService.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Không thể cập nhật trạng thái",
      );
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await userAPI.update(editingRecord.id, values);
        notificationService.success("Cập nhật thành công");
      } else {
        await userAPI.create(values);
        notificationService.success("Tạo mới thành công");
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi khi lưu người dùng",
      );
    }
  };

  const handleResetPassword = (record) => {
    setEditingRecord(record);
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  const handlePasswordSubmit = async (values) => {
    try {
      await userAPI.resetPassword(editingRecord.id, values.password);
      notificationService.success("Đổi mật khẩu thành công");
      setPasswordModalVisible(false);
    } catch (error) {
      notificationService.error("Lỗi khi đổi mật khẩu");
    }
  };

  const handleManagePermissions = async (record) => {
    setPermissionUser(record);
    setWarehouseLoading(true);
    setPermissionModalVisible(true);
    // Setting defaults for modal
    permissionForm.setFieldsValue({
      quyen_xem: true,
      quyen_them: false,
      quyen_sua: false,
      quyen_xoa: false,
      quyen_chuyen_kho: false,
    });

    try {
      const response = await userAPI.getWarehouses(record.id);
      setUserWarehouses(response?.data || response || []);
    } catch (error) {
      notificationService.error(
        "Không thể lấy quyền kho. Nhớ thông báo cho Backend thêm API!",
      );
      setUserWarehouses([]);
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleAddWarehousePermission = async (values) => {
    try {
      setWarehouseLoading(true);
      await userAPI.addWarehousePermission(permissionUser.id, values);
      notificationService.success("Cấp quyền kho thành công");

      // Refresh list
      const response = await userAPI.getWarehouses(permissionUser.id);
      setUserWarehouses(response?.data || response || []);

      // Reset Select Kho ONLY in form
      permissionForm.setFieldsValue({
        ma_kho: undefined,
      });
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi khi cấp quyền",
      );
    } finally {
      setWarehouseLoading(false);
    }
  };

  const handleRemoveWarehousePermission = async (ma_kho) => {
    try {
      setWarehouseLoading(true);
      await userAPI.removeWarehousePermission(permissionUser.id, ma_kho);
      notificationService.success("Đã xóa quyền kho");

      // Refresh list
      const response = await userAPI.getWarehouses(permissionUser.id);
      setUserWarehouses(response?.data || response || []);
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi khi xóa quyền",
      );
    } finally {
      setWarehouseLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!debouncedSearchText) return true;
    const search = debouncedSearchText.toLowerCase();
    return (
      item.username?.toLowerCase().includes(search) ||
      item.ho_ten?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search)
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
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
      width: 120,
      render: (text) => <strong className="text-gray-800">{text}</strong>,
    },
    {
      title: "Họ tên",
      dataIndex: "ho_ten",
      key: "ho_ten",
      width: 180,
    },
    {
      title: "Vai trò",
      dataIndex: "vai_tro",
      key: "vai_tro",
      width: 150,
      render: (val, record) => (
        <Tag
          color={USER_ROLE_COLORS[val] || "blue"}
          className="rounded-full px-3 py-1 font-medium border-0"
        >
          {record.ten_vai_tro || USER_ROLE_LABELS[val] || val}
        </Tag>
      ),
    },
    {
      title: "Kho mặc định",
      dataIndex: "ten_kho",
      key: "ten_kho",
      width: 150,
      render: (val, record) => val || record.ma_kho || "Toàn hệ thống",
    },
    {
      title: "Trạng thái",
      key: "status_toggle",
      width: 120,
      align: "center",
      render: (_, record) => {
        const val =
          record.status !== undefined ? record.status : record.trang_thai;
        const isActive =
          val === true ||
          val === 1 ||
          val === "1" ||
          String(val).toLowerCase() === "true" ||
          String(val).toLowerCase() === "active";
        return (
          <Popconfirm
            title={isActive ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"}
            onConfirm={() => handleToggleStatus(record)}
          >
            <Tag
              color={isActive ? "green" : "red"}
              className="cursor-pointer m-0 border-0 rounded-md"
            >
              {isActive ? "Đang hoạt động" : "Đã khóa"}
            </Tag>
          </Popconfirm>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      fixed: isMobile ? false : "right",
      render: (_, record) => {
        const canEditUsers = authService.hasPermission("users", "edit");
        const menuItems = [
          canEditUsers && {
            key: "edit",
            label: "Chỉnh sửa",
            icon: <EditOutlined style={{ color: "#1890ff" }} />,
            onClick: () => handleEdit(record),
          },
          canEditUsers && {
            key: "password",
            label: "Đổi mật khẩu",
            icon: <KeyOutlined style={{ color: "#faad14" }} />,
            onClick: () => handleResetPassword(record),
          },
          canEditUsers && {
            key: "permission",
            label: "Phân quyền kho",
            icon: <HomeOutlined style={{ color: "#722ed1" }} />,
            onClick: () => handleManagePermissions(record),
          },
        ].filter(Boolean);
        if (menuItems.length === 0) return null;
        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="manage-page-container">
      <Card
        className="manage-card shadow-sm border-0 rounded-xl"
        styles={{ body: { padding: isMobile ? "12px" : "24px" } }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div style={{ marginBottom: isMobile ? 8 : 0 }}>
            <Title
              level={3}
              className="m-0 text-gray-800 flex items-center"
              style={{ fontSize: isMobile ? "1.25rem" : "1.75rem" }}
            >
              <UserOutlined className="mr-3 text-blue-500" />
              Danh sách Nhân viên
            </Title>
            <Text className="text-gray-500">
              Quản lý tài khoản và phân quyền cho nhân viên
            </Text>
          </div>

          <Space
            wrap
            size={isMobile ? 8 : 12}
            style={{
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "flex-start" : "flex-end",
            }}
          >
            <Input.Search
              placeholder="Tìm username, tên, email..."
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: isMobile ? "calc(100vw - 40px)" : 256 }}
              size="middle"
            />
            <div
              className="flex gap-2"
              style={{ width: isMobile ? "100%" : "auto" }}
            >
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                size="middle"
              />
              {authService.hasPermission("users", "create") && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  size="middle"
                  className="bg-blue-600"
                  block={isMobile}
                  style={{ flex: isMobile ? 1 : "initial" }}
                >
                  Thêm nhân viên
                </Button>
              )}
            </div>
          </Space>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 15,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          className="rounded-lg overflow-hidden border border-gray-100"
        />
      </Card>

      {/* Modal User Form */}
      <Modal
        title={
          <div className="text-lg font-bold text-gray-800">
            {editingRecord ? "Cập nhật người dùng" : "Thêm nhân viên mới"}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        destroyOnClose
        centered
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          className="mt-4"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label={
                  <span className="font-semibold text-gray-700">
                    Tên đăng nhập
                  </span>
                }
                rules={[{ required: true, message: "Nhập username" }]}
              >
                <Input
                  disabled={!!editingRecord}
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Ví dụ: nhatkhang"
                />
              </Form.Item>
            </Col>
            {!editingRecord && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label={
                    <span className="font-semibold text-gray-700">
                      Mật khẩu
                    </span>
                  }
                  rules={[
                    { required: true, message: "Nhập mật khẩu" },
                    { min: 6, message: "Ít nhất 6 ký tự" },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="******"
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="ho_ten"
            label={
              <span className="font-semibold text-gray-700">Họ và tên</span>
            }
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label={
                  <span className="font-semibold text-gray-700">Email</span>
                }
                rules={[{ type: "email", message: "Email không hợp lệ" }]}
              >
                <Input placeholder="example@motor.vn" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="dien_thoai"
                label={
                  <span className="font-semibold text-gray-700">
                    Điện thoại
                  </span>
                }
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại chỉ gồm 10-11 chữ số",
                  },
                ]}
              >
                <Input placeholder="0987654321" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="vai_tro"
                label={
                  <span className="font-semibold text-gray-700">Vai trò</span>
                }
                rules={[{ required: true, message: "Chọn vai trò" }]}
              >
                <Select placeholder="-- Chọn vai trò --">
                  {[
                    "ADMIN",
                    "BAN_HANG",
                    "KHO",
                    "KE_TOAN",
                    "QUAN_LY",
                    "KY_THUAT",
                  ].map((key) => (
                    <Select.Option key={key} value={key}>
                      {USER_ROLE_LABELS[key]}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="ma_kho"
                label={
                  <span className="font-semibold text-gray-700">
                    Kho mặc định
                  </span>
                }
              >
                <Select allowClear placeholder="-- Tất cả kho --">
                  {khoList.map((k) => (
                    <Select.Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => setModalVisible(false)}
              size="large"
              className="rounded-md"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-blue-600 rounded-md shadow-sm"
            >
              {editingRecord ? "Lưu thay đổi" : "Tạo tài khoản"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Password Reset */}
      <Modal
        title={
          <div className="text-lg font-bold text-gray-800">
            Đặt lại mật khẩu
          </div>
        }
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={400}
        centered
        destroyOnClose
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
          className="mt-4"
          size="large"
        >
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
            />
          </Form.Item>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setPasswordModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Warehouse Permissions */}
      <Modal
        title={
          <div className="text-lg font-bold text-gray-800 flex items-center mb-2">
            <HomeOutlined className="text-purple-600 mr-2" />
            Phân quyền Kho:{" "}
            <span className="text-blue-600 ml-1">
              {permissionUser?.ho_ten || permissionUser?.username}
            </span>
          </div>
        }
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        width={800}
        footer={null}
        destroyOnClose
        centered
      >
        <div className="mb-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
            <PlusOutlined className="mr-2" /> Cấp thêm quyền kho mới
          </h4>
          <Form
            form={permissionForm}
            layout="vertical"
            onFinish={handleAddWarehousePermission}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} md={16}>
                <Form.Item
                  name="ma_kho"
                  rules={[{ required: true, message: "Vui lòng chọn kho" }]}
                  className="mb-3"
                >
                  <Select
                    placeholder="-- Chọn kho để cấp quyền --"
                    size="middle"
                    options={khoList
                      .filter(
                        (k) =>
                          !userWarehouses.find((p) => p.ma_kho === k.ma_kho),
                      )
                      .map((k) => ({ label: k.ten_kho, value: k.ma_kho }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8} className="flex items-center mb-3">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  icon={<PlusOutlined />}
                  className="bg-purple-600 hover:bg-purple-500 w-full md:w-auto"
                >
                  Cấp quyền mới
                </Button>
              </Col>
            </Row>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2 bg-white p-3 rounded border border-gray-200">
              <div className="flex items-center">
                <Form.Item
                  name="quyen_xem"
                  valuePropName="checked"
                  className="mb-0"
                  noStyle
                >
                  <Switch
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EyeOutlined />}
                  />
                </Form.Item>
                <span className="ml-2 text-sm font-medium">Xem kho</span>
              </div>
              <div className="flex items-center">
                <Form.Item
                  name="quyen_them"
                  valuePropName="checked"
                  className="mb-0"
                  noStyle
                >
                  <Switch
                    checkedChildren={<AppstoreAddOutlined />}
                    unCheckedChildren={<AppstoreAddOutlined />}
                  />
                </Form.Item>
                <span className="ml-2 text-sm font-medium">Thêm hàng</span>
              </div>
              <div className="flex items-center">
                <Form.Item
                  name="quyen_sua"
                  valuePropName="checked"
                  className="mb-0"
                  noStyle
                >
                  <Switch
                    checkedChildren={<FormOutlined />}
                    unCheckedChildren={<FormOutlined />}
                  />
                </Form.Item>
                <span className="ml-2 text-sm font-medium">Sửa hàng</span>
              </div>
              <div className="flex items-center">
                <Form.Item
                  name="quyen_xoa"
                  valuePropName="checked"
                  className="mb-0"
                  noStyle
                >
                  <Switch
                    checkedChildren={<DeleteOutlined />}
                    unCheckedChildren={<DeleteOutlined />}
                  />
                </Form.Item>
                <span className="ml-2 text-sm font-medium">Xóa hàng</span>
              </div>
              <div className="flex items-center col-span-2 md:col-span-1">
                <Form.Item
                  name="quyen_chuyen_kho"
                  valuePropName="checked"
                  className="mb-0"
                  noStyle
                >
                  <Switch
                    checkedChildren={<SwapOutlined />}
                    unCheckedChildren={<SwapOutlined />}
                  />
                </Form.Item>
                <span className="ml-2 text-sm font-medium">Chuyển kho</span>
              </div>
            </div>
          </Form>
        </div>

        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
          Danh sách kho đã được cấp
        </h4>
        <Table
          dataSource={userWarehouses}
          rowKey="ma_kho"
          size="small"
          loading={warehouseLoading}
          pagination={false}
          className="border border-gray-100 rounded-lg overflow-hidden"
          columns={[
            {
              title: "Tên Kho",
              dataIndex: "ten_kho",
              key: "ten_kho",
              render: (text, record) => (
                <strong className="text-gray-800">
                  {text || record.ma_kho}
                </strong>
              ),
            },
            {
              title: "Q.Xem",
              dataIndex: "quyen_xem",
              align: "center",
              render: (v) =>
                v ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <StopOutlined className="text-gray-300" />
                ),
            },
            {
              title: "Q.Thêm",
              dataIndex: "quyen_them",
              align: "center",
              render: (v) =>
                v ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <StopOutlined className="text-gray-300" />
                ),
            },
            {
              title: "Q.Sửa",
              dataIndex: "quyen_sua",
              align: "center",
              render: (v) =>
                v ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <StopOutlined className="text-gray-300" />
                ),
            },
            {
              title: "Q.Xóa",
              dataIndex: "quyen_xoa",
              align: "center",
              render: (v) =>
                v ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <StopOutlined className="text-gray-300" />
                ),
            },
            {
              title: "Q.Chuyển",
              dataIndex: "quyen_chuyen_kho",
              align: "center",
              render: (v) =>
                v ? (
                  <CheckCircleOutlined className="text-green-500 text-lg" />
                ) : (
                  <StopOutlined className="text-gray-300" />
                ),
            },
            {
              title: "Thao tác",
              key: "action",
              align: "center",
              render: (_, record) => (
                <Popconfirm
                  title="Xóa quyền truy cập thuộc kho này?"
                  onConfirm={() =>
                    handleRemoveWarehousePermission(record.ma_kho)
                  }
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
      <style>{`
        .manage-page-container {
          padding: 16px;
          background: #f8fafc;
          min-height: 100vh;
        }
        @media (max-width: 640px) {
          .manage-page-container {
            padding: 8px 4px;
          }
          .ant-card-body {
            padding: 12px !important;
          }
          .ant-table-wrapper {
            margin-left: -4px;
            margin-right: -4px;
          }
          .ant-table-pagination.ant-pagination {
            margin: 16px 0 !important;
            justify-content: center !important;
          }
        }
        .manage-card {
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </div>
  );
};

export default UserManagePage;
