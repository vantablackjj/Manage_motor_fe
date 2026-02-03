// src/components/pages/reports/InventoryReportPage.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Tabs,
  Row,
  Col,
  Select,
  Button,
  Space,
  DatePicker,
  Tag,
  Typography,
  Checkbox,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { reportAPI, khoAPI, danhMucAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { Text } = Typography;

const InventoryReportPage = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("ton-kho-xe");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // Lists for filters
  const [khoList, setKhoList] = useState([]);
  const [loaiXeList, setLoaiXeList] = useState([]);
  const [mauList, setMauList] = useState([]);

  // Filter params
  const [params, setParams] = useState({
    ma_kho: null,
    ma_loai_xe: null,
    ma_mau: null,
    nhom_pt: null,
    canh_bao: false,
    ngay_tinh: dayjs(),
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [
    activeTab,
    params.ma_kho,
    params.ma_loai_xe,
    params.ma_mau,
    params.nhom_pt,
    params.canh_bao,
  ]);

  const fetchFilterOptions = async () => {
    try {
      const [khos, loaiXe, mau] = await Promise.all([
        khoAPI.getAll(),
        danhMucAPI.modelCar.getAll(),
        danhMucAPI.color.getAll(),
      ]);
      setKhoList(khos || []);
      setLoaiXeList(loaiXe || []);
      setMauList(mau || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      const apiParams = {
        ...params,
        ngay_tinh: params.ngay_tinh?.format("YYYY-MM-DD"),
      };

      if (activeTab === "ton-kho-xe") {
        res = await reportAPI.inventory.getVehicles(apiParams);
      } else if (activeTab === "ton-kho-pt") {
        res = await reportAPI.inventory.getParts(apiParams);
      } else {
        res = await reportAPI.inventory.getSummary(apiParams);
      }

      const rawData = res?.data !== undefined ? res.data : res;
      const list = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
      setData(list);
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu báo cáo");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      let reportCode = activeTab.toUpperCase().replace(/-/g, "_");
      if (activeTab === "ton-kho-pt") reportCode = "TON_KHO_PHU_TUNG";

      const exportParams = {
        loai_bao_cao: reportCode,
        params: {
          ...params,
          ngay_tinh: params.ngay_tinh?.format("YYYY-MM-DD"),
        },
      };

      const response =
        type === "excel"
          ? await reportAPI.export.excel(exportParams)
          : await reportAPI.export.pdf(exportParams);

      // response is the blob itself because of axios interceptor returning response.data
      const blob = new Blob([response], {
        type:
          type === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BaoCao_${reportCode}_${dayjs().format("YYYYMMDD")}.${type === "excel" ? "xlsx" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      notificationService.error("Lỗi khi xuất file");
    }
  };

  const xeColumns = [
    { title: "STT", key: "stt", width: 50, render: (_, __, i) => i + 1 },
    { title: "Mã xe", dataIndex: "xe_key", key: "xe_key", width: 120 },
    { title: "Loại xe", dataIndex: "ten_loai", key: "ten_loai" },
    { title: "Số khung", dataIndex: "so_khung", key: "so_khung" },
    { title: "Số máy", dataIndex: "so_may", key: "so_may" },
    { title: "Kho", dataIndex: "ten_kho", key: "ten_kho" },
    {
      title: "Giá nhập",
      dataIndex: "gia_nhap",
      key: "gia_nhap",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
  ];

  const ptColumns = [
    { title: "STT", key: "stt", width: 50, render: (_, __, i) => i + 1 },
    { title: "Kho", dataIndex: "ten_kho", key: "ten_kho", width: 150 },
    { title: "Nhóm", dataIndex: "nhom_pt", key: "nhom_pt", width: 100 },
    { title: "Mã phụ tùng", dataIndex: "ma_pt", key: "ma_pt", width: 120 },
    { title: "Tên phụ tùng", dataIndex: "ten_pt", key: "ten_pt" },
    {
      title: "ĐVT",
      dataIndex: "don_vi_tinh",
      key: "don_vi_tinh",
      width: 80,
      align: "center",
    },
    {
      title: "Tổng tồn",
      dataIndex: "so_luong_ton",
      key: "so_luong_ton",
      align: "right",
      width: 100,
    },
    {
      title: "Đang khóa",
      dataIndex: "so_luong_khoa",
      key: "so_luong_khoa",
      align: "right",
      width: 100,
      render: (val) => (
        <span style={{ color: val > 0 ? "orange" : "inherit" }}>{val}</span>
      ),
    },
    {
      title: "Khả dụng",
      key: "kha_dung",
      align: "right",
      width: 100,
      render: (_, record) => (
        <b>{(record.so_luong_ton || 0) - (record.so_luong_khoa || 0)}</b>
      ),
    },
    {
      title: "Cảnh báo",
      key: "canh_bao",
      width: 120,
      align: "center",
      render: (_, record) => {
        const ton = record.so_luong_ton || 0;
        const min = record.so_luong_toi_thieu || 0;
        if (min > 0 && ton <= min) {
          return <Tag color="error">Sắp hết</Tag>;
        }
        return <Tag color="success">An toàn</Tag>;
      },
    },
  ];

  const summaryColumns = [
    { title: "Kho", dataIndex: "ten_kho", key: "ten_kho" },
    { title: "Số lượng xe", dataIndex: "sl_xe", key: "sl_xe", align: "right" },
    {
      title: "Giá trị xe (vốn)",
      dataIndex: "gt_xe",
      key: "gt_xe",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    { title: "Số lượng PT", dataIndex: "sl_pt", key: "sl_pt", align: "right" },
    {
      title: "Giá trị PT (vốn)",
      dataIndex: "gt_pt",
      key: "gt_pt",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Tổng cộng",
      key: "tong",
      align: "right",
      render: (_, record) => (
        <strong>
          {formatService.formatCurrency(
            (Number(record.gt_xe) || 0) + (Number(record.gt_pt) || 0),
          )}
        </strong>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <Space>
            <PieChartOutlined /> Báo cáo tồn kho
          </Space>
        }
        size="small"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "ton-kho-xe", label: "Tồn kho Xe" },
            { key: "ton-kho-pt", label: "Tồn kho Phụ tùng" },
            { key: "ton-kho-tong-hop", label: "Tổng hợp tồn kho" },
          ]}
        />

        <Card size="small" style={{ marginBottom: 16, background: "#fafafa" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <Text strong>Chọn kho:</Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Tất cả kho"
                allowClear
                value={params.ma_kho}
                onChange={(val) => setParams({ ...params, ma_kho: val })}
              >
                {khoList.map((k) => (
                  <Option key={k.ma_kho} value={k.ma_kho}>
                    {k.ten_kho}
                  </Option>
                ))}
              </Select>
            </Col>

            {activeTab === "ton-kho-xe" && (
              <>
                <Col xs={12} sm={8} md={4}>
                  <Text strong>Loại xe:</Text>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Tất cả"
                    allowClear
                    value={params.ma_loai_xe}
                    onChange={(val) =>
                      setParams({ ...params, ma_loai_xe: val })
                    }
                  >
                    {loaiXeList.map((l) => (
                      <Option key={l.ma_loai} value={l.ma_loai}>
                        {l.ten_loai}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={12} sm={8} md={4}>
                  <Text strong>Màu xe:</Text>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Tất cả"
                    allowClear
                    value={params.ma_mau}
                    onChange={(val) => setParams({ ...params, ma_mau: val })}
                  >
                    {mauList.map((m) => (
                      <Option key={m.ma_mau} value={m.ma_mau}>
                        {m.ten_mau}
                      </Option>
                    ))}
                  </Select>
                </Col>
              </>
            )}

            {activeTab === "ton-kho-pt" && (
              <Col xs={24} sm={8} md={4}>
                <div style={{ marginTop: 22 }}>
                  <Checkbox
                    checked={params.canh_bao}
                    onChange={(e) =>
                      setParams({ ...params, canh_bao: e.target.checked })
                    }
                  >
                    Hàng sắp hết
                  </Checkbox>
                </div>
              </Col>
            )}

            <Col xs={24} sm={8} md={4}>
              <Text strong>Ngày tính:</Text>
              <DatePicker
                style={{ width: "100%" }}
                value={params.ngay_tinh}
                onChange={(val) => setParams({ ...params, ngay_tinh: val })}
                format="DD/MM/YYYY"
              />
            </Col>

            <Col
              xs={24}
              sm={16}
              md={8}
              style={{ textAlign: "right", marginTop: 22 }}
            >
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={() => handleExport("excel")}
                  danger
                >
                  Excel
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={() => handleExport("pdf")}
                >
                  PDF
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Table
          size="small"
          loading={loading}
          dataSource={data}
          columns={
            activeTab === "ton-kho-xe"
              ? xeColumns
              : activeTab === "ton-kho-pt"
                ? ptColumns
                : summaryColumns
          }
          rowKey={(record) => {
            if (record.id) return record.id;
            if (record.xe_key) return record.xe_key;
            if (record.ma_pt && record.ten_kho)
              return `${record.ma_pt}_${record.ten_kho}`;
            if (record.ma_pt) return record.ma_pt;
            if (record.ma_kho) return record.ma_kho;
            return Math.random();
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default InventoryReportPage;
