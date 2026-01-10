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
  Row,
  Col,
  Select,
  Switch,
  List,
  Typography,
  Tooltip,
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
} from "@ant-design/icons";
import { userAPI, khoAPI } from "../../../api";
import { notificationService, authService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import { USER_ROLE_LABELS, USER_ROLES } from "../../../utils/constant";

const { Text } = Typography;

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

  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    fetchData();
    fetchKhoList();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setData(response?.data || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const fetchKhoList = async () => {
    try {
      const response = await khoAPI.getAll();
      setKhoList(response?.data || []);
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
      await userAPI.toggleStatus(record.id);
      notificationService.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Không thể cập nhật trạng thái");
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
        error?.response?.data?.message || "Lỗi khi lưu người dùng"
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
    setLoading(true);
    try {
      const response = await userAPI.getPermissions(record.id);
      setUserPermissions(response?.data || []);
      setPermissionModalVisible(true);
    } catch (error) {
      notificationService.error("Không thể lấy quyền kho");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPermission = async (values) => {
    try {
      await userAPI.updatePermissions(permissionUser.id, [
        ...userPermissions,
        { ...values, ma_kho: values.ma_kho },
      ]);
      notificationService.success("Gán quyền thành công");
      handleManagePermissions(permissionUser); // Refresh permissions list
      permissionForm.resetFields();
    } catch (error) {
      notificationService.error("Lỗi khi gán quyền");
    }
  };

  const handleRemovePermission = async (ma_kho) => {
    try {
      const newPermissions = userPermissions.filter((p) => p.ma_kho !== ma_kho);
      await userAPI.updatePermissions(permissionUser.id, newPermissions);
      notificationService.success("Đã xóa quyền kho");
      handleManagePermissions(permissionUser);
    } catch (error) {
      notificationService.error("Lỗi khi xóa quyền");
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.username?.toLowerCase().includes(search) ||
      item.ho_ten?.toLowerCase().includes(search) ||
      item.email?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Họ tên",
      dataIndex: "ho_ten",
      key: "ho_ten",
      width: 180,
      ellipsis: true,
    },
    !isMobile && {
      title: "Vai trò",
      dataIndex: "vai_tro",
      key: "vai_tro",
      width: 150,
      render: (val) => <Tag color="blue">{USER_ROLE_LABELS[val] || val}</Tag>,
    },
    !isMobile && {
      title: "Kho mặc định",
      dataIndex: "ten_kho",
      key: "ten_kho",
      width: 150,
      render: (val) => val || "Toàn hệ thống",
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 120,
      align: "center",
      render: (val, record) => (
        <Tooltip title={val ? "Đang hoạt động" : "Đã khóa"}>
          <Switch
            checked={val}
            size="small"
            onChange={() => handleToggleStatus(record)}
            checkedChildren={<CheckCircleOutlined />}
            unCheckedChildren={<StopOutlined />}
          />
        </Tooltip>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 220,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {!isMobile && "Sửa"}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            {!isMobile && "Mật khẩu"}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<HomeOutlined />}
            onClick={() => handleManagePermissions(record)}
          >
            {!isMobile && "Quyền kho"}
          </Button>
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card size="small">
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[8, 16]}>
            <Col xs={24} sm={16}>
              <h2
                style={{ margin: 0, fontSize: isMobile ? "1.25rem" : "1.5rem" }}
              >
                <Space wrap>
                  <UserOutlined />
                  <span>Quản lý người dùng</span>
                </Space>
              </h2>
            </Col>
            <Col
              xs={24}
              sm={8}
              style={{ textAlign: isMobile ? "left" : "right" }}
            >
              <Space wrap>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  size="small"
                >
                  Tải lại
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  size="small"
                >
                  Thêm mới
                </Button>
              </Space>
            </Col>
          </Row>

          <div style={{ marginTop: 16 }}>
            <Input.Search
              placeholder="Tìm username, tên, email..."
              allowClear
              onSearch={setSearchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%", maxWidth: isMobile ? "100%" : 300 }}
              size="small"
            />
          </div>
        </div>

        {isMobile ? (
          <List
            dataSource={filteredData}
            loading={loading}
            pagination={{
              pageSize: 10,
              size: "small",
            }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(item)}
                  />,
                  <Button
                    type="link"
                    icon={<KeyOutlined />}
                    onClick={() => handleResetPassword(item)}
                  />,
                  <Button
                    type="link"
                    icon={<HomeOutlined />}
                    onClick={() => handleManagePermissions(item)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <UserOutlined
                      style={{
                        fontSize: 24,
                        padding: 8,
                        background: "#e6f7ff",
                        borderRadius: "50%",
                      }}
                    />
                  }
                  title={<strong>{item.username}</strong>}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">{item.ho_ten}</Text>
                      <Space>
                        <Tag color="blue" style={{ margin: 0 }}>
                          {USER_ROLE_LABELS[item.vai_tro]}
                        </Tag>
                        <Switch
                          checked={item.trang_thai}
                          size="small"
                          onChange={() => handleToggleStatus(item)}
                        />
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1000 }}
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng: ${total}`,
            }}
          />
        )}
      </Card>

      {/* Modal User Form */}
      <Modal
        title={editingRecord ? "Cập nhật người dùng" : "Thêm người dùng mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={isMobile ? "100%" : 600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Nhập username" }]}
              >
                <Input disabled={!!editingRecord} prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            {!editingRecord && (
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: "Nhập mật khẩu" }]}
                >
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="ho_ten"
            label="Họ tên"
            rules={[{ required: true, message: "Nhập họ tên" }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dien_thoai" label="Điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vai_tro"
                label="Vai trò"
                rules={[{ required: true }]}
              >
                <Select>
                  {Object.entries(USER_ROLE_LABELS).map(([key, label]) => (
                    <Select.Option key={key} value={key}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ma_kho" label="Kho mặc định">
                <Select allowClear placeholder="Tất cả kho">
                  {khoList.map((k) => (
                    <Select.Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            style={{ marginBottom: 0, textAlign: "right", marginTop: 16 }}
          >
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Password Reset */}
      <Modal
        title="Đặt lại mật khẩu"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordSubmit}
        >
          <Form.Item
            name="password"
            label="Mật khẩu mới"
            rules={[{ required: true, min: 6 }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            name="confirm"
            label="Xác nhận mật khẩu"
            dependencies={["password"]}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setPasswordModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Đổi mật khẩu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Warehouse Permissions */}
      <Modal
        title={
          <span>
            <HomeOutlined /> Quyền kho:{" "}
            <strong>{permissionUser?.username}</strong>
          </span>
        }
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        width={700}
        footer={null}
      >
        <div style={{ marginBottom: 24 }}>
          <Text strong>Thêm quyền kho mới</Text>
          <Form
            form={permissionForm}
            layout="inline"
            onFinish={handleAddPermission}
            style={{ marginTop: 8 }}
          >
            <Form.Item
              name="ma_kho"
              rules={[{ required: true, message: "Chọn kho" }]}
            >
              <Select
                placeholder="Chọn kho"
                style={{ width: 200 }}
                size="small"
              >
                {khoList
                  .filter(
                    (k) => !userPermissions.some((p) => p.ma_kho === k.ma_kho)
                  )
                  .map((k) => (
                    <Select.Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                htmlType="submit"
                size="small"
              >
                Thêm
              </Button>
            </Form.Item>
          </Form>
        </div>

        <Table
          dataSource={userPermissions}
          rowKey="ma_kho"
          size="small"
          pagination={false}
          columns={[
            { title: "Kho", dataIndex: "ten_kho", key: "ten_kho" },
            {
              title: "Xem",
              dataIndex: "quyen_xem",
              render: (v) => <Switch size="small" checked={v} disabled />,
            },
            {
              title: "Thêm/Sửa",
              dataIndex: "quyen_them",
              render: (v, record) => (
                <Switch
                  size="small"
                  checked={record.quyen_them || record.quyen_sua}
                  onChange={(checked) => {
                    const updated = userPermissions.map((p) =>
                      p.ma_kho === record.ma_kho
                        ? { ...p, quyen_them: checked, quyen_sua: checked }
                        : p
                    );
                    userAPI
                      .updatePermissions(permissionUser.id, updated)
                      .then(() => {
                        notificationService.success(
                          "Cập nhật quyền thành công"
                        );
                        setUserPermissions(updated);
                      });
                  }}
                />
              ),
            },
            {
              title: "Xóa",
              dataIndex: "quyen_xoa",
              render: (v, record) => (
                <Switch
                  size="small"
                  checked={v}
                  onChange={(checked) => {
                    const updated = userPermissions.map((p) =>
                      p.ma_kho === record.ma_kho
                        ? { ...p, quyen_xoa: checked }
                        : p
                    );
                    userAPI
                      .updatePermissions(permissionUser.id, updated)
                      .then(() => {
                        notificationService.success(
                          "Cập nhật quyền thành công"
                        );
                        setUserPermissions(updated);
                      });
                  }}
                />
              ),
            },
            {
              title: "Thao tác",
              key: "action",
              render: (_, record) => (
                <Popconfirm
                  title="Xóa quyền kho này?"
                  onConfirm={() => handleRemovePermission(record.ma_kho)}
                >
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  />
                </Popconfirm>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default UserManagePage;
