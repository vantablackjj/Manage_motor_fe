import React from "react";
import { Row, Col, Card, Tag, Typography, Button, Empty, Skeleton } from "antd";
import {
  EyeOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HomeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { TRANG_THAI_COLORS, TRANG_THAI_LABELS } from "../../../utils/constant";
import { formatService } from "../../../services";
import "./OrderKanban.css";

const { Text, Title } = Typography;

const OrderKanban = ({
  data = [],
  loading = false,
  onCardClick,
  customColumns,
  renderCardBody,
  baseRoute,
  idField = "id",
}) => {
  const navigate = useNavigate();

  // Mặc định cho danh sách giao dịch
  const defaultColumns = [
    { title: "Bản nháp", status: "NHAP" },
    { title: "Chờ duyệt", status: "GUI_DUYET" },
    { title: "Đã duyệt", status: "DA_DUYET" },
    {
      title: "Đang xử lý",
      status: ["DANG_NHAP_KHO", "DANG_GIAO", "CHO_DUYET_GIAO"],
    },
    { title: "Hoàn thành", status: ["DA_GIAO", "HOAN_THANH", "DA_THANH_TOAN"] },
  ];

  const columns = customColumns || defaultColumns;

  const getOrdersByStatus = (status) => {
    if (Array.isArray(status)) {
      return data.filter((item) => status.includes(item.trang_thai));
    }
    return data.filter((item) => item.trang_thai === status);
  };

  const handleCardClick = (item) => {
    if (onCardClick) {
      onCardClick(item);
    } else if (baseRoute) {
      navigate(`${baseRoute}/${item[idField]}`);
    }
  };

  const renderDefaultBody = (item) => (
    <div className="card-body">
      <div className="info-row">
        {item.ma_ben_nhap && <UserOutlined />}
        {item.ma_kho_xuat && <HomeOutlined />}
        <Text className="customer-name ellipsis" style={{ marginLeft: 6 }}>
          {item.ten_ben_nhap || item.ten_ncc || item.ten_kho_xuat || "---"}
        </Text>
      </div>
      <div className="info-row">
        <SwapOutlined />
        <Text type="secondary" style={{ marginLeft: 6 }} className="ellipsis">
          Đến: {item.ten_ben_xuat || item.ten_kho || item.ten_kho_nhap || "---"}
        </Text>
      </div>
      <div className="info-row" style={{ marginTop: 4 }}>
        <ClockCircleOutlined />
        <Text type="secondary" style={{ marginLeft: 6 }}>
          {formatService.formatDate(
            item.ngay_dat_hang || item.ngay_chuyen_kho || item.created_at,
          )}
        </Text>
      </div>
    </div>
  );

  return (
    <div className="kanban-board-container" style={{ padding: "8px 0" }}>
      <Row
        gutter={[16, 16]}
        wrap={false}
        style={{ overflowX: "auto", paddingBottom: 16, minHeight: 600 }}
      >
        {columns.map((col) => {
          const orders = getOrdersByStatus(col.status);
          const statusKey = Array.isArray(col.status)
            ? col.status[0]
            : col.status;

          return (
            <Col key={statusKey} style={{ width: 320, flex: "0 0 320px" }}>
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <Title level={5} style={{ margin: 0, fontWeight: 700 }}>
                    {col.title}{" "}
                    <Tag
                      className="count-tag"
                      style={{
                        borderRadius: 10,
                        border: "none",
                        background: "rgba(0,0,0,0.06)",
                      }}
                    >
                      {orders.length}
                    </Tag>
                  </Title>
                </div>

                <div className="kanban-cards">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <Card key={i} size="small" style={{ marginBottom: 12 }}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                      </Card>
                    ))
                  ) : orders.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Trống"
                      style={{ marginTop: 40 }}
                    />
                  ) : (
                    orders.map((item) => (
                      <Card
                        key={item[idField] || item.so_phieu}
                        className="kanban-card premium-card hover-lift"
                        size="small"
                        hoverable
                        onClick={() => handleCardClick(item)}
                        style={{ marginBottom: 12, borderRadius: 12 }}
                      >
                        <div
                          className="card-header"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: 8,
                          }}
                        >
                          <Text strong className="order-code">
                            {item.so_phieu || item.so_don_hang || "---"}
                          </Text>
                          <Tag
                            color={TRANG_THAI_COLORS[item.trang_thai]}
                            style={{ borderRadius: 6, marginRight: 0 }}
                          >
                            {TRANG_THAI_LABELS[item.trang_thai] ||
                              formatService.formatTrangThai(item.trang_thai)}
                          </Tag>
                        </div>

                        {renderCardBody
                          ? renderCardBody(item)
                          : renderDefaultBody(item)}

                        <div
                          className="card-footer"
                          style={{
                            borderTop: "1px solid rgba(0,0,0,0.04)",
                            paddingTop: 8,
                            marginTop: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            strong
                            style={{
                              color: "var(--ant-primary-color)",
                              fontSize: 13,
                            }}
                          >
                            {formatService.formatCurrency(
                              item.tong_tien || item.thanh_tien || 0,
                            )}
                          </Text>
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            size="small"
                            className="view-btn"
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
