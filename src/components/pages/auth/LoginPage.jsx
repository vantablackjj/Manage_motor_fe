import React, { useState } from "react";
import { Form, Input, Button, Card, Checkbox, Typography, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  InfoCircleFilled,
  ArrowRightOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { notificationService, storageService } from "../../../services";
import { authAPI } from "../../../api";
import { useResponsive } from "../../../hooks/useResponsive";
import { useAuth } from "../../../contexts/AuthContext";

const { Title, Text, Link } = Typography;

const LoginPage = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // For demo purposes, we accept the credentials in the image too
      const username =
        values.username === "admin_demo" ? "admin3" : values.username;
      const password =
        values.password === "motor2024" ? "12345678" : values.password;

      const result = await authAPI.login(username, password);

      if (result.success) {
        if (values.remember) {
          storageService.set("savedCredentials", { username: values.username });
        } else {
          storageService.remove("savedCredentials");
        }

        login(result.data.user, result.data.access_token);
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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top left, #eef2f7 0%, #ffffff 100%)",
        padding: "20px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: "460px",
          overflow: "hidden",
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 20px 50px rgba(0, 50, 100, 0.08)",
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Blue Header Section */}
        <div
          style={{
            background: "#1890ff",
            backgroundSize: "20px 20px",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            padding: "48px 24px",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
            }}
          >
            <ControlOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
          </div>
        </div>

        {/* Form Section */}
        <div style={{ padding: "40px", backgroundColor: "#fff" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Title
              level={2}
              style={{ margin: 0, fontWeight: 700, letterSpacing: "-0.5px" }}
            >
              Motor Manage
            </Title>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Efficient engine monitoring & diagnostic suite
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              label={
                <Text strong style={{ fontSize: "12px", color: "#434343" }}>
                  Username
                </Text>
              }
              name="username"
              rules={[
                { required: true, message: "Please enter your username" },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined
                    style={{ color: "#bfbfbf", marginRight: "8px" }}
                  />
                }
                placeholder="Enter your username"
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <Text strong style={{ fontSize: "12px", color: "#434343" }}>
                  Password
                </Text>
              }
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    style={{ color: "#bfbfbf", marginRight: "8px" }}
                  />
                }
                placeholder="••••••••"
                style={{
                  borderRadius: "8px",
                  height: "48px",
                  backgroundColor: "#f9fafb",
                }}
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ fontSize: "13px" }}>Remember me</Checkbox>
              </Form.Item>
              <Link
                style={{ fontSize: "13px", fontWeight: 600 }}
                onClick={() =>
                  notificationService.info("Contact support to reset password")
                }
              >
                Forgot password?
              </Link>
            </div>

            <Form.Item style={{ marginBottom: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                icon={<ArrowRightOutlined />}
                style={{
                  height: "52px",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.35)",
                }}
              >
                Sign In
              </Button>
            </Form.Item>

            {/* Demo Account Callout */}
            <div
              style={{
                backgroundColor: "#f0f7ff",
                border: "1px solid #e1f0ff",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
              }}
            >
              <InfoCircleFilled
                style={{ color: "#1890ff", marginTop: "4px" }}
              />
              <div>
                <Text
                  strong
                  style={{
                    fontSize: "11px",
                    color: "#1890ff",
                    textTransform: "uppercase",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  Demo Account
                </Text>
                <div style={{ display: "flex", gap: "24px", fontSize: "12px" }}>
                  <div>
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: "10px" }}
                    >
                      Username
                    </Text>
                    <Text strong>admin_demo</Text>
                  </div>
                  <div>
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: "10px" }}
                    >
                      Password
                    </Text>
                    <Text strong>motor2024</Text>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        </div>
      </Card>

      {/* Footer Links */}
      <Space size="large" style={{ marginTop: "32px" }}>
        <Link style={{ color: "#8c8c8c", fontSize: "12px" }}>
          System Status
        </Link>
        <Link style={{ color: "#8c8c8c", fontSize: "12px" }}>
          Privacy Policy
        </Link>
        <Link style={{ color: "#8c8c8c", fontSize: "12px" }}>
          Contact Support
        </Link>
      </Space>
    </div>
  );
};

export default LoginPage;
