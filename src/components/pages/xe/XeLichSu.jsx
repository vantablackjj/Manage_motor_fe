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

  const fetchData = async (key = xeKey) => {
    if (!key) return;

    setLoading(true);
    try {
      const res = await xeAPI.getLichSu(key);
      setData(Array.isArray(res?.data) ? res.data : []);
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
      width: 160,
      render: (v) => formatService.formatDateTime(v),
    },
    {
      title: "Sự kiện",
      dataIndex: "loai_giao_dich",
      width: 140,
      render: (v) => (
        <Tag color={SU_KIEN_COLORS[v] || "default"}>
          {formatService.formatXeTrangThai(v)}
        </Tag>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "dien_giai",
      ellipsis: true,
    },
    {
      title: "Người thao tác",
      dataIndex: "nguoi_thuc_hien",
      width: 160,
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
                <span>Lịch sử xe</span>
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
              disabled={!xeKey}
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
          placeholder="Nhập mã xe (xe_key)..."
          allowClear
          enterButton={isMobile ? <HistoryOutlined /> : "Xem lịch sử"}
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
        {!xeKey ? (
          <Empty
            description="Nhập mã xe để xem"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={false}
            size="small"
            scroll={{ x: 600 }}
            locale={{ emptyText: "Chưa có lịch sử" }}
          />
        )}
      </Card>
    </div>
  );
};

export default XeLichSuPage;
