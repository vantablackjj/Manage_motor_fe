// src/components/pages/xe/TonKhoXe.jsx
import { useState, useEffect } from "react";
import { Table, Card, Row, Col, Statistic, Tag, Select } from "antd";
import { CarOutlined } from "@ant-design/icons";
import { xeAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;

const TonKhoXe = ({ ma_kho, khoList }) => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedKho, setSelectedKho] = useState(ma_kho);

  useEffect(() => {
    if (selectedKho) {
      fetchData();
    }
  }, [selectedKho]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy danh sách xe thực tế từ kho
      const response = await xeAPI.getTonKho(selectedKho, {
        trang_thai: "TON_KHO",
      });
      const xeList = response.data || [];

      // Tính toán tồn kho theo loại xe + màu
      const tonKhoMap = {};

      xeList.forEach((xe) => {
        // Group by type and color (handle missing ma_mau)
        const colorKey = xe.ma_mau || xe.ten_mau || "N/A";
        const key = `${xe.ma_loai_xe || "N/A"}_${colorKey}`;

        if (!tonKhoMap[key]) {
          tonKhoMap[key] = {
            ma_kho: selectedKho,
            ma_loai_xe: xe.ma_loai_xe,
            ten_loai: xe.ten_loai,
            ma_mau: xe.ma_mau,
            ten_mau: xe.ten_mau,
            gia_tri_mau: xe.gia_tri_mau,
            so_luong_ton: 0,
            tong_gia_nhap: 0,
            ngay_cap_nhat: xe.ngay_nhap,
          };
        }

        tonKhoMap[key].so_luong_ton += 1;
        tonKhoMap[key].tong_gia_nhap += parseFloat(xe.gia_nhap || 0);

        // Update to latest date
        if (
          xe.ngay_nhap &&
          (!tonKhoMap[key].ngay_cap_nhat ||
            new Date(xe.ngay_nhap) > new Date(tonKhoMap[key].ngay_cap_nhat))
        ) {
          tonKhoMap[key].ngay_cap_nhat = xe.ngay_nhap;
        }
      });

      // Convert map to array and calculate average price
      const tonKhoData = Object.values(tonKhoMap).map((item) => {
        const vehiclesRaw = xeList.filter((xe) => {
          const xeColorKey = xe.ma_mau || xe.ten_mau || "N/A";
          const itemColorKey = item.ma_mau || item.ten_mau || "N/A";
          return (
            xe.ma_loai_xe === item.ma_loai_xe && xeColorKey === itemColorKey
          );
        });
        return {
          ...item,
          gia_nhap:
            item.so_luong_ton > 0 ? item.tong_gia_nhap / item.so_luong_ton : 0,
          vehicles: vehiclesRaw,
        };
      });

      setData(tonKhoData);
    } catch (error) {
      notificationService.error("Không thể tải tồn kho xe");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán thống kê
  const tongSoLuong = data.reduce(
    (sum, item) => sum + (item.so_luong_ton || 0),
    0,
  );
  const tongGiaTri = data.reduce(
    (sum, item) => sum + (item.so_luong_ton || 0) * (item.gia_nhap || 0),
    0,
  );
  const loaiXeTonKho = data.filter((item) => item.so_luong_ton > 0).length;

  const columns = [
    {
      title: "Mã kho",
      dataIndex: "ma_kho",
      key: "ma_kho",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Loại xe",
      dataIndex: "ten_loai",
      key: "ten_loai",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Màu",
      dataIndex: "ten_mau",
      key: "ten_mau",
      width: 100,
      render: (text, record) => <Tag color={record.gia_tri_mau}>{text}</Tag>,
    },
    {
      title: "Số lượng tồn",
      dataIndex: "so_luong_ton",
      key: "so_luong_ton",
      width: 130,
      align: "right",
      render: (num) => (
        <Tag color={num === 0 ? "red" : "green"}>
          <strong>{num}</strong>
        </Tag>
      ),
    },
    {
      title: "Giá nhập TB",
      dataIndex: "gia_nhap",
      key: "gia_nhap",
      width: 150,
      align: "right",
      render: (price) => formatService.formatCurrency(price),
    },
    {
      title: "Giá trị tồn",
      key: "gia_tri_ton",
      width: 150,
      align: "right",
      render: (_, record) =>
        formatService.formatCurrency(
          (record.so_luong_ton || 0) * (record.gia_nhap || 0),
        ),
    },
    {
      title: "Cập nhật",
      dataIndex: "ngay_cap_nhat",
      key: "ngay_cap_nhat",
      width: 160,
      render: (d) => formatService.formatDateTime(d),
    },
  ];

  return (
    <div>
      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Chọn kho"
          style={{ width: 200 }}
          value={selectedKho}
          onChange={setSelectedKho}
        >
          {khoList.map((kho) => (
            <Option key={kho.ma_kho} value={kho.ma_kho}>
              {kho.ten_kho}
            </Option>
          ))}
        </Select>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} md={8}>
          <Card size="small">
            <Statistic
              title="Tổng số lượng"
              value={tongSoLuong}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card size="small">
            <Statistic
              title="Loại xe tồn kho"
              value={loaiXeTonKho}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title="Giá trị tồn kho"
              value={tongGiaTri}
              formatter={(value) => formatService.formatCurrency(value)}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(record) =>
          `${record.ma_kho}-${record.ma_loai_xe}-${record.ma_mau}`
        }
        loading={loading}
        scroll={{ x: 1100 }}
        expandable={{
          expandedRowRender: (record) => (
            <Table
              columns={[
                { title: "Xe Key", dataIndex: "xe_key", width: 150 },
                { title: "Số khung", dataIndex: "so_khung", width: 180 },
                { title: "Số máy", dataIndex: "so_may", width: 150 },
                {
                  title: "Ngày nhập",
                  dataIndex: "ngay_nhap",
                  render: (d) => formatService.formatDateTime(d),
                },
                {
                  title: "Giá nhập",
                  dataIndex: "gia_nhap",
                  align: "right",
                  render: (v) => formatService.formatCurrency(v),
                },
              ]}
              dataSource={record.vehicles}
              pagination={false}
              size="small"
              rowKey="xe_key"
            />
          ),
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} dòng`,
        }}
        locale={{
          emptyText: "Không có dữ liệu tồn kho",
        }}
      />
    </div>
  );
};

export default TonKhoXe;
