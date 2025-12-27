import React, { useState } from "react";
import { Form, Input, Button, Card, Checkbox } from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../services";
import { notificationService, storageService } from "../../../services";
import { authAPI } from "../../../api";
const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Get redirect path or default to dashboard

  // Load saved credentials if remember me was checked
  //   React.useEffect(() => {
  //     const savedCredentials = storageService.get("savedCredentials");
  //     if (savedCredentials) {
  //       form.setFieldsValue({
  //         username: savedCredentials.username,
  //         remember: true,
  //       });
  //     }
  //   }, [form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await authAPI.login(values.username, values.password);

      if (result.success) {
        // Save credentials if remember me is checked
        if (values.remember) {
          storageService.set("savedCredentials", {
            username: values.username,
          });
        } else {
          storageService.remove("savedCredentials");
        }
        authService.setTokens(
          result.data.access_token,
          result.data.refresh_token
        );
        authService.setUser(result.data.user);
        navigate("/", { replace: true });
        notificationService.loginSuccess();
      } else {
        notificationService.loginError(result.message);
      }
    } catch (error) {
      notificationService.loginError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          borderRadius: "12px",
        }}
        bodyStyle={{ padding: "40px" }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}
          >
            <LoginOutlined style={{ fontSize: "36px", color: "#fff" }} />
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f1f1f",
              margin: "0 0 8px 0",
            }}
          >
            Motor Management System
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>Hệ thống quản lý xe máy</p>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Tên đăng nhập"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#8c8c8c" }} />}
              placeholder="Mật khẩu"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a
                href="#forgot"
                style={{ color: "#667eea" }}
                onClick={(e) => {
                  e.preventDefault();
                  notificationService.info(
                    "Vui lòng liên hệ quản trị viên để được hỗ trợ"
                  );
                }}
              >
                Quên mật khẩu?
              </a>
            </div>
          </Form.Item>

          <Form.Item style={{ marginBottom: "16px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: "48px",
                fontSize: "16px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "8px",
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>

          {/* Demo Accounts Info */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: "#f5f5f5",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#595959",
            }}
          >
            <div style={{ marginBottom: "8px", fontWeight: "600" }}>
              🔐 Tài khoản demo:
            </div>
            <div>
              👤 Admin: <code>admin3</code> / <code>12345678</code>
            </div>
          </div>
        </Form>
      </Card>

      {/* Footer */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#fff",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        © 2025 Motor Management System. All rights reserved.
      </div>
    </div>
  );
};

export default LoginPage;
