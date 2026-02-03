// src/components/pages/chuyenKho/ChuyenKhoDetail.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Input,
  InputNumber,
  Progress,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { chuyenKhoAPI, khoAPI } from "../../../api";
import {
  notificationService,
  formatService,
  authService,
} from "../../../services";
import { TRANG_THAI_COLORS, TRANG_THAI_LABELS } from "../../../utils/constant";

const { TextArea } = Input;

const ChuyenKhoDetail = () => {
  const { ma_phieu } = useParams(); // URL params: /chuyen-kho/:ma_phieu
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [phieu, setPhieu] = useState(null); // Ticket header
  const [chi_tiet_xe, setChiTietXe] = useState([]); // Vehicle details
  const [chi_tiet_phu_tung, setChiTietPhuTung] = useState([]); // Part details
  const [khoList, setKhoList] = useState([]);

  // Actions
  const [rejectModalHtml, setRejectModalHtml] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchKhoList();
    fetchData();
  }, [ma_phieu]);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await chuyenKhoAPI.getById(ma_phieu);
      // API service returns res.data, so res here is the data object { phieu: ..., chi_tiet_xe: ... }
      const data = res;
      setPhieu(data.phieu || {});
      setChiTietXe(data.chi_tiet_xe || []);
      setChiTietPhuTung(data.chi_tiet_phu_tung || []);
    } catch (error) {
      notificationService.error("Không thể tải chi tiết phiếu");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    Modal.confirm({
      title: "Gửi duyệt phiếu chuyển kho",
      content:
        "Bạn có chắc chắn muốn gửi phiếu này để phê duyệt? Sau khi gửi, hàng hóa sẽ bị khóa và không thể bán.",
      okText: "Gửi duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await chuyenKhoAPI.guiDuyet(ma_phieu);
          notificationService.success("Gửi duyệt thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Lỗi gửi duyệt",
          );
        }
      },
    });
  };

  const handleApprove = async () => {
    Modal.confirm({
      title: "Phê duyệt phiếu chuyển kho",
      content:
        "Bạn có chắc chắn muốn phê duyệt phiếu này? Sau khi duyệt, thủ kho sẽ thực hiện nhập kho.",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await chuyenKhoAPI.pheDuyet(ma_phieu);
          notificationService.success("Phê duyệt thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Lỗi phê duyệt",
          );
        }
      },
    });
  };

  // State for receiving modal
  const [showNhapKhoModal, setShowNhapKhoModal] = useState(false);
  const [receivingItems, setReceivingItems] = useState([]);

  const handleOpenNhapKhoModal = () => {
    // Prepare items for receiving (only items with remaining quantity)
    const xeItems = (chi_tiet_xe || [])
      .filter((item) => {
        const remaining = item.so_luong - (item.so_luong_da_giao || 0);
        return remaining > 0;
      })
      .map((item) => ({
        ...item,
        so_luong_nhap: 0,
        ma_serial: item.xe_key || null,
        loai: "XE",
      }));

    const ptItems = (chi_tiet_phu_tung || [])
      .filter((item) => {
        const remaining = item.so_luong - (item.so_luong_da_giao || 0);
        return remaining > 0;
      })
      .map((item) => ({
        ...item,
        so_luong_nhap: 0,
        loai: "PHU_TUNG",
      }));

    setReceivingItems([...xeItems, ...ptItems]);
    setShowNhapKhoModal(true);
  };

  const handleChangeReceivingQuantity = (stt, value) => {
    setReceivingItems((prev) =>
      prev.map((item) =>
        item.stt === stt ? { ...item, so_luong_nhap: value || 0 } : item,
      ),
    );
  };

  const handleSubmitNhapKho = async () => {
    // Filter items with quantity > 0
    const danh_sach_nhap = receivingItems
      .filter((item) => item.so_luong_nhap > 0)
      .map((item) => {
        const payload = {
          stt: item.stt,
          so_luong_nhap: item.so_luong_nhap,
        };
        // Add serial number for vehicles
        if (item.loai === "XE" && item.ma_serial) {
          payload.ma_serial = item.ma_serial;
        }
        return payload;
      });

    if (danh_sach_nhap.length === 0) {
      notificationService.warning("Vui lòng chọn ít nhất 1 hàng để nhập");
      return;
    }

    try {
      const response = await chuyenKhoAPI.nhapKho(ma_phieu, {
        danh_sach_nhap,
      });

      if (response.data?.hoan_thanh) {
        notificationService.success("Nhập kho hoàn thành!");
      } else {
        notificationService.success(
          "Nhập kho một phần thành công. Bạn có thể tiếp tục nhập.",
        );
      }

      setShowNhapKhoModal(false);
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi nhập kho",
      );
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      notificationService.error("Vui lòng nhập lý do hủy");
      return;
    }
    try {
      await chuyenKhoAPI.huy(ma_phieu, reason);
      notificationService.success("Đã hủy phiếu");
      setRejectModalHtml(false);
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi hủy phiếu");
    }
  };

  const handlePrint = async () => {
    try {
      const response = await chuyenKhoAPI.inPhieu(ma_phieu);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transfer-${phieu.so_phieu}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      notificationService.error("Lỗi in phiếu");
    }
  };

  const getKhoName = (ma_kho) => {
    const k = khoList.find((item) => item.ma_kho === ma_kho);
    return k ? k.ten_kho : ma_kho;
  };

  if (!phieu) return null;

  const canSubmit = phieu.trang_thai === "NHAP";
  const canApprove =
    authService.canApprove() && phieu.trang_thai === "GUI_DUYET";
  const canNhapKho =
    phieu.trang_thai === "DA_DUYET" || phieu.trang_thai === "DANG_NHAP_KHO";
  const canCancel = phieu.trang_thai === "NHAP";

  // Calculate progress
  const allItems = [...(chi_tiet_xe || []), ...(chi_tiet_phu_tung || [])];
  const tongSoLuong = allItems.reduce((sum, item) => sum + item.so_luong, 0);
  const tongDaNhap = allItems.reduce(
    (sum, item) => sum + (item.so_luong_da_giao || 0),
    0,
  );
  const progressPercent =
    tongSoLuong > 0 ? Math.round((tongDaNhap / tongSoLuong) * 100) : 0;

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/chuyen-kho")}
            />
            <span>Phiếu chuyển kho: {phieu.so_phieu}</span>
            <Tag
              color={TRANG_THAI_COLORS[phieu.trang_thai]}
              style={{ margin: 0 }}
            >
              {TRANG_THAI_LABELS[phieu.trang_thai]}
            </Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {canSubmit && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSubmit}
              >
                Gửi duyệt
              </Button>
            )}

            {canApprove && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
              >
                Phê duyệt
              </Button>
            )}

            {canNhapKho && (
              <Button
                type="primary"
                danger
                icon={<CheckCircleOutlined />}
                onClick={handleOpenNhapKhoModal}
              >
                {phieu.trang_thai === "DANG_NHAP_KHO"
                  ? "Tiếp tục nhập kho"
                  : "Nhập kho"}
              </Button>
            )}

            {canCancel && (
              <Button danger onClick={() => setRejectModalHtml(true)}>
                Hủy phiếu
              </Button>
            )}

            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              In phiếu
            </Button>
          </Space>
        }
        size="small"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Mã phiếu">
            {phieu.so_phieu}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày chuyển">
            {formatService.formatDate(phieu.ngay_chuyen_kho)}
          </Descriptions.Item>
          <Descriptions.Item label="Kho xuất">
            {getKhoName(phieu.ma_kho_xuat)}
          </Descriptions.Item>
          <Descriptions.Item label="Kho nhập">
            {getKhoName(phieu.ma_kho_nhap)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={{ xs: 1, sm: 2 }}>
            {phieu.ghi_chu || "(Không có)"}
          </Descriptions.Item>

          <Descriptions.Item label="Người tạo">
            {phieu.ten_nguoi_tao || phieu.nguoi_tao}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatService.formatDate(phieu.created_at)}
          </Descriptions.Item>
        </Descriptions>

        {/* Progress Indicator */}
        {(phieu.trang_thai === "DA_DUYET" ||
          phieu.trang_thai === "DANG_NHAP_KHO" ||
          phieu.trang_thai === "HOAN_THANH") && (
          <div style={{ marginTop: 16 }}>
            <p style={{ marginBottom: 8 }}>
              <strong>Tiến độ nhập kho:</strong> {tongDaNhap}/{tongSoLuong} (
              {progressPercent}%)
            </p>
            <Progress
              percent={progressPercent}
              status={
                progressPercent === 100
                  ? "success"
                  : progressPercent > 0
                    ? "active"
                    : "normal"
              }
            />
          </div>
        )}

        {/* Danh sách xe */}
        {chi_tiet_xe && chi_tiet_xe.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3>Danh sách Xe</h3>
            <Table
              dataSource={chi_tiet_xe}
              rowKey="xe_key"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              columns={[
                { title: "STT", dataIndex: "stt", width: 60 },
                { title: "Xe Key", dataIndex: "xe_key" },
                { title: "Mã loại", dataIndex: "ma_pt" },
                { title: "Tên xe", dataIndex: "ten_pt" },
                {
                  title: "Số lượng",
                  dataIndex: "so_luong",
                  width: 80,
                  align: "center",
                },
                {
                  title: "Đã nhập",
                  dataIndex: "so_luong_da_giao",
                  width: 80,
                  align: "center",
                  render: (val) => (
                    <span style={{ color: "blue" }}>{val || 0}</span>
                  ),
                },
                {
                  title: "Còn lại",
                  width: 80,
                  align: "center",
                  render: (_, record) => {
                    const remaining =
                      record.so_luong - (record.so_luong_da_giao || 0);
                    return <span style={{ color: "red" }}>{remaining}</span>;
                  },
                },
                {
                  title: "Đơn giá",
                  dataIndex: "don_gia",
                  render: (val) => formatService.formatCurrency(val),
                },
                {
                  title: "Trạng thái",
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
              ]}
            />
          </div>
        )}

        {/* Danh sách phụ tùng */}
        {chi_tiet_phu_tung && chi_tiet_phu_tung.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3>Danh sách Phụ tùng</h3>
            <Table
              dataSource={chi_tiet_phu_tung}
              rowKey="ma_pt"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              columns={[
                { title: "STT", dataIndex: "stt", width: 60 },
                { title: "Mã PT", dataIndex: "ma_pt" },
                { title: "Tên PT", dataIndex: "ten_pt" },
                { title: "ĐVT", dataIndex: "don_vi_tinh" },
                {
                  title: "Số lượng",
                  dataIndex: "so_luong",
                  width: 80,
                  align: "center",
                },
                {
                  title: "Đã nhập",
                  dataIndex: "so_luong_da_giao",
                  width: 80,
                  align: "center",
                  render: (val) => (
                    <span style={{ color: "blue" }}>{val || 0}</span>
                  ),
                },
                {
                  title: "Còn lại",
                  width: 80,
                  align: "center",
                  render: (_, record) => {
                    const remaining =
                      record.so_luong - (record.so_luong_da_giao || 0);
                    return <span style={{ color: "red" }}>{remaining}</span>;
                  },
                },
                {
                  title: "Đơn giá",
                  dataIndex: "don_gia",
                  render: (val) => formatService.formatCurrency(val),
                },
                {
                  title: "Thành tiền",
                  dataIndex: "thanh_tien",
                  render: (val) => formatService.formatCurrency(val),
                },
                {
                  title: "Trạng thái",
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
              ]}
            />
          </div>
        )}
      </Card>

      {/* Receiving Modal */}
      <Modal
        title={`Nhập kho - Phiếu ${phieu.so_phieu}`}
        open={showNhapKhoModal}
        onOk={handleSubmitNhapKho}
        onCancel={() => setShowNhapKhoModal(false)}
        width={900}
        okText="Xác nhận nhập kho"
        cancelText="Hủy"
      >
        <Table
          dataSource={receivingItems}
          rowKey="stt"
          pagination={false}
          size="small"
          scroll={{ x: 700 }}
          columns={[
            { title: "STT", dataIndex: "stt", width: 60 },
            {
              title: "Loại",
              dataIndex: "loai",
              width: 80,
              render: (val) => (
                <Tag color={val === "XE" ? "blue" : "green"}>{val}</Tag>
              ),
            },
            {
              title: "Tên hàng",
              dataIndex: "ten_pt",
              render: (text, record) => (
                <div>
                  <div>{text}</div>
                  {record.xe_key && (
                    <small style={{ color: "#888" }}>{record.xe_key}</small>
                  )}
                </div>
              ),
            },
            {
              title: "Còn lại",
              width: 80,
              align: "center",
              render: (_, record) => {
                const remaining =
                  record.so_luong - (record.so_luong_da_giao || 0);
                return <strong>{remaining}</strong>;
              },
            },
            {
              title: "Số lượng nhập",
              width: 150,
              render: (_, record) => {
                const maxQty = record.so_luong - (record.so_luong_da_giao || 0);
                return (
                  <InputNumber
                    min={0}
                    max={maxQty}
                    value={record.so_luong_nhap}
                    onChange={(val) =>
                      handleChangeReceivingQuantity(record.stt, val)
                    }
                    style={{ width: "100%" }}
                  />
                );
              },
            },
          ]}
        />
      </Modal>

      <Modal
        title="Từ chối / Hủy phiếu"
        open={rejectModalHtml}
        onOk={handleReject}
        onCancel={() => setRejectModalHtml(false)}
      >
        <TextArea
          rows={4}
          placeholder="Nhập lý do hủy/từ chối..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ChuyenKhoDetail;
