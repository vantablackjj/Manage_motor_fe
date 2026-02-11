// src/components/pages/reports/LogisticsReportPage.jsx
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
  Typography,
  Tag,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  SwapOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { reportAPI, khoAPI, phuTungAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const LogisticsReportPage = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("nhap-xuat-xe");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [ptList, setPtList] = useState([]);

  // Filter params
  const [params, setParams] = useState({
    ma_kho: null,
    ma_pt: null,
    tu_ngay: dayjs().startOf("month"),
    den_ngay: dayjs(),
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, params.ma_kho, params.ma_pt, params.tu_ngay, params.den_ngay]);

  const fetchInitialData = async () => {
    try {
      const [khos, pts] = await Promise.all([
        khoAPI.getAll(),
        phuTungAPI.getAll({ limit: 1000, status: "all" }),
      ]);
      setKhoList(khos || []);
      setPtList(pts?.data || []);
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
        tu_ngay: params.tu_ngay?.format("YYYY-MM-DD"),
        den_ngay: params.den_ngay?.format("YYYY-MM-DD"),
      };

      if (activeTab === "nhap-xuat-xe") {
        res = await reportAPI.logistics.getVehicleInOutput(apiParams);
      } else if (activeTab === "nhap-xuat-pt") {
        res = await reportAPI.logistics.getPartInOutput(apiParams);
      } else {
        if (!params.ma_pt) {
          setData([]);
          setLoading(false);
          return;
        }
        res = await reportAPI.logistics.getPartCard(apiParams);
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

  const xeColumns = [
    {
      title: "Ngày",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      width: 110,
      render: (date) => formatService.formatDate(date),
    },
    {
      title: "Số phiếu",
      dataIndex: "so_chung_tu",
      key: "so_chung_tu",
      width: 140,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 130,
      render: (val) => {
        let color = "default";
        if (val === "NHAP_KHO") color = "success";
        if (val === "XUAT_KHO") color = "error";
        if (val === "CHUYEN_KHO") color = "processing";
        return <Tag color={color}>{formatService.formatLoaiGiaoDich(val)}</Tag>;
      },
    },
    {
      title: "Xe (Model - Serial)",
      key: "xe_info",
      width: 200,
      render: (_, record) => (
        <div>
          <div>
            <b>{record.ma_hang_hoa}</b>
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.ma_serial}</div>
        </div>
      ),
    },
    {
      title: "Tên xe",
      dataIndex: "ten_loai",
      key: "ten_loai",
      ellipsis: true,
    },
    {
      title: "Đối tác / Kho xuất",
      dataIndex: "kho_xuat",
      key: "kho_xuat",
      width: 180,
      render: (val, record) => {
        const text = val || record.ma_kho_xuat;
        if (!text) return "-";
        const isPartner = record.loai_giao_dich === "NHAP_KHO";
        return (
          <Space>
            {isPartner ? (
              <UserOutlined style={{ color: "#fa8c16" }} />
            ) : (
              <HomeOutlined style={{ color: "#1890ff" }} />
            )}
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: "Đối tác / Kho nhập",
      dataIndex: "kho_nhap",
      key: "kho_nhap",
      width: 180,
      render: (val, record) => {
        const text = val || record.ma_kho_nhap;
        if (!text) return "-";
        const isPartner = record.loai_giao_dich === "XUAT_KHO";
        return (
          <Space>
            {isPartner ? (
              <UserOutlined style={{ color: "#fa8c16" }} />
            ) : (
              <HomeOutlined style={{ color: "#1890ff" }} />
            )}
            <span>{text}</span>
          </Space>
        );
      },
    },

    {
      title: "SL",
      dataIndex: "so_luong",
      key: "so_luong",
      align: "center",
      width: 60,
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      key: "don_gia",
      align: "right",
      width: 120,
      render: (val) => formatService.formatCurrency(val),
    },
  ];

  const ptColumns = [
    {
      title: "Ngày",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      width: 110,
      render: (date) => formatService.formatDate(date),
    },
    {
      title: "Số phiếu",
      dataIndex: "so_chung_tu",
      key: "so_chung_tu",
      width: 140,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 130,
      render: (val) => {
        let color = "default";
        if (val === "NHAP_KHO") color = "success";
        if (val === "XUAT_KHO") color = "error";
        if (val === "CHUYEN_KHO") color = "processing";
        return <Tag color={color}>{formatService.formatLoaiGiaoDich(val)}</Tag>;
      },
    },
    {
      title: "Phụ tùng",
      key: "pt_info",
      width: 200,
      render: (_, record) => (
        <div>
          <div>
            <b>{record.ma_hang_hoa}</b>
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>{record.ten_pt}</div>
        </div>
      ),
    },
    {
      title: "Đối tác / Kho xuất",
      dataIndex: "kho_xuat",
      key: "kho_xuat",
      width: 180,
      render: (val, record) => {
        const text = val || record.ma_kho_xuat;
        if (!text) return "-";
        const isPartner = record.loai_giao_dich === "NHAP_KHO";
        return (
          <Space>
            {isPartner ? (
              <UserOutlined style={{ color: "#fa8c16" }} />
            ) : (
              <HomeOutlined style={{ color: "#1890ff" }} />
            )}
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: "Đối tác / Kho nhập",
      dataIndex: "kho_nhap",
      key: "kho_nhap",
      width: 180,
      render: (val, record) => {
        const text = val || record.ma_kho_nhap;
        if (!text) return "-";
        const isPartner = record.loai_giao_dich === "XUAT_KHO";
        return (
          <Space>
            {isPartner ? (
              <UserOutlined style={{ color: "#fa8c16" }} />
            ) : (
              <HomeOutlined style={{ color: "#1890ff" }} />
            )}
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: "ĐVT",
      dataIndex: "don_vi_tinh",
      key: "don_vi_tinh",
      width: 80,
      align: "center",
    },
    {
      title: "SL",
      dataIndex: "so_luong",
      key: "so_luong",
      align: "center",
      width: 80,
      render: (val) => <b>{val}</b>,
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      key: "don_gia",
      align: "right",
      width: 120,
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      key: "thanh_tien",
      align: "right",
      width: 130,
      render: (val) => formatService.formatCurrency(val),
    },
  ];

  const cardColumns = [
    {
      title: "Ngày",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      width: 110,
      render: (date) => formatService.formatDate(date),
    },
    {
      title: "Số chứng từ",
      dataIndex: "so_chung_tu",
      key: "so_chung_tu",
      width: 150,
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Loại giao dịch",
      dataIndex: "loai_giao_dich",
      key: "loai_giao_dich",
      width: 130,
      render: (val) => {
        let color = "default";
        if (val === "NHAP_KHO") color = "success";
        if (val === "XUAT_KHO") color = "error";
        if (val === "CHUYEN_KHO") color = "processing";
        return <Tag color={color}>{formatService.formatLoaiGiaoDich(val)}</Tag>;
      },
    },
    {
      title: "Diễn giải",
      dataIndex: "dien_giai",
      key: "dien_giai",
      ellipsis: true,
      render: (val) => val || <Text type="secondary">N/A</Text>,
    },
    {
      title: "Đối tác / Kho xuất",
      dataIndex: "kho_xuat",
      key: "kho_xuat",
      width: 150,
      render: (val, record) => {
        const text = val || record.ma_kho_xuat;
        if (!text) return "-";
        const isPartner = record.loai_giao_dich === "NHAP_KHO";
        return (
          <Space>
            {isPartner ? (
              <UserOutlined style={{ color: "#fa8c16" }} />
            ) : (
              <HomeOutlined style={{ color: "#1890ff" }} />
            )}
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: "Đối tác / Kho nhập",
      dataIndex: "kho_nhap",
      key: "kho_nhap",
      width: 150,
      render: (val, record) => {
        const text = val || record.ma_kho_nhap;
        if (!text) return "-";
        const isPartner = record.loai_giao_dich === "XUAT_KHO";
        return (
          <Space>
            {isPartner ? (
              <UserOutlined style={{ color: "#fa8c16" }} />
            ) : (
              <HomeOutlined style={{ color: "#1890ff" }} />
            )}
            <span>{text}</span>
          </Space>
        );
      },
    },
    {
      title: "Nhập",
      key: "nhap",
      align: "right",
      width: 90,
      render: (_, record) =>
        record.so_luong > 0 ? (
          <Text type="success">+{record.so_luong}</Text>
        ) : (
          ""
        ),
    },
    {
      title: "Xuất",
      key: "xuat",
      align: "right",
      width: 90,
      render: (_, record) =>
        record.so_luong < 0 ? <Text type="danger">{record.so_luong}</Text> : "",
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      key: "don_gia",
      align: "right",
      width: 110,
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      key: "thanh_tien",
      align: "right",
      width: 130,
      render: (val) => (
        <strong style={{ color: Number(val) < 0 ? "red" : "inherit" }}>
          {formatService.formatCurrency(val)}
        </strong>
      ),
    },
  ];

  const handleExport = async (type) => {
    try {
      let reportCode = activeTab.toUpperCase().replace(/-/g, "_");
      // Map keys to specific codes if needed
      if (activeTab === "nhap-xuat-xe") reportCode = "NHAP_XUAT_XE";
      if (activeTab === "nhap-xuat-pt") reportCode = "NHAP_XUAT_PT";
      if (activeTab === "the-kho") reportCode = "THE_KHO";

      const exportParams = {
        loai_bao_cao: reportCode,
        params: {
          ...params,
          tu_ngay: params.tu_ngay?.format("YYYY-MM-DD"),
          den_ngay: params.den_ngay?.format("YYYY-MM-DD"),
        },
      };

      const response =
        type === "excel"
          ? await reportAPI.export.excel(exportParams)
          : await reportAPI.export.pdf(exportParams);

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

  return (
    <div style={{ padding: 16 }}>
      <Card
        title={
          <Space>
            <SwapOutlined /> Báo cáo Nhập xuất & Thẻ kho
          </Space>
        }
        size="small"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "nhap-xuat-xe", label: "Nhập xuất Xe" },
            { key: "nhap-xuat-pt", label: "Nhập xuất Phụ tùng" },
            { key: "the-kho", label: "Thẻ kho Phụ tùng" },
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

            {activeTab === "the-kho" && (
              <Col xs={24} sm={12} md={6}>
                <Text strong>Chọn phụ tùng:</Text>
                <Select
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="Chọn phụ tùng"
                  optionFilterProp="children"
                  value={params.ma_pt}
                  onChange={(val) => setParams({ ...params, ma_pt: val })}
                >
                  {ptList.map((pt) => (
                    <Option key={pt.ma_pt} value={pt.ma_pt}>
                      {pt.ma_pt} - {pt.ten_pt}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}

            <Col xs={24} sm={12} md={6}>
              <Text strong>Thời gian:</Text>
              <RangePicker
                style={{ width: "100%" }}
                value={[params.tu_ngay, params.den_ngay]}
                onChange={(dates) =>
                  dates &&
                  setParams({
                    ...params,
                    tu_ngay: dates[0],
                    den_ngay: dates[1],
                  })
                }
                format="DD/MM/YYYY"
              />
            </Col>

            <Col
              xs={24}
              sm={8}
              flex="auto"
              style={{ textAlign: "right", marginTop: 22 }}
            >
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  danger
                  onClick={() => handleExport("excel")}
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
            activeTab === "nhap-xuat-xe"
              ? xeColumns
              : activeTab === "the-kho"
                ? cardColumns
                : ptColumns
          }
          rowKey={(record) =>
            record.id || record.so_phieu || record.ma_serial || Math.random()
          }
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText:
              activeTab === "the-kho" && !params.ma_pt
                ? "Vui lòng chọn phụ tùng để xem thẻ kho"
                : "Không có dữ liệu",
          }}
        />
      </Card>
    </div>
  );
};

export default LogisticsReportPage;
