import React, { useEffect, useState } from "react";
import { Modal, Table, Tag, Space, Button } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { phuTungAPI } from "../../../api";
import { message } from "antd";

const LichSuModal = ({ visible, onClose, ma_pt, ten_pt }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    console.log(ma_pt);
  }, [ma_pt]);

  useEffect(() => {
    if (visible && ma_pt) {
      loadLichSu();
    } else {
      setData([]); // clear data khi đóng modal hoặc ma_pt rỗng
    }
  }, [visible, ma_pt]);

  const loadLichSu = async () => {
    console.log("Gọi API lịch sử cho ma_pt:", ma_pt);
    setLoading(true);
    try {
      const response = await phuTungAPI.getLichSu(ma_pt);
      console.log("Response:", response);
      if (response?.success) {
        setData(response.data || []);
      } else {
        setData([]);
        message.warning("Không có dữ liệu lịch sử");
      }
    } catch (error) {
      message.error("Không thể tải lịch sử!");
    } finally {
      setLoading(false);
    }
  };

  const loaiGiaoDichColor = {
    NHAP_KHO: "green",
    XUAT_KHO: "red",
    CHUYEN_KHO: "blue",
    BAN_HANG: "orange",
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      width: 150,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Loại GD",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 120,
      render: (loai) => (
        <Tag color={loaiGiaoDichColor[loai]}>{loai.replace(/_/g, " ")}</Tag>
      ),
    },
    {
      title: "Số chứng từ",
      dataIndex: "so_chung_tu",
      key: "so_chung_tu",
      width: 120,
    },
    {
      title: "Kho",
      key: "kho",
      width: 100,
      render: (_, record) => record.ma_kho_nhap || record.ma_kho_xuat,
    },
    {
      title: "SL",
      dataIndex: "so_luong",
      key: "so_luong",
      width: 80,
      align: "right",
      render: (sl) => (
        <span style={{ color: sl > 0 ? "green" : "red" }}>
          {sl > 0 ? "+" : ""}
          {sl}
        </span>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      key: "don_gia",
      width: 120,
      align: "right",
      render: (price) => price?.toLocaleString("vi-VN"),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      key: "thanh_tien",
      width: 130,
      align: "right",
      render: (price) => <strong>{price?.toLocaleString("vi-VN")}</strong>,
    },
    {
      title: "Người thực hiện",
      dataIndex: "nguoi_thuc_hien",
      key: "nguoi_thuc_hien",
      width: 120,
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>Lịch sử giao dịch: {ten_pt}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Tổng ${total} giao dịch`,
        }}
      />
    </Modal>
  );
};
export default LichSuModal;
