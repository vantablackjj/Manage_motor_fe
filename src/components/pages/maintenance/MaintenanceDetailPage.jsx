import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Row,
  Col,
  Divider,
  Spin,
  Modal,
  Select,
  Form,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import PrintTemplate from "../../features/Print/PrintTemplate";
import { useNavigate, useParams } from "react-router-dom";
import { maintenanceAPI, khoAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { TRANG_THAI_LABELS, TRANG_THAI_COLORS } from "../../../utils/constant";

const MaintenanceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const [khoList, setKhoList] = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [form] = Form.useForm();

  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printType, setPrintType] = useState("MAINTENANCE");

  const handlePrintLocal = () => {
    setPrintModalVisible(true);
    setTimeout(() => {
      const printContent = document.getElementById("print-content");
      if (printContent) {
        const originalContents = document.body.innerHTML;
        const printContents = printContent.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
      }
    }, 500);
  };

  useEffect(() => {
    fetchDetail();
    fetchWarehouses();
  }, [id]);

  const fetchWarehouses = async () => {
    try {
      const res = await khoAPI.getAll({ limit: 100 });
      setKhoList(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDetail = async () => {
    try {
      const res = await maintenanceAPI.getMaintenanceDetail(id);
      setData(res.data || res);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết phiếu dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    newStatus,
    ma_kho = null,
    hinh_thuc_thanh_toan = null,
  ) => {
    setStatusLoading(true);
    try {
      await maintenanceAPI.updateStatus(id, {
        trang_thai: newStatus,
        ma_kho,
        hinh_thuc_thanh_toan: hinh_thuc_thanh_toan || undefined,
      });
      notificationService.success(
        `Cập nhật trạng thái [${TRANG_THAI_LABELS[newStatus]}] thành công`,
      );
      fetchDetail();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi cập nhật trạng thái",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  const confirmCancel = () => {
    Modal.confirm({
      title: "Xác nhận hủy phiếu dịch vụ",
      content:
        "Bạn có chắc chắn muốn hủy phiếu này không? Mọi thông tin gắn vào bàn nâng sẽ bị xóa.",
      okText: "Hủy phiếu",
      okType: "danger",
      onOk: () => handleUpdateStatus("DA_HUY"),
    });
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "loai_hang_muc",
      render: (text) => (
        <Tag color={text === "PHU_TUNG" ? "blue" : "green"}>
          {text === "PHU_TUNG" ? "Phụ tùng" : "Dịch vụ"}
        </Tag>
      ),
    },
    {
      title: "Tên hạng mục",
      dataIndex: "ten_hang_muc",
      render: (text, record) => (
        <span>
          {record.ma_hang_hoa && <Tag>{record.ma_hang_hoa}</Tag>}
          {text}
        </span>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      align: "right",
      render: (val) => formatService.formatNumber(val),
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      align: "right",
      render: (val) => <strong>{formatService.formatCurrency(val)}</strong>,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghi_chu",
    },
  ];

  if (loading)
    return (
      <div style={{ padding: 100, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  if (!data) return <div>Không tìm thấy dữ liệu</div>;

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/maintenance")}
              type="text"
            />
            <span>Chi tiết phiếu dịch vụ {data.ma_phieu}</span>
            <Tag color={TRANG_THAI_COLORS[data.trang_thai] || "default"}>
              {TRANG_THAI_LABELS[data.trang_thai] || data.trang_thai}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {data.trang_thai === "TIEP_NHAN" && (
              <Button
                type="primary"
                onClick={() => handleUpdateStatus("DANG_SUA")}
                loading={statusLoading}
              >
                Bắt đầu sửa (Lên bàn nâng)
              </Button>
            )}
            {data.trang_thai === "DANG_SUA" && (
              <Button
                type="primary"
                onClick={() => handleUpdateStatus("CHO_THANH_TOAN")}
                loading={statusLoading}
              >
                Hoàn thành sửa {"->"} Chờ thanh toán
              </Button>
            )}
            {data.trang_thai === "CHO_THANH_TOAN" && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  let defaultPaymentMethod = "TIEN_MAT";
                  Modal.confirm({
                    title: "Xác nhận Hoàn thành & Thanh toán",
                    width: 500,
                    content: (
                      <div>
                        <p>
                          Hệ thống sẽ ghi nhận hoàn thành, trừ tồn kho phụ tùng
                          và
                          <strong> tạo phiếu thu</strong> cho số tiền:
                          <span
                            style={{
                              color: "#f5222d",
                              fontSize: "18px",
                              marginLeft: "8px",
                            }}
                          >
                            {formatService.formatCurrency(data.tong_tien)}
                          </span>
                        </p>
                        <Divider />
                        <Form layout="vertical">
                          <Form.Item label="Hình thức thanh toán">
                            <Select
                              defaultValue="TIEN_MAT"
                              onChange={(val) => {
                                defaultPaymentMethod = val;
                              }}
                            >
                              <Select.Option value="TIEN_MAT">
                                Tiền mặt
                              </Select.Option>
                              <Select.Option value="CHUYEN_KHOAN">
                                Chuyển khoản
                              </Select.Option>
                              <Select.Option value="THE">
                                Quẹt thẻ
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </Form>
                        <p style={{ fontSize: "12px", color: "#8c8c8c" }}>
                          Kho xuất:{" "}
                          <strong>{data.ten_kho || data.ma_kho}</strong>
                        </p>
                      </div>
                    ),
                    okText: "Hoàn tất & Thu tiền",
                    cancelText: "Quay lại",
                    onOk: () =>
                      handleUpdateStatus(
                        "HOAN_THANH",
                        data.ma_kho,
                        defaultPaymentMethod,
                      ),
                  });
                }}
                loading={statusLoading}
              >
                Hoàn thành & Xuất kho
              </Button>
            )}
            {!["HOAN_THANH", "DA_HUY"].includes(data.trang_thai) && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={confirmCancel}
                loading={statusLoading}
              >
                Hủy phiếu
              </Button>
            )}
            <Button icon={<PrinterOutlined />} onClick={handlePrintLocal}>
              In phiếu
            </Button>
          </Space>
        }
        size="small"
      >
        <Descriptions
          bordered
          size="small"
          column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Mã phiếu">
            <strong>{data.ma_phieu}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày lập">
            {formatService.formatDate(data.ngay_bao_tri)}
          </Descriptions.Item>
          <Descriptions.Item label="Người lập phiếu">
            {data.nguoi_lap_phieu || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Xe (Số khung)">
            {data.so_khung} ({data.ten_loai_xe})
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {data.ten_khach_hang} - {data.dien_thoai}
          </Descriptions.Item>
          <Descriptions.Item label="Số KM">
            {formatService.formatNumber(data.so_km_hien_tai)}
          </Descriptions.Item>
          <Descriptions.Item label="Phân loại">
            <Tag color={data.loai_bao_tri === "MIEN_PHI" ? "green" : "blue"}>
              {data.loai_bao_tri}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kỹ thuật viên">
            {data.ten_ktv || data.ktv_chinh || "Chưa phân công"}
          </Descriptions.Item>
          <Descriptions.Item label="Tiền phụ tùng">
            {formatService.formatCurrency(data.tien_phu_tung)}
          </Descriptions.Item>
          <Descriptions.Item label="Tiền công">
            {formatService.formatCurrency(data.tien_cong)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {data.ghi_chu || "Không có"}
          </Descriptions.Item>
        </Descriptions>

        <Divider titlePlacement="left">Danh sách hạng mục</Divider>

        <Table
          dataSource={data.chi_tiet || []}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          summary={(pageData) => {
            const total = pageData.reduce(
              (sum, item) => sum + Number(item.thanh_tien || 0),
              0,
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Tổng thanh toán:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ color: "#f5222d", fontSize: "16px" }}>
                    {formatService.formatCurrency(total)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      {/* Print Modal */}
      <Modal
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        footer={null}
        width={800}
        style={{ display: "none" }}
      >
        {data && <PrintTemplate data={data} type={printType} />}
      </Modal>
    </div>
  );
};

export default MaintenanceDetailPage;
