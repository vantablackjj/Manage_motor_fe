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
  const { ma_phieu } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { phieu: {}, chi_tiet_xe: [], chi_tiet_phu_tung: [] }
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
      // res.data structure: { phieu, chi_tiet_xe, chi_tiet_phu_tung }
      setData(res.data);
    } catch (error) {
      notificationService.error("Không thể tải chi tiết phiếu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    const { phieu } = data;
    Modal.confirm({
      title: "Xác nhận phê duyệt",
      content:
        "Bạn có chắc chắn muốn phê duyệt phiếu chuyển kho này? Kho xuất sẽ bị trừ tồn kho và kho nhập sẽ được cộng tồn kho.",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await chuyenKhoAPI.pheDuyet(phieu.so_phieu);
          notificationService.success("Phê duyệt thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Lỗi phê duyệt"
          );
        }
      },
    });
  };

  const handleGuiDuyet = async () => {
    const { phieu } = data;
    try {
      await chuyenKhoAPI.guiDuyet(phieu.so_phieu);
      notificationService.success("Đã gửi duyệt thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi gửi duyệt");
    }
  };

  const handleReject = async () => {
    const { phieu } = data;
    try {
      await chuyenKhoAPI.huy(phieu.so_phieu, reason);
      notificationService.success("Đã từ chối/hủy phiếu");
      setRejectModalHtml(false);
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi hủy phiếu");
    }
  };

  const getKhoName = (ma_kho) => {
    const k = khoList.find((item) => item.ma_kho === ma_kho);
    return k ? k.ten_kho : ma_kho;
  };

  if (!data || !data.phieu) return null;

  const { phieu, chi_tiet_xe, chi_tiet_phu_tung } = data;

  const isPending =
    phieu.trang_thai === "NHAP" || phieu.trang_thai === "GUI_DUYET";
  const canApprove =
    authService.canApprove() && phieu.trang_thai === "GUI_DUYET";
  const canSend = phieu.trang_thai === "NHAP";

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/chuyen-kho")}
            />
            <span>Chi tiết phiếu chuyển: {phieu.so_phieu}</span>
            <Tag color={TRANG_THAI_COLORS[phieu.trang_thai]}>
              {TRANG_THAI_LABELS[phieu.trang_thai]}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {canSend && (
              <Button type="primary" onClick={handleGuiDuyet}>
                Gửi duyệt
              </Button>
            )}

            {canApprove && (
              <>
                <Button danger onClick={() => setRejectModalHtml(true)}>
                  Từ chối
                </Button>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                >
                  Phê duyệt
                </Button>
              </>
            )}

            {/* Show cancel for creator if still draft */}
            {phieu.trang_thai === "NHAP" && (
              <Button danger onClick={() => setRejectModalHtml(true)}>
                Hủy phiếu
              </Button>
            )}

            <Button icon={<PrinterOutlined />}>In phiếu</Button>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
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
          <Descriptions.Item label="Người tạo">
            {phieu.nguoi_tao}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatService.formatDateTime(phieu.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {phieu.dien_giai}
          </Descriptions.Item>
          {phieu.so_phieu_xuat && (
            <Descriptions.Item label="Phiếu xuất kho">
              <a onClick={() => navigate(`/xuat-kho/${phieu.so_phieu_xuat}`)}>
                {phieu.so_phieu_xuat}
              </a>
            </Descriptions.Item>
          )}
          {phieu.so_phieu_nhap && (
            <Descriptions.Item label="Phiếu nhập kho">
              <a onClick={() => navigate(`/nhap-kho/${phieu.so_phieu_nhap}`)}>
                {phieu.so_phieu_nhap}
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Danh sách xe */}
        {chi_tiet_xe && chi_tiet_xe.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3>Danh sách Xe</h3>
            <Table
              dataSource={chi_tiet_xe}
              rowKey="xe_key"
              pagination={false}
              columns={[
                { title: "STT", render: (_, __, i) => i + 1, width: 60 },
                { title: "Số khung", dataIndex: "so_khung" },
                { title: "Số máy", dataIndex: "so_may" },
                { title: "Mã loại xe", dataIndex: "ma_loai_xe" },
                {
                  title: "Giá trị",
                  dataIndex: "gia_tri_chuyen_kho",
                  render: (val) => formatService.formatCurrency(val),
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
              columns={[
                { title: "STT", render: (_, __, i) => i + 1, width: 60 },
                { title: "Mã PT", dataIndex: "ma_pt" },
                { title: "Tên PT", dataIndex: "ten_pt" },
                { title: "ĐVT", dataIndex: "don_vi_tinh" },
                { title: "Số lượng", dataIndex: "so_luong" },
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
              ]}
            />
          </div>
        )}
      </Card>

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
