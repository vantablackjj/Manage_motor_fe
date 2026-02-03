// src/pages/xe/XeLichSuPage.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  Space,
  Tag,
  Button,
  Input,
  Empty,
  Row,
  Col,
} from "antd";
import {
  HistoryOutlined,
  ReloadOutlined,
  CarOutlined,
} from "@ant-design/icons";

import { xeAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { Search } = Input;

const SU_KIEN_COLORS = {
  NHAP_KHO: "green",
  CAP_NHAT: "blue",
  CHUYEN_KHO: "geekblue",
  DA_BAN: "red",
  KHOA_XE: "volcano",
  MO_KHOA: "cyan",
};

const XeLichSuPage = () => {
  const { isMobile } = useResponsive();

  const [xeKey, setXeKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (key = xeKey) => {
    setLoading(true);
    try {
      // Nếu key rỗng, API có thể trả về toàn bộ/lịch sử gần đây
      const res = await xeAPI.getLichSu(key);
      const rawData = Array.isArray(res?.data) ? res.data : [];

      // Sắp xếp: Mới nhất lên đầu
      const sortedData = [...rawData].sort((a, b) => {
        const tA = new Date(a.ngay_giao_dich || 0).getTime();
        const tB = new Date(b.ngay_giao_dich || 0).getTime();
        return tB - tA;
      });

      setData(sortedData);
    } catch {
      notificationService.error("Không thể tải lịch sử xe");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "ngay_giao_dich",
      width: 150,
      render: (v) => formatService.formatDateTime(v),
    },
    {
      title: "Mã xe / Serial",
      dataIndex: "ma_serial",
      width: 150,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "11px", color: "#888" }}>
            {record.ma_hang_hoa}
          </div>
        </div>
      ),
    },
    {
      title: "Sự kiện",
      dataIndex: "loai_giao_dich",
      width: 120,
      render: (v) => (
        <Tag color={SU_KIEN_COLORS[v] || "default"}>
          {formatService.formatXeTrangThai(v)}
        </Tag>
      ),
    },
    {
      title: "Số phiếu",
      dataIndex: "so_chung_tu",
      width: 140,
      render: (t) => <b>{t}</b>,
    },
    {
      title: "Kho",
      key: "kho",
      width: 180,
      render: (_, r) => {
        if (r.ma_kho_xuat && r.ma_kho_nhap) {
          return (
            <span>
              {r.kho_xuat || r.ma_kho_xuat} {"->"} {r.kho_nhap || r.ma_kho_nhap}
            </span>
          );
        }
        if (r.ma_kho_nhap) {
          return (
            <span style={{ color: "green" }}>
              Về: {r.kho_nhap || r.ma_kho_nhap}
            </span>
          );
        }
        if (r.ma_kho_xuat) {
          return (
            <span style={{ color: "red" }}>
              Từ: {r.kho_xuat || r.ma_kho_xuat}
            </span>
          );
        }
        return "-";
      },
    },
    {
      title: "SL",
      dataIndex: "so_luong",
      width: 60,
      align: "center",
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      width: 120,
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Mô tả",
      dataIndex: "dien_giai",
      ellipsis: true,
    },
    {
      title: "Người thao tác",
      dataIndex: "nguoi_thuc_hien",
      width: 140,
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
                <HistoryOutlined />
                <span>Lịch sử chi tiết</span>
              </Space>
            </h1>
          </Col>
          <Col
            xs={24}
            sm={8}
            style={{ textAlign: isMobile ? "left" : "right" }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchData()}
              size="small"
              block={isMobile}
            >
              Tải lại
            </Button>
          </Col>
        </Row>
      </div>

      {/* Bộ chọn xe */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Search
          placeholder="Nhập mã xe hoặc Model..."
          allowClear
          enterButton={isMobile ? <HistoryOutlined /> : "Tìm kiếm"}
          size="small"
          onSearch={(value) => {
            setXeKey(value);
            fetchData(value);
          }}
          style={{ width: "100%", maxWidth: isMobile ? "100%" : 400 }}
        />
      </Card>

      {/* Table */}
      <Card size="small">
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, size: "small" }}
          size="small"
          scroll={{ x: 1000 }}
          locale={{ emptyText: "Chưa có dữ liệu lịch sử" }}
        />
      </Card>
    </div>
  );
};

export default XeLichSuPage;
