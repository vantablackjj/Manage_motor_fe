import React from "react";
import { Card, Descriptions, Avatar, Tag, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import { USER_ROLE_LABELS } from "../../../utils/constant";

const UserProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card
            cover={
              <div
                style={{
                  textAlign: "center",
                  padding: "24px",
                  background: "#f0f2f5",
                }}
              >
                <Avatar size={120} icon={<UserOutlined />} src={user.avatar} />
                <h2 style={{ marginTop: "16px" }}>
                  {user.ho_ten || user.username}
                </h2>
                <Tag color="blue">
                  {USER_ROLE_LABELS[user.vai_tro] || user.vai_tro}
                </Tag>
              </div>
            }
          >
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Email:</strong> {user.email || "Chưa cập nhật"}
            </p>
            <p>
              <strong>Điện thoại:</strong> {user.dien_thoai || "Chưa cập nhật"}
            </p>
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card title="Thông tin chi tiết">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Họ và tên">
                {user.ho_ten || "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                {USER_ROLE_LABELS[user.vai_tro] || user.vai_tro}
              </Descriptions.Item>
              <Descriptions.Item label="Kho trực thuộc">
                {user.ten_kho || user.ma_kho || "Tất cả"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tham gia">
                {user.created_at || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={user.status ? "green" : "red"}>
                  {user.status ? "Hoạt động" : "Khóa"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
