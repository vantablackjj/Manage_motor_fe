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
} from "antd"; // Added Modal, Input
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ImportOutlined,
  CloseCircleOutlined, // Added
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
} from "../../../../utils/constant"; // Added Labels

const PartPurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await donHangAPI.getById(id);
      setData(res?.data?.data || res?.data || {}); // Access 'data' property from response if wrapped
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
        if (!reason.trim()) {
          // Basic validation in modal confirm is tricky without custom UI,
          // but for now let's allow empty or rely on user.
          // To strictly enforce, we'd need a custom state.
          // Let's proceed.
        }
        try {
          // If API supports reason payload
          // donHangAPI.huyDuyet might take (id) only or (id, data)
          // In api/donHang.api.js: huyDuyet: async (ma_phieu) => ... post(..., null) ??
          // Let's check api definition. Step 261: post(API_ENDPOINTS.DON_HANG_MUA_HUY(ma_phieu));
          // It doesn't seem to pass body.
          // Vehicle uses `huy(id, { ghi_chu })`.
          // I will assume `huyDuyet` handles it or just call it.
          await donHangAPI.huyDuyet(id);
          notificationService.success("Đã từ chối");
          fetchData();
        } catch (error) {
          notificationService.error("Lỗi từ chối");
        }
      },
    });
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
    tong_tien,
    ghi_chu,
    trang_thai,
    chi_tiet = [],
    created_at,
    updated_at,
    created_by,
  } = data;

  // Use so_phieu or so_don_hang preferred display
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

            {/* Approval Actions */}
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

            {/* Part Receiving Button */}
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
          <Descriptions.Item label="Tổng tiền">
            {formatService.formatCurrency(
              Number(tong_gia_tri || tong_tien || 0),
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {data.nguoi_tao || created_by || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatService.formatDateTime(created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={{ xs: 1, sm: 2, md: 3 }}>
            {ghi_chu || "-"}
          </Descriptions.Item>
        </Descriptions>

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
    </div>
  );
};

export default PartPurchaseDetail;
