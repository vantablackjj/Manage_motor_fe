import React from "react";
import { Row, Col, Card, Tag, Typography, Button, Space, Empty } from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TRANG_THAI_COLORS } from "../../../utils/constant";
import { formatService } from "../../../services";
import "./OrderKanban.css";

const { Text, Title } = Typography;

const OrderKanban = ({ data, loading }) => {
  const navigate = useNavigate();

  const columns = [
    { title: "Bản nháp", status: "NHAP" },
    { title: "Chờ duyệt", status: "GUI_DUYET" },
    { title: "Đã duyệt", status: "DA_DUYET" },
    { title: "Đang giao", status: "DANG_GIAO" },
    { title: "Hoàn thành", status: "DA_GIAO" },
  ];

  const getOrdersByStatus = (status) => {
    return data.filter((item) => item.trang_thai === status);
  };

  return (
    <div className="kanban-board">
      <Row
        gutter={[16, 16]}
        wrap={false}
        style={{ overflowX: "auto", paddingBottom: 16, minHeight: 500 }}
      >
        {columns.map((col) => {
          const orders = getOrdersByStatus(col.status);
          return (
            <Col key={col.status} style={{ width: 300, flex: "0 0 300px" }}>
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <Title level={5} style={{ margin: 0 }}>
                    {col.title} <Tag className="count-tag">{orders.length}</Tag>
                  </Title>
                </div>
                <div className="kanban-cards">
                  {orders.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Trống"
                      style={{ marginTop: 40 }}
                    />
                  ) : (
                    orders.map((order) => (
                      <Card
                        key={order.id}
                        className="kanban-card fade-in"
                        size="small"
                        hoverable
                        onClick={() => navigate(`/sales/orders/${order.id}`)}
                      >
                        <div className="card-header">
                          <Text strong className="order-code">
                            {order.so_don_hang}
                          </Text>
                          <Tag
                            color={TRANG_THAI_COLORS[order.trang_thai]}
                            size="small"
                          >
                            {formatService.formatTrangThai(order.trang_thai)}
                          </Tag>
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <UserOutlined />{" "}
                            <Text className="customer-name">
                              {order.ten_ben_nhap || "K/H lẻ"}
                            </Text>
                          </div>
                          <div className="info-row">
                            <ClockCircleOutlined />{" "}
                            <Text type="secondary">
                              {formatService.formatDate(order.created_at)}
                            </Text>
                          </div>
                        </div>

                        <div className="card-footer">
                          <Text strong className="order-amount">
                            {formatService.formatCurrency(
                              order.thanh_tien || 0,
                            )}
                          </Text>
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sales/orders/${order.id}`);
                            }}
                          />
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default OrderKanban;
