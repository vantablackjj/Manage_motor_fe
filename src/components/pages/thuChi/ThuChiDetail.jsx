import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Timeline,
  Typography,
  Divider,
  Result,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { thuChiAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import { TRANG_THAI_COLORS, LOAI_THU_CHI } from "../../../utils/constant";

const { Title, Text } = Typography;

const ThuChiDetail = () => {
  const { so_phieu } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Redirect if so_phieu is invalid
    if (!so_phieu || so_phieu === "undefined" || so_phieu === "null") {
      notificationService.warning("Số phiếu không hợp lệ");
      navigate("/thu-chi");
      return;
    }
    fetchData();
  }, [so_phieu]);

  const fetchData = async () => {
    if (!so_phieu || so_phieu === "undefined" || so_phieu === "null") {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await thuChiAPI.getBySoPhieu(so_phieu);
      setData(res.data || res || null);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết phiếu thu chi");
    } finally {
      setLoading(false);
    }
  };

  const handleSendApproval = async () => {
    try {
      await thuChiAPI.guiDuyet(so_phieu);
      notificationService.success("Đã gửi duyệt");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi gửi duyệt");
    }
  };

  const handleApprove = async () => {
    try {
      await thuChiAPI.pheDuyet(so_phieu);
      notificationService.success("Đã phê duyệt phiếu");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi phê duyệt");
    }
  };

  const handleCancel = async (values) => {
    try {
      await thuChiAPI.huy(so_phieu, { ly_do: values.ly_do });
      notificationService.success("Đã hủy phiếu");
      setCancelModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi hủy phiếu");
    }
  };

  if (!data && !loading)
    return <Result status="404" title="Không tìm thấy phiếu" />;
  if (!data) return null;

  const {
    loai,
    so_tien,
    dien_giai,
    trang_thai,
    ma_kho,
    ma_kh,
    ngay_giao_dich,
    nguoi_tao,
    ngay_tao,
    nguoi_gui,
    ngay_gui,
    nguoi_duyet,
    ngay_duyet,
    nguoi_huy,
    ngay_huy,
    ly_do_huy,
    lien_ket_phieu,
  } = data;

  const isThu = loai === LOAI_THU_CHI.THU;
  const isNhap = trang_thai === "NHAP";
  const isGuiDuyet = trang_thai === "GUI_DUYET";
  const canApprove = isGuiDuyet && authService.canApprove();

  const getTimelineItems = () => {
    const items = [
      {
        color: "green",
        children: (
          <>
            <Text strong>Tạo phiếu</Text>
            <br />
            <Text type="secondary" size="small">
              Bởi {nguoi_tao} - {formatService.formatDateTime(ngay_tao)}
            </Text>
          </>
        ),
      },
    ];

    if (nguoi_gui) {
      items.push({
        color: "orange",
        children: (
          <>
            <Text strong>Gửi duyệt</Text>
            <br />
            <Text type="secondary" size="small">
              Bởi {nguoi_gui} - {formatService.formatDateTime(ngay_gui)}
            </Text>
          </>
        ),
      });
    }

    if (nguoi_duyet) {
      items.push({
        color: "green",
        children: (
          <>
            <Text strong>Đã phê duyệt</Text>
            <br />
            <Text type="secondary" size="small">
              Bởi {nguoi_duyet} - {formatService.formatDateTime(ngay_duyet)}
            </Text>
          </>
        ),
      });
    }

    if (nguoi_huy) {
      items.push({
        color: "red",
        children: (
          <>
            <Text strong>Đã hủy</Text>
            <br />
            <Text type="secondary" size="small">
              Bởi {nguoi_huy} - {formatService.formatDateTime(ngay_huy)}
            </Text>
            {ly_do_huy && (
              <>
                <br />
                <Text type="danger" italic>
                  Lý do: {ly_do_huy}
                </Text>
              </>
            )}
          </>
        ),
      });
    }

    return items;
  };

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/thu-chi")}
            />
            <span>
              Phiếu {isThu ? "Thu" : "Chi"}: {so_phieu}
            </span>
            <Tag
              color={TRANG_THAI_COLORS[trang_thai] || "default"}
              style={{ margin: 0 }}
            >
              {formatService.formatTrangThai(trang_thai)}
            </Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {isNhap && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendApproval}
              >
                Gửi duyệt
              </Button>
            )}
            {canApprove && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                onClick={handleApprove}
              >
                Phê duyệt
              </Button>
            )}
            {(isNhap || isGuiDuyet) && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setCancelModalVisible(true)}
              >
                Hủy phiếu
              </Button>
            )}
          </Space>
        }
        size="small"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Title level={4}>Thông tin chung</Title>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Số phiếu">{so_phieu}</Descriptions.Item>
              <Descriptions.Item label="Loại">
                <Tag color={isThu ? "green" : "red"}>
                  {isThu ? <ArrowUpOutlined /> : <ArrowDownOutlined />}{" "}
                  {isThu ? "Thu tiền" : "Chi tiền"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao dịch">
                {formatService.formatDate(ngay_giao_dich)}
              </Descriptions.Item>
              <Descriptions.Item label="Kho">{ma_kho}</Descriptions.Item>
              <Descriptions.Item label="Đối tác (KH/NCC)">
                {ma_kh}
              </Descriptions.Item>
              <Descriptions.Item label="Liên kết phiếu">
                {lien_ket_phieu ? (
                  <Space>
                    <LinkOutlined />
                    {lien_ket_phieu.startsWith("HD") ? (
                      <Link to={`/sales/orders/${lien_ket_phieu}`}>
                        {lien_ket_phieu}
                      </Link>
                    ) : (
                      <Link to={`/purchase/parts/${lien_ket_phieu}`}>
                        {lien_ket_phieu}
                      </Link>
                    )}
                  </Space>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Title level={4}>Số tiền</Title>
            <Card
              style={{
                backgroundColor: isThu ? "#f6ffed" : "#fff1f0",
                borderColor: isThu ? "#b7eb8f" : "#ffa39e",
                textAlign: "center",
                padding: "8px 0",
              }}
              size="small"
            >
              <Title
                level={3}
                style={{ margin: 0, color: isThu ? "#52c41a" : "#f5222d" }}
              >
                {isThu ? "+" : "-"}{" "}
                {formatService.formatCurrency(Number(so_tien))}
              </Title>
            </Card>

            <Divider style={{ margin: "16px 0" }} />

            <Title level={4}>Diễn giải</Title>
            <Text>{dien_giai || "Không có diễn giải"}</Text>
          </Col>

          <Col xs={24} lg={8}>
            <Title level={4}>Lịch sử phê duyệt</Title>
            <Card size="small">
              <Timeline items={getTimelineItems()} />
            </Card>

            {trang_thai === "DA_DUYET" && (
              <Alert
                message="Phiếu đã được duyệt"
                description="Phiếu này không thể chỉnh sửa hoặc hủy."
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
            {trang_thai === "DA_HUY" && (
              <Alert
                message="Phiếu đã bị hủy"
                description={`Lý do: ${ly_do_huy || "Không cung cấp lý do"}`}
                type="error"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </Col>
        </Row>
      </Card>

      <Modal
        title="Hủy phiếu thu chi"
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        onOk={() => form.submit()}
        okText="Xác nhận hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} layout="vertical" onFinish={handleCancel}>
          <Form.Item
            name="ly_do"
            label="Lý do hủy"
            rules={[{ required: true, message: "Vui lòng nhập lý do hủy" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do hủy phiếu..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ThuChiDetail;
