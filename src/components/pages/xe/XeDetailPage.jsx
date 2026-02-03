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
import { useResponsive } from "../../hooks/useResponsive";
import {
  formatService,
  notificationService,
  authService,
} from "../../services";
import { XE_TRANG_THAI_COLORS } from "../../utils/constants";

const { TabPane } = Tabs;

const XeDetailPage = () => {
  const { isMobile } = useResponsive();
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
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[8, 16]}>
          <Col xs={24} sm={16}>
            <h1
              style={{ margin: 0, fontSize: isMobile ? "1.25rem" : "1.5rem" }}
            >
              <Space wrap>
                <CarOutlined />
                <span>Xe: {xe.xe_key}</span>
              </Space>
            </h1>
            <p style={{ color: "#8c8c8c", margin: 0 }}>
              Chi tiết và lịch sử xe
            </p>
          </Col>
          <Col
            xs={24}
            sm={8}
            style={{ textAlign: isMobile ? "left" : "right" }}
          >
            <Space wrap>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/xe/ton-kho")}
              >
                Trở lại
              </Button>
              {authService.canEdit() && xe.trang_thai !== "DA_BAN" && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Sửa
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Tabs defaultActiveKey="info" size={isMobile ? "small" : "middle"}>
        {/* Tab Thông tin */}
        <TabPane
          tab={
            <span>
              <InfoCircleOutlined />
              Thông tin
            </span>
          }
          key="info"
        >
          <Card size="small">
            <Descriptions
              bordered
              column={{ xs: 1, sm: 1, md: 2 }}
              size="small"
              labelStyle={{
                fontWeight: 600,
                width: isMobile ? "auto" : "150px",
              }}
            >
              <Descriptions.Item label="Mã xe">
                <strong>{xe.xe_key}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Space wrap>
                  <Tag
                    color={XE_TRANG_THAI_COLORS[xe.trang_thai]}
                    style={{ margin: 0 }}
                  >
                    {formatService.formatXeTrangThai(xe.trang_thai)}
                  </Tag>
                  {xe.locked && (
                    <Tag color="red" style={{ margin: 0 }}>
                      Bị khóa
                    </Tag>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Loại xe">
                {xe.ten_loai}
              </Descriptions.Item>

              <Descriptions.Item label="Màu sắc">
                <Tag color={xe.gia_tri_mau}>{xe.ten_mau}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Kho hiện tại">
                <strong>{xe.ten_kho}</strong>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày nhập">
                {formatService.formatDate(xe.ngay_nhap)}
              </Descriptions.Item>

              <Descriptions.Item label="Nơi sản xuất">
                {xe.thong_so_ky_thuat?.noi_sx || xe.ten_noi_sx || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Loại hình">
                {xe.thong_so_ky_thuat?.loai_hinh || xe.ten_lh || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Phân khối">
                {xe.thong_so_ky_thuat?.phan_khoi || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ margin: "16px 0" }}>
              Số máy & Số khung
            </Divider>

            <Descriptions
              bordered
              column={1}
              size="small"
              labelStyle={{
                fontWeight: 600,
                width: isMobile ? "auto" : "150px",
              }}
            >
              <Descriptions.Item label="Số khung">
                <code
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "bold",
                  }}
                >
                  {formatService.formatSoKhung(xe.so_khung)}
                </code>
              </Descriptions.Item>

              <Descriptions.Item label="Số máy">
                <code
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "bold",
                  }}
                >
                  {formatService.formatSoMay(xe.so_may)}
                </code>
              </Descriptions.Item>

              {xe.bien_so && (
                <Descriptions.Item label="Biển số">
                  <strong>{formatService.formatBienSo(xe.bien_so)}</strong>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left" style={{ margin: "16px 0" }}>
              Giá bán
            </Divider>

            <Descriptions
              bordered
              column={{ xs: 1, sm: 2 }}
              size="small"
              labelStyle={{
                fontWeight: 600,
                width: isMobile ? "auto" : "150px",
              }}
            >
              <Descriptions.Item label="Giá nhập">
                <strong style={{ color: "#1890ff" }}>
                  {formatService.formatCurrency(xe.gia_nhap)}
                </strong>
              </Descriptions.Item>

              <Descriptions.Item label="Giá bán">
                {xe.gia_ban ? (
                  <strong style={{ color: "#52c41a" }}>
                    {formatService.formatCurrency(xe.gia_ban)}
                  </strong>
                ) : (
                  "-"
                )}
              </Descriptions.Item>
            </Descriptions>

            {xe.da_ban && xe.khach_hang && (
              <>
                <Divider orientation="left" style={{ margin: "16px 0" }}>
                  Khách hàng
                </Divider>
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  labelStyle={{
                    fontWeight: 600,
                    width: isMobile ? "auto" : "150px",
                  }}
                >
                  <Descriptions.Item label="Họ tên">
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
                <Divider orientation="left" style={{ margin: "16px 0" }}>
                  Thông tin khóa
                </Divider>
                <Descriptions
                  bordered
                  column={1}
                  size="small"
                  labelStyle={{
                    fontWeight: 600,
                    width: isMobile ? "auto" : "150px",
                  }}
                >
                  <Descriptions.Item label="Bởi">
                    {xe.locked_by}
                  </Descriptions.Item>
                  <Descriptions.Item label="Lúc">
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
                <Divider orientation="left" style={{ margin: "16px 0" }}>
                  Ghi chú
                </Divider>
                <p style={{ margin: 0 }}>{xe.ghi_chu}</p>
              </>
            )}
          </Card>
        </TabPane>

        {/* Tab Lịch sử */}
        <TabPane
          tab={
            <span>
              <HistoryOutlined />
              Lịch sử
            </span>
          }
          key="history"
        >
          <Card size="small">
            <div style={{ marginBottom: 16 }}>
              <Button
                size="small"
                icon={<ReloadOutlined />}
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
              size="small"
              loading={loadingLichSu}
              pagination={{ pageSize: 10, size: "small" }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: "Chưa có lịch sử" }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default XeDetailPage;
