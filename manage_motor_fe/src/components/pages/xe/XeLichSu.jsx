// src/pages/xe/XeLichSuPage.jsx
import React, { useEffect, useState } from "react";
import { Card, Table, Select, Space, Tag, Button, Input, Empty } from "antd";
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
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <HistoryOutlined /> Lịch sử xe
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Tra cứu lịch sử thao tác theo từng xe
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          disabled={!xeKey}
          onClick={() => fetchData()}
        >
          Làm mới
        </Button>
      </div>

      {/* Bộ chọn xe */}
      <Card style={{ marginBottom: 16 }}>
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ width: "100%" }}
        >
          <Search
            placeholder="Nhập mã xe (xe_key)"
            allowClear
            enterButton="Xem lịch sử"
            onSearch={(value) => {
              setXeKey(value);
              fetchData(value);
            }}
            style={{ maxWidth: 400 }}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        {!xeKey ? (
          <Empty description="Vui lòng nhập mã xe để xem lịch sử" />
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            pagination={false}
            locale={{ emptyText: "Xe chưa có lịch sử" }}
          />
        )}
      </Card>
    </div>
  );
};

export default XeLichSuPage;
