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
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { maintenanceAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";

const MaintenanceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await maintenanceAPI.getMaintenanceDetail(id);
      setData(res.data || res);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết phiếu bảo trì");
    } finally {
      setLoading(false);
    }
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
            <span>Chi tiết phiếu bảo trì {data.ma_phieu}</span>
          </Space>
        }
        extra={
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In phiếu
          </Button>
        }
        size="small"
      >
        <Descriptions
          bordered
          size="small"
          column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Mã phiếu">
            {data.ma_phieu}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày lập">
            {formatService.formatDate(data.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Nhân viên">
            {data.User?.fullname || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Xe (Số khung)">
            {data.ma_serial}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {data.Partner?.ho_ten || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Số KM">
            {formatService.formatNumber(data.so_km_hien_tai)}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={3}>
            {data.ghi_chu || "Không có"}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">Danh sách hạng mục</Divider>

        <Table
          dataSource={data.MaintenanceDetails || []}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
          summary={(pageData) => {
            const total = pageData.reduce(
              (sum, item) => sum + (item.thanh_tien || 0),
              0,
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong>Tổng cộng:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ color: "#1677ff", fontSize: "16px" }}>
                    {formatService.formatCurrency(total)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default MaintenanceDetailPage;
