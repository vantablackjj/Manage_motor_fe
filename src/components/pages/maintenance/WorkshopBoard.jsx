import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Modal,
  Table,
  Form,
  Input,
  Popconfirm,
} from "antd";
import {
  ToolOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  SettingOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import MotorcycleIcon from "../../common/MotorcycleIcon";
import { useNavigate } from "react-router-dom";
import { maintenanceAPI } from "../../../api";
import {
  BAN_NANG_TRANG_THAI,
  BAN_NANG_TRANG_THAI_LABELS,
  BAN_NANG_TRANG_THAI_COLORS,
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
} from "../../../utils/constant";
import { useAuth } from "../../../contexts/AuthContext";
import { formatService, notificationService } from "../../../services";

const { Title, Text } = Typography;

const WorkshopBoard = () => {
  const navigate = useNavigate();
  const { user, activeWarehouse, canManageAllWarehouses } = useAuth();
  const [loading, setLoading] = useState(false);
  const [lifts, setLifts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Tự động làm mới mỗi 30 giây
    return () => clearInterval(interval);
  }, [user?.ma_kho, activeWarehouse]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await maintenanceAPI.getWorkshopBoard({
        ma_kho: canManageAllWarehouses() ? activeWarehouse : user?.ma_kho,
      });
      setLifts(res.data || []);
      setLastUpdated(new Date());
    } catch (error) {
      notificationService.error("Lỗi tải dữ liệu bàn nâng");
    } finally {
      setLoading(false);
    }
  };

  const renderLiftCard = (lift) => {
    const isBusy = lift.trang_thai === BAN_NANG_TRANG_THAI.DANG_SUA;
    const statusColor = BAN_NANG_TRANG_THAI_COLORS[lift.trang_thai];

    return (
      <Card
        hoverable
        className="workshop-card"
        style={{
          borderRadius: 12,
          overflow: "hidden",
          borderTop: `6px solid ${statusColor}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          height: "100%",
        }}
        onClick={() => {
          if (lift.ma_phieu) {
            navigate(`/maintenance/${lift.ma_phieu}`);
          } else {
            navigate("/maintenance/create", {
              state: { ma_ban_nang: lift.ma_ban_nang },
            });
          }
        }}
        actions={[
          <Button
            type="link"
            icon={isBusy ? <ArrowRightOutlined /> : <PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn sự kiện click lan lên Card
              if (lift.ma_phieu) {
                navigate(`/maintenance/${lift.ma_phieu}`);
              } else {
                navigate("/maintenance/create", {
                  state: { ma_ban_nang: lift.ma_ban_nang },
                });
              }
            }}
          >
            {isBusy ? "Chi tiết" : "Tiếp nhận"}
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            {lift.ten_ban_nang}
          </Title>
          <Tag color={isBusy ? "red" : "green"}>
            {BAN_NANG_TRANG_THAI_LABELS[lift.trang_thai]}
          </Tag>
        </div>

        {isBusy ? (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div
              style={{
                background: "#f5f5f5",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              <Space>
                <Badge status="processing" color="blue" />
                <Text strong style={{ color: "#1890ff" }}>
                  {lift.ma_phieu}
                </Text>
              </Space>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MotorcycleIcon style={{ color: "#8c8c8c" }} />
              <Text strong>{lift.ma_serial}</Text>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <UserOutlined style={{ color: "#8c8c8c" }} />
              <Text>KTV: {lift.ten_ktv || "Chưa phân công"}</Text>
            </div>

            <Row gutter={8}>
              <Col span={12}>
                <div
                  style={{
                    background: "#fffbe6",
                    padding: 4,
                    borderRadius: 4,
                    textAlign: "center",
                    border: "1px solid #ffe58f",
                  }}
                >
                  <Text type="secondary" size="small">
                    Phụ tùng
                  </Text>
                  <br />
                  <Text strong>
                    {formatService.formatCurrency(lift.tien_phu_tung)}
                  </Text>
                </div>
              </Col>
              <Col span={12}>
                <div
                  style={{
                    background: "#e6f7ff",
                    padding: 4,
                    borderRadius: 4,
                    textAlign: "center",
                    border: "1px solid #91d5ff",
                  }}
                >
                  <Text type="secondary" size="small">
                    Tiền công
                  </Text>
                  <br />
                  <Text strong>
                    {formatService.formatCurrency(lift.tien_cong)}
                  </Text>
                </div>
              </Col>
            </Row>
          </Space>
        ) : (
          <div
            style={{
              height: 160,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: 0.5,
            }}
          >
            <ToolOutlined style={{ fontSize: 48, marginBottom: 12 }} />
            <Text italic>Hiện đang trống</Text>
          </div>
        )}
      </Card>
    );
  };

  const [isManageModalVisible, setIsManageModalVisible] = useState(false);
  const [manageForm] = Form.useForm();
  const [savingLift, setSavingLift] = useState(false);

  const handleAddLift = async (values) => {
    setSavingLift(true);
    try {
      const ma_kho = canManageAllWarehouses() ? activeWarehouse : user?.ma_kho;
      await maintenanceAPI.addBanNang({ ...values, ma_kho });
      notificationService.success("Thêm bàn nâng thành công");
      manageForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi thêm bàn nâng",
      );
    } finally {
      setSavingLift(false);
    }
  };

  const handleDeleteLift = async (id) => {
    try {
      await maintenanceAPI.deleteBanNang(id);
      notificationService.success("Xóa bàn nâng thành công");
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi xóa bàn nâng",
      );
    }
  };

  const manageColumns = [
    { title: "Mã bàn nâng", dataIndex: "ma_ban_nang", key: "ma_ban_nang" },
    { title: "Tên bàn nâng", dataIndex: "ten_ban_nang", key: "ten_ban_nang" },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      render: (val) => (
        <Tag color={BAN_NANG_TRANG_THAI_COLORS[val]}>
          {BAN_NANG_TRANG_THAI_LABELS[val]}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Xác nhận xóa bàn nâng?"
            onConfirm={() => handleDeleteLift(record.id)}
            disabled={record.trang_thai !== "TRONG"}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={record.trang_thai !== "TRONG"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ToolOutlined /> Bảng Điều Hành Xưởng Dịch Vụ
          </Title>
          <Text type="secondary">
            Theo dõi tiến độ sửa chữa tại các bàn nâng thời gian thực
          </Text>
        </Col>
        <Col>
          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Cập nhật lúc: {formatService.formatTime(lastUpdated)}
            </Text>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setIsManageModalVisible(true)}
            >
              Quản lý Bàn nâng
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/maintenance/create")}
            >
              Tiếp nhận xe mới
            </Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {lifts.length === 0 ? (
          <Card style={{ borderRadius: 16 }}>
            <Empty description="Không có dữ liệu bàn nâng" />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {lifts.map((lift) => (
              <Col key={lift.ma_ban_nang} xs={24} sm={12} lg={8} xl={6}>
                {renderLiftCard(lift)}
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      <Modal
        title="Quản lý danh sách bàn nâng"
        open={isManageModalVisible}
        onCancel={() => setIsManageModalVisible(false)}
        footer={null}
        width={700}
      >
        <Card
          size="small"
          title="Thêm bàn nâng mới"
          style={{ marginBottom: 16 }}
        >
          <Form
            form={manageForm}
            layout="inline"
            onFinish={handleAddLift}
            style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
          >
            <Form.Item
              name="ma_ban_nang"
              rules={[{ required: true, message: "Nhập mã BN" }]}
            >
              <Input placeholder="Mã (vd: BN_05)" />
            </Form.Item>
            <Form.Item
              name="ten_ban_nang"
              rules={[{ required: true, message: "Nhập tên" }]}
            >
              <Input placeholder="Tên bàn nâng" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={savingLift}
              >
                Thêm
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Table
          dataSource={lifts}
          columns={manageColumns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 5 }}
        />
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            * Chỉ có thể xóa bàn nâng ở trạng thái TRỐNG.
          </Text>
        </div>
      </Modal>

      <style>{`
        .workshop-card {
          transition: all 0.3s ease;
        }
        .workshop-card:hover {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
};

export default WorkshopBoard;
