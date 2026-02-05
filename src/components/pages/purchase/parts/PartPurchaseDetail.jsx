import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Input,
  Form,
  InputNumber,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ImportOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import PartReceiveModal from "./PartReceiveModal";
import { donHangAPI, khoAPI, khachHangAPI } from "../../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../../services";
import {
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
} from "../../../../utils/constant";

const PartPurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const [headerModalVisible, setHeaderModalVisible] = useState(false);
  const [headerForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await donHangAPI.getById(id);
      setData(res?.data?.data || res?.data || {});
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSendApproval = async () => {
    try {
      await donHangAPI.guiDuyet(id);
      notificationService.success("Đã gửi duyệt");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi gửi duyệt");
    }
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: "Xác nhận duyệt",
      content: "Bạn có chắc chắn muốn duyệt đơn hàng này?",
      onOk: async () => {
        try {
          await donHangAPI.pheDuyet(id);
          notificationService.success("Đã phê duyệt");
          fetchData();
        } catch (error) {
          notificationService.error("Lỗi phê duyệt");
        }
      },
    });
  };

  const handleReject = async () => {
    let reason = "";
    Modal.confirm({
      title: "Từ chối đơn hàng",
      content: (
        <div style={{ marginTop: 16 }}>
          <p>Nhập lý do từ chối:</p>
          <Input.TextArea
            rows={4}
            placeholder="Lý do từ chối..."
            onChange={(e) => (reason = e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        try {
          await donHangAPI.huyDuyet(id);
          notificationService.success("Đã từ chối");
          fetchData();
        } catch (error) {
          notificationService.error("Lỗi từ chối");
        }
      },
    });
  };

  const handleUpdateHeader = async (values) => {
    try {
      await donHangAPI.update(id, values);
      notificationService.success("Cập nhật đơn hàng thành công");
      setHeaderModalVisible(false);
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi cập nhật đơn hàng",
      );
    }
  };

  const handleReceiveSuccess = () => {
    fetchData();
    setShowReceiveModal(false);
  };

  if (!data) return null;

  const {
    id: orderId,
    so_phieu,
    so_don_hang,
    ngay_dat_hang,
    ten_ncc,
    ten_kho,
    tong_gia_tri,
    chiet_khau,
    vat_percentage,
    thanh_tien,
    ghi_chu,
    trang_thai,
    chi_tiet = [],
    created_at,
    created_by,
  } = data;

  const displayId = so_phieu || so_don_hang || orderId;

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase/parts")}
            />
            <span>Đơn mua: {displayId}</span>
            <Tag color={TRANG_THAI_COLORS[trang_thai]} style={{ margin: 0 }}>
              {TRANG_THAI_LABELS[trang_thai] || trang_thai}
            </Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {trang_thai === "NHAP" && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendApproval}
              >
                Gửi duyệt
              </Button>
            )}

            {trang_thai === "GUI_DUYET" && (
              <Space>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleReject}
                >
                  Từ chối
                </Button>
              </Space>
            )}

            {(trang_thai === "DA_DUYET" ||
              trang_thai === "DANG_NHAP" ||
              trang_thai === "DANG_GIAO") && (
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={() => setShowReceiveModal(true)}
              >
                Nhập kho
              </Button>
            )}
          </Space>
        }
        size="small"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Mã phiếu">{displayId}</Descriptions.Item>
          <Descriptions.Item label="Ngày đặt">
            {formatService.formatDate(ngay_dat_hang)}
          </Descriptions.Item>
          <Descriptions.Item label="NCC">
            <b>{ten_ncc}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Kho nhập">{ten_kho}</Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {data.ten_nguoi_tao || data.nguoi_tao || created_by || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatService.formatDateTime(created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={{ xs: 1, sm: 2, md: 3 }}>
            {ghi_chu || "-"}
          </Descriptions.Item>
        </Descriptions>

        {/* Summary Box */}
        <Card
          style={{ marginTop: 16, backgroundColor: "#f5f5f5" }}
          size="small"
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Tổng hợp</span>
              {trang_thai === "NHAP" && (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    headerForm.setFieldsValue({
                      vat_percentage: vat_percentage,
                      chiet_khau: chiet_khau,
                      ghi_chu: ghi_chu,
                    });
                    setHeaderModalVisible(true);
                  }}
                >
                  Sửa
                </Button>
              )}
            </div>
          }
        >
          <Row gutter={[16, 8]} justify="end">
            <Col xs={12} sm={8} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>Tổng tiền hàng:</span>
              <br />
              <b style={{ fontSize: 16 }}>
                {formatService.formatCurrency(Number(tong_gia_tri || 0))}
              </b>
            </Col>
            <Col xs={12} sm={8} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>Chiết khấu:</span>
              <br />
              <b style={{ fontSize: 16 }}>
                {formatService.formatCurrency(Number(chiet_khau || 0))}
              </b>
            </Col>
            <Col xs={12} sm={4} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>VAT:</span>
              <br />
              <b style={{ fontSize: 16 }}>{vat_percentage || 0}%</b>
            </Col>
            <Col
              xs={24}
              style={{
                marginTop: 8,
                borderTop: "1px solid #d9d9d9",
                paddingTop: 8,
                textAlign: "right",
              }}
            >
              <span style={{ marginRight: 16, fontWeight: "bold" }}>
                Tổng thanh toán:
              </span>
              <span
                style={{ fontSize: 20, fontWeight: "bold", color: "#1890ff" }}
              >
                {formatService.formatCurrency(Number(thanh_tien || 0))}
              </span>
            </Col>
          </Row>
        </Card>

        <Table
          style={{ marginTop: 24 }}
          dataSource={chi_tiet}
          rowKey="stt"
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
          columns={[
            { title: "Mã phụ tùng", dataIndex: "ma_hang_hoa" },
            {
              title: "Tên phụ tùng",
              dataIndex: "ten_pt",
              render: (text, record) => text || record.ma_hang_hoa,
            },
            { title: "ĐVT", dataIndex: "don_vi_tinh" },
            { title: "Số lượng", dataIndex: "so_luong" },
            {
              title: "Đã giao",
              dataIndex: "so_luong_da_giao",
              render: (val) => <span style={{ color: "blue" }}>{val}</span>,
            },
            {
              title: "Còn lại",
              key: "remaining",
              render: (_, record) => {
                const ordered = record.so_luong || 0;
                const delivered = record.so_luong_da_giao || 0;
                const remaining = Math.max(0, ordered - delivered);
                return (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    {remaining}
                  </span>
                );
              },
            },
            {
              title: "Đơn giá",
              dataIndex: "don_gia",
              align: "right",
              render: (v) => formatService.formatCurrency(Number(v)),
            },
            {
              title: "Thành tiền",
              dataIndex: "thanh_tien",
              align: "right",
              render: (v) => formatService.formatCurrency(Number(v)),
            },
          ]}
        />
      </Card>

      <PartReceiveModal
        visible={showReceiveModal}
        onCancel={() => setShowReceiveModal(false)}
        orderId={id}
        onSuccess={handleReceiveSuccess}
      />

      {/* Edit Header Modal */}
      <Modal
        title="Cập nhật thông tin đơn hàng"
        open={headerModalVisible}
        onCancel={() => setHeaderModalVisible(false)}
        onOk={() => headerForm.submit()}
        okText="Cập nhật"
      >
        <Form form={headerForm} layout="vertical" onFinish={handleUpdateHeader}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vat_percentage" label="VAT (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="chiet_khau" label="Chiết khấu (VNĐ)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PartPurchaseDetail;
