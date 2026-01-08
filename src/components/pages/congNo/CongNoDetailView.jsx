import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Card, Button, Space, Tag, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { congNoAPI, khoAPI } from "../../../api";
import { formatService } from "../../../services";

const CongNoDetailView = () => {
  const { ma_kho_no, ma_kho_co } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);

  useEffect(() => {
    fetchKhoList();
    fetchData();
  }, [ma_kho_no, ma_kho_co]);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await congNoAPI.getChiTiet({ ma_kho_no, ma_kho_co });
      setData(res.data || []);
    } catch (error) {
      console.error("Error fetching details", error);
    } finally {
      setLoading(false);
    }
  };

  const getKhoName = (ma) => {
    const k = khoList.find((i) => i.ma_kho === ma);
    return k ? k.ten_kho : ma;
  };

  const columns = [
    {
      title: "Ngày phát sinh",
      dataIndex: "created_at", // or ngay_chung_tu
      render: (val) => formatService.formatDateTime(val),
    },
    {
      title: "Nguồn (Số phiếu)",
      dataIndex: "so_chung_tu",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Số tiền",
      dataIndex: "so_tien_phat_sinh",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Đã trả",
      dataIndex: "so_tien_da_tra",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Còn lại",
      dataIndex: "so_tien_con_lai",
      align: "right",
      render: (val) => (
        <b style={{ color: "red" }}>{formatService.formatCurrency(val)}</b>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      align: "center",
      render: (status) => {
        let color = "default";
        let label = status;
        if (status === "CHUA_TT") {
          color = "red";
          label = "Chưa thanh toán";
        }
        if (status === "DANG_TT") {
          color = "orange";
          label = "Đang thanh toán";
        }
        if (status === "DA_TT") {
          color = "green";
          label = "Đã thanh toán";
        }
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/cong-no/quan-ly")}
            />
            <span>Chi tiết công nợ</span>
          </Space>
        }
      >
        <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Kho Nợ (Người Trả)">
            <b>{getKhoName(ma_kho_no)}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Kho Có (Người Nhận)">
            <b>{getKhoName(ma_kho_co)}</b>
          </Descriptions.Item>
        </Descriptions>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default CongNoDetailView;
