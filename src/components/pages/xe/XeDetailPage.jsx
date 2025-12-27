// src/pages/xe/XeDetailPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Timeline,
  Tabs,
  Table,
  Spin,
  Empty,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  HistoryOutlined,
  CarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { xeAPI } from "../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../services";
import { XE_TRANG_THAI_COLORS } from "../../utils/constants";

const { TabPane } = Tabs;

const XeDetailPage = () => {
  const { xe_key } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [xe, setXe] = useState(null);
  const [lichSu, setLichSu] = useState([]);
  const [loadingLichSu, setLoadingLichSu] = useState(false);

  useEffect(() => {
    fetchXeDetail();
  }, [xe_key]);

  const fetchXeDetail = async () => {
    setLoading(true);
    try {
      const data = await xeAPI.getDetail(xe_key);
      setXe(data);
    } catch (error) {
      notificationService.error("Không thể tải thông tin xe");
      navigate("/xe/ton-kho");
    } finally {
      setLoading(false);
    }
  };

  const fetchLichSu = async () => {
    setLoadingLichSu(true);
    try {
      const data = await xeAPI.getLichSu(xe_key);
      setLichSu(data || []);
    } catch (error) {
      notificationService.error("Không thể tải lịch sử");
    } finally {
      setLoadingLichSu(false);
    }
  };

  const handleEdit = () => {
    navigate(`/xe/${xe_key}/edit`);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!xe) {
    return (
      <div className="page-container">
        <Empty description="Không tìm thấy xe" />
      </div>
    );
  }

  const lichSuColumns = [
    {
      title: "Thời gian",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      width: 180,
      render: (text) => formatService.formatDateTime(text),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 150,
      render: (text) => (
        <Tag
          color={
            text === "NHAP_KHO"
              ? "green"
              : text === "XUAT_KHO"
              ? "red"
              : text === "CHUYEN_KHO"
              ? "blue"
              : text === "BAN_HANG"
              ? "purple"
              : "default"
          }
        >
          {formatService.formatLoaiGiaoDich(text)}
        </Tag>
      ),
    },
    {
      title: "Số chứng từ",
      dataIndex: "so_chung_tu",
      key: "so_chung_tu",
      width: 150,
    },
    {
      title: "Kho xuất",
      dataIndex: "ten_kho_xuat",
      key: "ten_kho_xuat",
      width: 150,
    },
    {
      title: "Kho nhập",
      dataIndex: "ten_kho_nhap",
      key: "ten_kho_nhap",
      width: 150,
    },
    {
      title: "Giá trị",
      dataIndex: "gia_tri",
      key: "gia_tri",
      width: 150,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
    },
    {
      title: "Người thực hiện",
      dataIndex: "nguoi_thuc_hien",
      key: "nguoi_thuc_hien",
      width: 150,
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CarOutlined /> Chi tiết xe: {xe.xe_key}
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Thông tin chi tiết và lịch sử của xe
          </p>
        </div>
        <Space>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/xe/ton-kho")}
          >
            Quay lại
          </Button>
          {authService.canEdit() && xe.trang_thai !== "DA_BAN" && (
            <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
              Chỉnh sửa
            </Button>
          )}
        </Space>
      </div>

      <Tabs defaultActiveKey="info">
        {/* Tab Thông tin */}
        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              Thông tin xe
            </span>
          }
          key="info"
        >
          <Card>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              labelStyle={{ fontWeight: 600, width: "200px" }}
            >
              <Descriptions.Item label="Mã xe">
                <strong>{xe.xe_key}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Tag color={XE_TRANG_THAI_COLORS[xe.trang_thai]}>
                  {formatService.formatXeTrangThai(xe.trang_thai)}
                </Tag>
                {xe.locked && (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    Đang bị khóa
                  </Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Loại xe">
                {xe.ten_loai}
              </Descriptions.Item>

              <Descriptions.Item label="Nhãn hiệu">
                {xe.ten_nhan_hieu}
              </Descriptions.Item>

              <Descriptions.Item label="Màu sắc">
                <Tag color={xe.gia_tri_mau}>{xe.ten_mau}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Loại hình">
                {xe.ten_loai_hinh || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi sản xuất">
                {xe.ten_noi_sx || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Kho hiện tại">
                <strong>{xe.ten_kho}</strong>
              </Descriptions.Item>
            </Descriptions>

            <Divider>Thông tin số máy & số khung</Divider>

            <Descriptions
              bordered
              column={1}
              labelStyle={{ fontWeight: 600, width: "200px" }}
            >
              <Descriptions.Item label="Số khung">
                <strong style={{ fontSize: "16px", fontFamily: "monospace" }}>
                  {formatService.formatSoKhung(xe.so_khung)}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Số máy">
                <strong style={{ fontSize: "16px", fontFamily: "monospace" }}>
                  {formatService.formatSoMay(xe.so_may)}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Biển số">
                {xe.bien_so ? (
                  <strong style={{ fontSize: "16px" }}>
                    {formatService.formatBienSo(xe.bien_so)}
                  </strong>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Thông tin giá & ngày tháng</Divider>

            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              labelStyle={{ fontWeight: 600, width: "200px" }}
            >
              <Descriptions.Item label="Giá nhập">
                <strong style={{ color: "#1890ff", fontSize: "16px" }}>
                  {formatService.formatCurrency(xe.gia_nhap)}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Giá bán">
                {xe.gia_ban ? (
                  <strong style={{ color: "#52c41a", fontSize: "16px" }}>
                    {formatService.formatCurrency(xe.gia_ban)}
                  </strong>
                ) : (
                  "-"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày nhập kho">
                {formatService.formatDate(xe.ngay_nhap)}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày bán">
                {xe.ngay_ban ? formatService.formatDate(xe.ngay_ban) : "-"}
              </Descriptions.Item>
            </Descriptions>

            {xe.da_ban && xe.khach_hang && (
              <>
                <Divider>Thông tin khách hàng</Divider>
                <Descriptions
                  bordered
                  column={1}
                  labelStyle={{ fontWeight: 600, width: "200px" }}
                >
                  <Descriptions.Item label="Khách hàng">
                    {xe.khach_hang.ho_ten}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điện thoại">
                    {formatService.formatPhoneNumber(xe.khach_hang.dien_thoai)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {xe.khach_hang.dia_chi || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {xe.locked && (
              <>
                <Divider>Thông tin khóa</Divider>
                <Descriptions
                  bordered
                  column={1}
                  labelStyle={{ fontWeight: 600, width: "200px" }}
                >
                  <Descriptions.Item label="Bị khóa bởi">
                    {xe.locked_by}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian khóa">
                    {formatService.formatDateTime(xe.locked_at)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lý do">
                    {xe.locked_reason || "-"}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            {xe.ghi_chu && (
              <>
                <Divider>Ghi chú</Divider>
                <p>{xe.ghi_chu}</p>
              </>
            )}
          </Card>
        </TabPane>

        {/* Tab Lịch sử */}
        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Lịch sử giao dịch
            </span>
          }
          key="history"
        >
          <Card>
            {lichSu.length === 0 && !loadingLichSu ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Button
                  type="primary"
                  icon={<HistoryOutlined />}
                  onClick={fetchLichSu}
                >
                  Tải lịch sử
                </Button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={fetchLichSu}
                    loading={loadingLichSu}
                  >
                    Làm mới
                  </Button>
                </div>
                <Table
                  dataSource={lichSu}
                  columns={lichSuColumns}
                  rowKey="id"
                  loading={loadingLichSu}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                  locale={{ emptyText: "Chưa có lịch sử giao dịch" }}
                />
              </>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default XeDetailPage;
