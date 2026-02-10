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
  Select,
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
  DeleteOutlined,
  PlusOutlined,
  PrinterOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { donHangMuaXeAPI } from "../../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../../services";
import {
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
} from "../../../../utils/constant";
import OrderReceiveModal from "../OrderReceiveModal";

const VehiclePurchaseDetail = () => {
  const { ma_phieu } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { header, items }

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Master Data
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [colors, setColors] = useState([]);

  // Header Edit State
  const [headerModalVisible, setHeaderModalVisible] = useState(false);
  const [headerForm] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, [ma_phieu]);

  const fetchMasterData = async () => {
    try {
      const api = await import("../../../../api");
      const [typeRes, colorRes] = await Promise.all([
        api.danhMucAPI.modelCar.getAll(),
        api.danhMucAPI.color.getAll(),
      ]);
      setVehicleTypes(Array.isArray(typeRes) ? typeRes : typeRes?.data || []);
      setColors(Array.isArray(colorRes) ? colorRes : colorRes?.data || []);
    } catch (error) {
      console.error("Lỗi tải danh mục", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await donHangMuaXeAPI.getById(ma_phieu);
      setData(res.data);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSendApproval = async () => {
    try {
      await donHangMuaXeAPI.guiDuyet(ma_phieu);
      notificationService.success("Đã gửi duyệt");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi gửi duyệt");
    }
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: "Xác nhận duyệt đơn hàng",
      content: "Bạn có chắc chắn muốn duyệt đơn hàng này?",
      onOk: async () => {
        try {
          await donHangMuaXeAPI.pheDuyet(ma_phieu);
          notificationService.success("Đã phê duyệt đơn hàng");
          fetchData();
        } catch (error) {
          notificationService.error(
            "Lỗi phê duyệt: " + (error?.response?.data?.message || ""),
          );
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
        if (!reason.trim()) {
          notificationService.error("Vui lòng nhập lý do từ chối");
          return Promise.reject();
        }
        try {
          await donHangMuaXeAPI.huy(ma_phieu, { ghi_chu: reason });
          notificationService.warning("Đơn hàng đã bị từ chối");
          fetchData();
        } catch (error) {
          notificationService.error(
            "Lỗi khi từ chối đơn: " + (error?.response?.data?.message || ""),
          );
        }
      },
    });
  };

  const handlePrint = async () => {
    try {
      const response = await donHangMuaXeAPI.inDonHang(ma_phieu);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `purchase-order-${header.so_phieu}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      notificationService.error("Lỗi in đơn hàng");
    }
  };

  // ----- RECEIPT LOGIC -----
  const handleOpenReceipt = () => {
    setShowReceiptModal(true);
  };

  const handleReceiptSuccess = () => {
    fetchData();
    setShowReceiptModal(false);
  };

  const handleDeleteDetail = async (chiTietId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa dòng chi tiết này?",
      onOk: async () => {
        try {
          await donHangMuaXeAPI.deleteChiTiet(ma_phieu, chiTietId);
          notificationService.success("Đã xóa chi tiết");
          fetchData();
        } catch (error) {
          notificationService.error(
            "Lỗi xóa chi tiết: " + (error?.response?.data?.message || ""),
          );
        }
      },
    });
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm] = Form.useForm();

  const handleAddDetail = async (values) => {
    try {
      await donHangMuaXeAPI.addChiTiet(ma_phieu, {
        ...values,
        so_luong: 1,
      });
      notificationService.success("Đã thêm chi tiết");
      setShowAddModal(false);
      addForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        "Lỗi thêm chi tiết: " + (error?.response?.data?.message || ""),
      );
    }
  };

  const handleUpdateHeader = async (values) => {
    try {
      // VehiclePurchase uses unified donHangAPI or specific donHangMuaXeAPI?
      // VehiclePurchaseDetail.jsx uses donHangMuaXeAPI
      // Let's check api/donHangMuaXe.api.js for update method.
      await donHangMuaXeAPI.update(ma_phieu, values);
      notificationService.success("Cập nhật đơn hàng thành công");
      setHeaderModalVisible(false);
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi cập nhật đơn hàng",
      );
    }
  };

  if (!data) return null;
  const header = data;
  const items = data.chi_tiet || data.items || [];

  // Check if order is fully received
  const isFullyReceived =
    items.length > 0 &&
    items.every((item) => {
      const ordered = item.so_luong || 0;
      const delivered = item.so_luong_da_giao || 0;
      return delivered >= ordered;
    });

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase/vehicles")}
            />
            <span>Đơn mua: {header.so_phieu}</span>
            {/* Status Tag Logic */}
            {isFullyReceived && header.trang_thai === "DA_DUYET" ? (
              <Tag color="success" style={{ margin: 0 }}>
                HOÀN THÀNH
              </Tag>
            ) : (
              <Tag
                color={TRANG_THAI_COLORS[header.trang_thai]}
                style={{ margin: 0 }}
              >
                {TRANG_THAI_LABELS[header.trang_thai] || header.trang_thai}
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space wrap>
            {header.trang_thai === "NHAP" && (
              <Space>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => setShowAddModal(true)}
                >
                  Thêm xe
                </Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendApproval}
                >
                  Gửi duyệt
                </Button>
              </Space>
            )}
            {header.trang_thai === "GUI_DUYET" && authService.canApprove() && (
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
            {/* Show Receipt Button if Approved AND Not Fully Received */}
            {header.trang_thai === "DA_DUYET" && !isFullyReceived && (
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={handleOpenReceipt}
              >
                Nhập kho
              </Button>
            )}
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In đơn hàng
            </Button>
          </Space>
        }
        size="small"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Ngày đặt">
            {formatService.formatDate(header.ngay_dat_hang)}
          </Descriptions.Item>
          <Descriptions.Item label="NCC">
            {header.ten_ncc || header.ma_ncc}
          </Descriptions.Item>
          <Descriptions.Item label="Kho nhập">
            {header.ten_kho || header.ten_kho_nhap || header.ma_kho_nhap}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {header.ghi_chu || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatService.formatDateTime(header.ngay_tao)}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {header.ten_nguoi_tao || header.nguoi_tao || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày gửi duyệt">
            {header.ngay_gui_duyet
              ? formatService.formatDateTime(header.ngay_gui_duyet)
              : header.ngay_gui
                ? formatService.formatDateTime(header.ngay_gui)
                : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Người gửi">
            {header.ten_nguoi_gui || header.nguoi_gui || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày duyệt">
            {header.ngay_duyet
              ? formatService.formatDateTime(header.ngay_duyet)
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Người duyệt">
            {header.ten_nguoi_duyet || header.nguoi_duyet || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Diễn giải" span={{ xs: 1, sm: 2, md: 3 }}>
            {header.dien_giai || "-"}
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
              {header.trang_thai === "NHAP" && (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    headerForm.setFieldsValue({
                      vat_percentage: header.vat_percentage,
                      chiet_khau: header.chiet_khau,
                      ghi_chu: header.ghi_chu,
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
                {formatService.formatCurrency(
                  Number(header.tong_tien || header.tong_gia_tri || 0),
                )}
              </b>
            </Col>
            <Col xs={12} sm={8} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>Chiết khấu:</span>
              <br />
              <b style={{ fontSize: 16 }}>
                {formatService.formatCurrency(Number(header.chiet_khau || 0))}
              </b>
            </Col>
            <Col xs={12} sm={4} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>VAT:</span>
              <br />
              <b style={{ fontSize: 16 }}>{header.vat_percentage || 0}%</b>
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
                {formatService.formatCurrency(
                  Number(header.tong_tien || header.thanh_tien || 0),
                )}
              </span>
            </Col>
          </Row>
        </Card>

        <Table
          style={{ marginTop: 24 }}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          columns={[
            {
              title: "STT",
              dataIndex: "stt",
              width: 60,
              align: "center",
            },
            {
              title: "Mã xe",
              key: "ma_xe",
              width: 160,
              render: (_, record) =>
                record.ma_xe ||
                record.xe_key ||
                (record.danh_sach_xe && record.danh_sach_xe[0]?.ma_xe) ||
                "-",
            },
            {
              title: "Loại xe",
              key: "ten_loai_xe",
              width: 150,
              render: (_, record) =>
                record.ten_loai_xe ||
                vehicleTypes.find((t) => t.ma_loai === record.ma_loai_xe)
                  ?.ten_loai ||
                record.ma_loai_xe,
            },
            {
              title: "Màu sắc",
              key: "ten_mau",
              width: 120,
              render: (_, record) =>
                record.ten_mau ||
                colors.find((c) => c.ma_mau === record.ma_mau)?.ten_mau ||
                record.ma_mau,
            },
            {
              title: "Số khung",
              key: "so_khung",
              width: 150,
              render: (_, record) =>
                record.so_khung ||
                (record.danh_sach_xe && record.danh_sach_xe[0]?.so_khung) ||
                "-",
            },
            {
              title: "Số máy",
              key: "so_may",
              width: 150,
              render: (_, record) =>
                record.so_may ||
                (record.danh_sach_xe && record.danh_sach_xe[0]?.so_may) ||
                "-",
            },
            {
              title: "SL Đặt",
              dataIndex: "so_luong",
              width: 60,
              align: "center",
            },
            {
              title: "Đã nhập",
              key: "delivered",
              width: 80,
              align: "center",
              render: (_, record) => (
                <span style={{ color: "blue" }}>
                  {record.so_luong_da_giao || 0}
                </span>
              ),
            },
            {
              title: "Còn lại",
              key: "remaining",
              width: 80,
              align: "center",
              render: (_, record) => {
                const remaining =
                  record.so_luong_con_lai !== undefined
                    ? record.so_luong_con_lai
                    : record.so_luong - (record.so_luong_da_giao || 0);
                return <span style={{ color: "red" }}>{remaining}</span>;
              },
            },
            {
              title: "Đơn giá",
              dataIndex: "don_gia",
              width: 120,
              align: "right",
              render: (v) => formatService.formatCurrency(Number(v)),
            },
            {
              title: "Thành tiền",
              dataIndex: "thanh_tien",
              width: 120,
              align: "right",
              render: (v) => formatService.formatCurrency(Number(v)),
            },
            {
              title: "Trạng thái",
              key: "status_nhap",
              width: 100,
              align: "center",
              render: (_, record) => {
                const ordered = record.so_luong || 0;
                const delivered = record.so_luong_da_giao || 0;
                if (delivered >= ordered && ordered > 0)
                  return <Tag color="success">Đủ hàng</Tag>;
                if (delivered > 0)
                  return <Tag color="processing">Đang nhập</Tag>;
                return <Tag color="default">Chưa nhập</Tag>;
              },
            },
            ...(header.trang_thai === "NHAP"
              ? [
                  {
                    title: "Thao tác",
                    key: "action",
                    width: 80,
                    align: "center",
                    fixed: "right",
                    render: (_, record) => (
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteDetail(record.id)}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>

      {/* RECEIPT MODAL */}
      <OrderReceiveModal
        visible={showReceiptModal}
        onCancel={() => setShowReceiptModal(false)}
        orderId={ma_phieu}
        onSuccess={handleReceiptSuccess}
      />

      {/* ADD DETAIL MODAL */}
      <Modal
        title="Thêm chi tiết xe"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onOk={() => addForm.submit()}
        okText="Thêm"
      >
        <Form form={addForm} layout="vertical" onFinish={handleAddDetail}>
          <Form.Item
            name="ma_loai_xe"
            label="Loại xe"
            rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
          >
            <Select showSearch optionFilterProp="children">
              {vehicleTypes.map((t) => (
                <Select.Option key={t.ma_loai} value={t.ma_loai}>
                  {t.ten_loai}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="ma_mau"
            label="Màu sắc"
            rules={[{ required: true, message: "Vui lòng chọn màu" }]}
          >
            <Select showSearch optionFilterProp="children">
              {colors.map((c) => (
                <Select.Option key={c.ma_mau} value={c.ma_mau}>
                  {c.ten_mau}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="don_gia"
            label="Đơn giá"
            rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
        </Form>
      </Modal>
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

export default VehiclePurchaseDetail;
