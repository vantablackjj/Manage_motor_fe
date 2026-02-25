import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Tag,
  Divider,
  List,
  Modal,
  Space,
  Typography,
} from "antd";
import {
  UserOutlined,
  SaveOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { USER_ROLE_LABELS } from "../../../utils/constant";
import { authAPI } from "../../../api/auth.config";
import { notificationService } from "../../../services";

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        setProfileData(res.data);
        form.setFieldsValue({
          username: res.data.username,
          ho_ten: res.data.ho_ten,
          email: res.data.email,
          dien_thoai: res.data.dien_thoai,
          vai_tro: USER_ROLE_LABELS[res.data.vai_tro] || res.data.vai_tro,
        });

        // Cập nhật lại context user nếu cần thiết
        if (setUser && typeof setUser === "function") {
          setUser((prev) => ({ ...prev, ...res.data }));
        }
      }
    } catch (error) {
      notificationService.error(
        error.response?.data?.message || "Lỗi tải thông tin cá nhân",
      );
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProfile = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ho_ten: values.ho_ten,
        email: values.email,
        dien_thoai: values.dien_thoai,
      };
      const res = await authAPI.updateMe(payload);
      if (res.success) {
        notificationService.success("Cập nhật thông tin thành công!");
        fetchProfile();
      }
    } catch (error) {
      notificationService.error(
        error.response?.data?.message || "Cập nhật thất bại",
      );
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (values) => {
    try {
      const payload = {
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      };
      const res = await authAPI.changePassword(payload);
      if (res.success) {
        notificationService.success("Đổi mật khẩu thành công!");
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      }
    } catch (error) {
      notificationService.error(
        error.response?.data?.message || "Đổi mật khẩu thất bại",
      );
    }
  };

  if (!profileData && loading) {
    return <div style={{ padding: 24 }}>Đang tải...</div>;
  }

  return (
    <div
      style={{ padding: "16px 8px" }}
      className="w-full h-full bg-slate-50 min-h-screen"
    >
      <Row gutter={[24, 24]} justify="center">
        {/* Left Column: Avatar & Basic Info */}
        <Col xs={24} md={8} lg={6}>
          <Card
            className="shadow-sm rounded-lg"
            styles={{ body: { padding: 0 } }}
          >
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white rounded-t-lg border-b border-gray-100">
              <div className="w-24 h-24 mb-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl shadow-md border-4 border-white">
                <UserOutlined />
              </div>
              <Title level={4} style={{ margin: 0 }} className="text-gray-800">
                {profileData?.ho_ten || profileData?.username}
              </Title>
              <Tag
                color="geekblue"
                className="mt-2 text-sm px-3 py-1 rounded-full font-medium"
              >
                {USER_ROLE_LABELS[profileData?.vai_tro] || profileData?.vai_tro}
              </Tag>
            </div>

            <div className="p-4 space-y-4">
              <Button
                type="default"
                danger
                icon={<LockOutlined />}
                block
                className="rounded-md font-medium"
                onClick={() => setIsPasswordModalVisible(true)}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </Card>

          {/* Kho Phân Quyền */}
          <Card
            title={
              <span className="text-gray-700 font-semibold flex items-center">
                <ShopOutlined className="mr-2" /> Kho được phân quyền
              </span>
            }
            className="mt-6 shadow-sm rounded-lg border border-gray-100"
            styles={{
              header: { padding: "12px 16px", minHeight: "auto" },
              body: { padding: "8px 16px" },
            }}
            headStyle={{
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "var(--bg-secondary, #fafafa)",
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={profileData?.warehouse_permissions || []}
              renderItem={(item) => (
                <List.Item className="border-b last:border-b-0 py-3">
                  <List.Item.Meta
                    avatar={
                      <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center">
                        <ShopOutlined />
                      </div>
                    }
                    title={
                      <span className="font-medium text-gray-800">
                        {item.ten_kho}
                      </span>
                    }
                    description={
                      <span className="text-xs text-gray-500">
                        Mã kho: {item.ma_kho}
                      </span>
                    }
                  />
                  {item.quyen_xem && (
                    <Tag color="green" className="m-0 border-0">
                      Xem
                    </Tag>
                  )}
                </List.Item>
              )}
              locale={{ emptyText: "Không có kho nào được phân quyền" }}
            />
          </Card>
        </Col>

        {/* Right Column: Edit Form */}
        <Col xs={24} md={16} lg={14}>
          <Card
            title={
              <span className="text-gray-700 font-semibold text-lg">
                Thông tin tài khoản
              </span>
            }
            className="shadow-sm rounded-lg border-0"
            styles={{ header: { borderBottom: "1px solid #f0f0f0" } }}
            loading={loading}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onUpdateProfile}
              requiredMark="optional"
              size="large"
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-600">
                        Tên đăng nhập
                      </span>
                    }
                    name="username"
                  >
                    <Input
                      disabled
                      prefix={<UserOutlined className="text-gray-400" />}
                      className="bg-gray-50"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-600">
                        Vai trò hệ thống
                      </span>
                    }
                    name="vai_tro"
                  >
                    <Input disabled className="bg-gray-50 text-gray-700" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider className="my-2 border-gray-100" />

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Họ và tên
                      </span>
                    }
                    name="ho_ten"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ tên" },
                    ]}
                  >
                    <Input placeholder="Nhập họ và tên" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Email liên hệ
                      </span>
                    }
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không đúng định dạng" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="example@gmail.com"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Số điện thoại
                      </span>
                    }
                    name="dien_thoai"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại chỉ gồm 10-11 chữ số",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="0987654321"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-4 flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={saving}
                  className="bg-blue-600 hover:bg-blue-500 rounded-md font-medium px-6"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* Đổi mật khẩu Modal */}
      <Modal
        title={
          <div className="flex items-center text-lg font-semibold text-gray-800">
            <LockOutlined className="text-blue-500 mr-2" />
            Đổi mật khẩu
          </div>
        }
        open={isPasswordModalVisible}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        centered
        width={400}
        className="rounded-lg overflow-hidden"
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={onChangePassword}
          className="mt-4"
          size="middle"
        >
          <Form.Item
            label={<span className="font-medium">Mật khẩu hiện tại</span>}
            name="old_password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu hiện tại" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Mật khẩu mới</span>}
            name="new_password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Xác nhận mật khẩu mới</span>}
            name="confirm_password"
            dependencies={["new_password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("new_password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Hai mật khẩu không khớp nhau!"),
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" size="large" />
          </Form.Item>

          <Form.Item className="mb-0 mt-6 flex justify-end">
            <Space>
              <Button
                onClick={() => setIsPasswordModalVisible(false)}
                className="rounded-md"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-600 hover:bg-blue-500 rounded-md"
              >
                Xác nhận đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfilePage;
