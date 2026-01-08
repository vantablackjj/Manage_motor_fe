// src/components/pages/xe/DanhSachXeBiKhoa.jsx
import React, { useState, useEffect } from "react";
import { Table, Button, Space, Tag, Tooltip, message } from "antd";
import { UnlockOutlined, ReloadOutlined } from "@ant-design/icons";
import { xeAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import { XE_TRANG_THAI_COLORS } from "../../../utils/constant";
import { useResponsive } from "../../../hooks/useResponsive";

const DanhSachXeBiKhoa = ({ ma_kho }) => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (ma_kho) {
      fetchData();
    }
  }, [ma_kho]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await xeAPI.getTonKho(ma_kho);
      const allXe = response.data || [];

      // Lọc chỉ lấy xe bị khóa
      const lockedXe = allXe.filter((xe) => xe.locked === true);

      setData(lockedXe);
    } catch (error) {
      notificationService.error("Không thể tải danh sách xe bị khóa");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async (xe_key) => {
    try {
      await xeAPI.unlock(xe_key);
      notificationService.success("Đã mở khóa xe");
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Không thể mở khóa xe"
      );
    }
  };

  const columns = [
    {
      title: "Mã xe",
      dataIndex: "xe_key",
      key: "xe_key",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại xe",
      dataIndex: "ten_loai",
      key: "ten_loai",
      width: 150,
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
      title: "Số khung",
      dataIndex: "so_khung",
      key: "so_khung",
      width: 180,
      render: (text) => formatService.formatSoKhung(text),
    },
    {
      title: "Số máy",
      dataIndex: "so_may",
      key: "so_may",
      width: 150,
      render: (text) => formatService.formatSoMay(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 120,
      render: (text) => (
        <Tag color={XE_TRANG_THAI_COLORS[text]}>
          {formatService.formatXeTrangThai(text)}
        </Tag>
      ),
    },
    {
      title: "Lý do khóa",
      dataIndex: "ly_do_khoa",
      key: "ly_do_khoa",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {authService.canEdit() && (
            <Tooltip title="Mở khóa xe">
              <Button
                type="link"
                size="small"
                icon={<UnlockOutlined />}
                onClick={() => handleUnlock(record.xe_key)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button icon={<ReloadOutlined />} onClick={fetchData}>
          Làm mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="xe_key"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} xe bị khóa`,
        }}
        locale={{
          emptyText: "Không có xe bị khóa",
        }}
      />
    </div>
  );
};

export default DanhSachXeBiKhoa;
