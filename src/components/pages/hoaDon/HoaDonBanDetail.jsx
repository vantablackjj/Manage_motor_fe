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
  Form,
  Input,
  Row,
  Col,
  Timeline,
  Divider,
  Checkbox,
  InputNumber,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  hoaDonAPI,
  xeAPI,
  phuTungAPI,
  khachHangAPI,
  khoAPI,
} from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import { TRANG_THAI_COLORS, TRANG_THAI_LABELS } from "../../../utils/constant";

const { TextArea } = Input;

const HoaDonBanDetail = () => {
  const { so_hd } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [so_hd]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await hoaDonAPI.getById(so_hd);
      setData(res.data || res || null);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  // Send for delivery approval
  const handleGuiDuyetGiao = async () => {
    Modal.confirm({
      title: "Gửi duyệt giao hàng",
      content: "Bạn có chắc chắn muốn gửi duyệt giao hàng?",
      onOk: async () => {
        try {
          await hoaDonAPI.guiDuyetGiao(so_hd);
          notificationService.success("Gửi duyệt giao hàng thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Lỗi gửi duyệt giao hàng",
          );
        }
      },
    });
  };

  // Approve delivery
  const handlePheDuyetGiao = async (values) => {
    try {
      await hoaDonAPI.pheDuyetGiao(so_hd, values);
      notificationService.success("Phê duyệt giao hàng thành công");
      setApprovalModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi phê duyệt giao hàng",
      );
    }
  };

  // Confirm delivered
  const handleXacNhanDaGiao = async () => {
    Modal.confirm({
      title: "Xác nhận đã giao hàng",
      content: "Bạn có chắc chắn đã giao hàng thành công?",
      onOk: async () => {
        try {
          await hoaDonAPI.xacNhanDaGiao(so_hd);
          notificationService.success("Xác nhận đã giao hàng thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Lỗi xác nhận giao hàng",
          );
        }
      },
    });
  };

  if (!data) return null;

  const {
    trang_thai,
    ngay_lap,
    ma_kh,
    ten_khach_hang,
    ma_kho,
    ten_kho,
    tong_tien,
    chiet_khau,
    thue_vat,
    thanh_tien,
    ghi_chu,
    chi_tiet_xe = [],
    chi_tiet_pt = [],
    nguoi_gui_duyet_giao,
    ten_nguoi_gui_duyet_giao,
    ngay_gui_duyet_giao,
    nguoi_duyet_giao,
    ten_nguoi_duyet_giao,
    ngay_duyet_giao,
    ghi_chu_duyet_giao,
  } = data;

  const isManager = authService.canApprove();

  // Print Invoice
  const handlePrintInvoice = async () => {
    try {
      const response = await hoaDonAPI.inHoaDon(so_hd);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${so_hd}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      notificationService.error("Lỗi in hóa đơn");
    }
  };

  // Render action buttons based on status
  const renderActionButtons = () => {
    // Buttons available for all non-draft statuses (conceptually)
    // But let's follow the switch case for specific workflow actions
    // We can return an array or Fragment if needed, but the current structure returns a single element per case.
    // Let's modify to return a Fragment or array to include the common buttons.

    const commonButtons = (
      <Button
        icon={<PrinterOutlined />}
        onClick={handlePrintInvoice}
        key="print"
      >
        In hóa đơn
      </Button>
    );

    let workflowButton = null;

    switch (trang_thai) {
      case "DA_XUAT":
        workflowButton = (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleGuiDuyetGiao}
            key="send"
          >
            Gửi duyệt giao hàng
          </Button>
        );
        break;

      case "CHO_DUYET_GIAO":
        if (isManager) {
          workflowButton = (
            <Space key="approval">
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => setApprovalModalVisible(true)}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              >
                Phê duyệt giao
              </Button>
              <Button danger icon={<CloseCircleOutlined />}>
                Từ chối
              </Button>
            </Space>
          );
        } else {
          workflowButton = (
            <Tag color="gold" key="tag">
              Chờ duyệt giao hàng
            </Tag>
          );
        }
        break;

      case "DA_DUYET_GIAO":
        workflowButton = (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleXacNhanDaGiao}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
            key="confirm"
          >
            Xác nhận đã giao
          </Button>
        );
        break;

      case "DA_GIAO":
        workflowButton = (
          <Tag color="success" key="tag">
            Đã giao hàng
          </Tag>
        );
        break;

      case "DA_THANH_TOAN":
        workflowButton = (
          <Tag color="green" key="tag">
            Đã thanh toán
          </Tag>
        );
        break;

      default:
        workflowButton = null;
    }

    return (
      <Space>
        {commonButtons}
        {workflowButton}
      </Space>
    );
  };

  const vehicleColumns = [
    { title: "Mã xe", dataIndex: "ma_xe", width: 140 },
    { title: "Loại xe", dataIndex: "ten_loai_xe" },
    { title: "Màu sắc", dataIndex: "ten_mau", width: 100 },
    { title: "Số khung", dataIndex: "so_khung" },
    { title: "Số máy", dataIndex: "so_may" },
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
  ];

  const partColumns = [
    { title: "Mã phụ tùng", dataIndex: "ma_pt" },
    { title: "Tên phụ tùng", dataIndex: "ten_pt" },
    { title: "ĐVT", dataIndex: "don_vi_tinh" },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      align: "center",
      render: (val) => <b>{val}</b>,
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
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/sales/invoices")}
            />
            <span>Hóa đơn bán: {so_hd}</span>
            <Tag color={TRANG_THAI_COLORS[trang_thai]} style={{ margin: 0 }}>
              {TRANG_THAI_LABELS[trang_thai] || trang_thai}
            </Tag>
          </Space>
        }
        extra={<Space wrap>{renderActionButtons()}</Space>}
        size="small"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="Ngày lập">
                {formatService.formatDateTime(ngay_lap)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {ten_khach_hang || ma_kh}
              </Descriptions.Item>
              <Descriptions.Item label="Kho xuất">
                {ten_kho || ma_kho}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {ghi_chu || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Vehicle details */}
            {chi_tiet_xe.length > 0 && (
              <>
                <h4>Danh sách xe</h4>
                <Table
                  dataSource={chi_tiet_xe}
                  columns={vehicleColumns}
                  rowKey="stt"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                  style={{ marginBottom: 16 }}
                />
              </>
            )}

            {/* Parts details */}
            {chi_tiet_pt.length > 0 && (
              <>
                <h4>Danh sách phụ tùng</h4>
                <Table
                  dataSource={chi_tiet_pt}
                  columns={partColumns}
                  rowKey="stt"
                  pagination={false}
                  size="small"
                  scroll={{ x: 800 }}
                />
              </>
            )}

            {/* Summary */}
            <Card
              style={{ marginTop: 16, backgroundColor: "#f5f5f5" }}
              size="small"
            >
              <Row gutter={[16, 8]} justify="end">
                <Col xs={12} sm={8} style={{ textAlign: "right" }}>
                  <span style={{ color: "rgba(0,0,0,0.45)" }}>Tổng tiền:</span>
                  <br />
                  <b style={{ fontSize: 16 }}>
                    {formatService.formatCurrency(Number(tong_tien || 0))}
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
                  <b style={{ fontSize: 16 }}>{thue_vat || 0}%</b>
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
                    Thanh toán:
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {formatService.formatCurrency(Number(thanh_tien || 0))}
                  </span>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Approval timeline */}
          <Col xs={24} lg={8}>
            <h4>Lịch sử phê duyệt giao hàng</h4>
            <Card size="small">
              <Timeline
                items={[
                  trang_thai === "DA_XUAT" && {
                    color: "blue",
                    children: (
                      <>
                        <b>Đã xuất kho</b>
                        <br />
                        <small>Sẵn sàng gửi duyệt giao hàng</small>
                      </>
                    ),
                  },
                  nguoi_gui_duyet_giao && {
                    color: "orange",
                    children: (
                      <>
                        <b>Gửi duyệt giao hàng</b>
                        <br />
                        <small>
                          Bởi {ten_nguoi_gui_duyet_giao} -{" "}
                          {formatService.formatDateTime(ngay_gui_duyet_giao)}
                        </small>
                      </>
                    ),
                  },
                  nguoi_duyet_giao && {
                    color: "green",
                    children: (
                      <>
                        <b>Đã phê duyệt giao hàng</b>
                        <br />
                        <small>
                          Bởi {ten_nguoi_duyet_giao} -{" "}
                          {formatService.formatDateTime(ngay_duyet_giao)}
                        </small>
                        {ghi_chu_duyet_giao && (
                          <>
                            <br />
                            <small style={{ fontStyle: "italic" }}>
                              Ghi chú: {ghi_chu_duyet_giao}
                            </small>
                          </>
                        )}
                      </>
                    ),
                  },
                  trang_thai === "DA_GIAO" && {
                    color: "green",
                    children: (
                      <>
                        <b>Đã giao hàng</b>
                        <br />
                        <small>Giao hàng thành công</small>
                      </>
                    ),
                  },
                  trang_thai === "DA_THANH_TOAN" && {
                    color: "green",
                    children: (
                      <>
                        <b>Đã thanh toán</b>
                        <br />
                        <small>Hoàn tất giao dịch</small>
                      </>
                    ),
                  },
                ].filter(Boolean)}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Approval Modal */}
      <Modal
        title="Phê duyệt giao hàng"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        onOk={() => form.submit()}
        okText="Phê duyệt"
        okButtonProps={{
          style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
        }}
      >
        <Form form={form} layout="vertical" onFinish={handlePheDuyetGiao}>
          <Form.Item
            name="ghi_chu"
            label="Ghi chú phê duyệt"
            rules={[{ required: false }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú phê duyệt (không bắt buộc)..."
            />
          </Form.Item>

          <Divider orientation="left">Thông tin thanh toán</Divider>
          <Form.Item
            name={["payment_info", "should_pay"]}
            valuePropName="checked"
          >
            <Checkbox
              onChange={(e) => {
                if (e.target.checked) {
                  form.setFieldValue(
                    ["payment_info", "amount"],
                    data?.thanh_tien || 0,
                  );
                  form.setFieldValue(["payment_info", "method"], "TIEN_MAT");
                }
              }}
            >
              Thanh toán ngay
            </Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.payment_info?.should_pay !== current.payment_info?.should_pay
            }
          >
            {({ getFieldValue }) =>
              getFieldValue(["payment_info", "should_pay"]) && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={["payment_info", "amount"]}
                      label="Số tiền"
                      rules={[{ required: true, message: "Nhập số tiền" }]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["payment_info", "method"]}
                      label="Hình thức"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Option value="TIEN_MAT">Tiền mặt</Option>
                        <Option value="NGAN_HANG">Ngân hàng</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HoaDonBanDetail;
