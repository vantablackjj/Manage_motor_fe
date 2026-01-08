import React, { useState, useEffect } from "react";
import { Table, Card, Tag, Button, DatePicker } from "antd";
import { congNoAPI } from "../../../api";
import { formatService } from "../../../services";

const CongNoHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await congNoAPI.getAllThanhToan();
      setData(res.data || []);
    } catch (error) {
      console.error("Error history", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "ngay_thanh_toan",
      render: (val) => formatService.formatDateTime(val),
    },
    {
      title: "Kho trả",
      dataIndex: "ten_kho_tra", // API needs to return name or we map it
      key: "ma_kho_tra",
      render: (text, record) => record.ten_kho_tra || record.ma_kho_tra,
    },
    {
      title: "Kho nhận",
      dataIndex: "ten_kho_nhan",
      key: "ma_kho_nhan",
      render: (text, record) => record.ten_kho_nhan || record.ma_kho_nhan,
    },
    {
      title: "Số tiền",
      dataIndex: "so_tien",
      align: "right",
      render: (val) => (
        <b style={{ color: "green" }}>{formatService.formatCurrency(val)}</b>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "phuong_thuc",
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: "Ghi chú",
      dataIndex: "dien_giai",
    },
  ];

  return (
    <Card title="Lịch sử thanh toán">
      <Button onClick={fetchHistory} style={{ marginBottom: 16 }}>
        Làm mới
      </Button>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );
};

export default CongNoHistory;
