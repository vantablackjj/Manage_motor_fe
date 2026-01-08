import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Table, Button, Space, Tag } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { donHangAPI } from "../../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../../services";
import { TRANG_THAI_COLORS } from "../../../../utils/constant";

const PartPurchaseDetail = () => {
  const { id } = useParams(); // so_phieu
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { ma_phieu (or so_phieu), ... items: [] }

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await donHangAPI.getById(id);
      // API might usually return specific structure. Adjust if needed.
      // Assuming res is the object or res.data
      setData(res?.data || res || {});
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
    try {
      await donHangAPI.pheDuyet(id);
      notificationService.success("Đã phê duyệt (Kho đã được cập nhật)");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi phê duyệt");
    }
  };

  if (!data) return null;

  // Adjust keys based on API response structure for Parts
  const {
    so_phieu,
    ngay_dat_hang,
    ten_ncc,
    ten_kho,
    tong_tien,
    dien_giai,
    trang_thai,
    chi_tiet,
  } = data;
  // Note: if API items are nested differently, adapt here.

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase/parts")}
            />
            <span>Chi tiết đơn hàng: {so_phieu}</span>
            <Tag color={TRANG_THAI_COLORS[trang_thai]}>{trang_thai}</Tag>
          </Space>
        }
        extra={
          <Space>
            {trang_thai === "NHAP" && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendApproval}
              >
                Gửi duyệt
              </Button>
            )}
            {trang_thai === "GUI_DUYET" && authService.canApprove() && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
              >
                Phê duyệt
              </Button>
            )}
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Ngày đặt">
            {formatService.formatDate(ngay_dat_hang)}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">
            {ten_ncc || data.ma_ncc}
          </Descriptions.Item>
          <Descriptions.Item label="Kho nhập">
            {ten_kho || data.ma_kho_nhap}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {formatService.formatCurrency(Number(tong_tien))}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {dien_giai}
          </Descriptions.Item>
        </Descriptions>

        <Table
          style={{ marginTop: 24 }}
          dataSource={chi_tiet || []}
          rowKey="id"
          pagination={false}
          columns={[
            { title: "Mã phụ tùng", dataIndex: "ma_pt" },
            {
              title: "Tên phụ tùng",
              dataIndex: "ten_pt",
              render: (text, record) => text || record.ma_pt,
            },
            { title: "ĐVT", dataIndex: "don_vi_tinh" },
            { title: "Số lượng", dataIndex: "so_luong" },
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
    </div>
  );
};

export default PartPurchaseDetail;
