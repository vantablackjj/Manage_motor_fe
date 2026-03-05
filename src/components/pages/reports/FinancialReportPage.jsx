// src/components/pages/reports/FinancialReportPage.jsx
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
  Statistic,
  Tag,
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  DollarCircleOutlined,
  RiseOutlined,
  FallOutlined,
} from "@ant-design/icons";
import { reportAPI, khoAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useAuth } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const FinancialReportPage = () => {
  const { isMobile } = useResponsive();
  const { user, activeWarehouse } = useAuth();
  const [activeTab, setActiveTab] = useState("cong-no-noi-bo");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [khoList, setKhoList] = useState([]);

  // Filter params
  const [params, setParams] = useState({
    ma_kho: user?.vai_tro === "ADMIN" ? activeWarehouse || null : user?.ma_kho,
    tu_ngay: dayjs().startOf("month"),
    den_ngay: dayjs(),
    loai: "XE", // For profit report: XE or PHU_TUNG
    loai_cong_no: null, // PHAI_THU or PHAI_TRA
    ma_kh: null,
    ma_ncc: null,
  });

  useEffect(() => {
    fetchKhoList();
  }, []);

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      ma_kho:
        user?.vai_tro === "ADMIN" ? activeWarehouse || null : user?.ma_kho,
    }));
  }, [activeWarehouse, user]);

  useEffect(() => {
    fetchData();
  }, [
    activeTab,
    params.ma_kho,
    params.tu_ngay,
    params.den_ngay,
    params.loai,
    params.loai_cong_no,
    params.ma_kh,
    params.ma_ncc,
  ]);

  const fetchKhoList = async () => {
    try {
      const khos = await khoAPI.getAll();
      setKhoList(khos || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      const baseParams = {
        tu_ngay: params.tu_ngay?.format("YYYY-MM-DD"),
        den_ngay: params.den_ngay?.format("YYYY-MM-DD"),
        ma_kho: params.ma_kho,
      };

      if (activeTab === "cong-no-noi-bo") {
        res = await reportAPI.debt.getInternal(baseParams);
        const rawData = res?.data !== undefined ? res.data : res;
        const list = Array.isArray(rawData)
          ? rawData
          : rawData
            ? [rawData]
            : [];
        setData(list);
        setSummary(null);
      } else if (activeTab === "cong-no-khach-hang") {
        res = await reportAPI.debt.getCustomer({
          ...baseParams,
          loai_cong_no: params.loai_cong_no,
          ma_kh: params.ma_kh,
          ma_ncc: params.ma_ncc,
        });

        // Handle new unified response format
        if (res?.data && res?.summary) {
          // New format with summary
          setData(res.data || []);
          setSummary(res.summary);
        } else {
          // Old format (array only)
          const rawData = res?.data !== undefined ? res.data : res;
          const list = Array.isArray(rawData)
            ? rawData
            : rawData
              ? [rawData]
              : [];
          setData(list);
          setSummary(null);
        }
      } else if (activeTab === "loi-nhuan") {
        res = await reportAPI.sales.getProfitLoss({
          ...baseParams,
          loai: params.loai, // XE hoặc PHU_TUNG - hợp lệ cho endpoint lợi nhuận
        });
        const list = Array.isArray(res.data) ? res.data : res || [];
        setData(list);
        setSummary(null);
      } else {
        // so-quy tab: fetch cả THU và CHI, KHÔNG truyền loai=XE
        const [thuRes, chiRes] = await Promise.all([
          reportAPI.finance.getByDay(baseParams), // Không truyền loai để lấy cả THU lẫn CHI
          reportAPI.finance.getSummary(baseParams),
        ]);
        const rawData = thuRes?.data !== undefined ? thuRes.data : thuRes;
        const list = Array.isArray(rawData)
          ? rawData
          : rawData
            ? [rawData]
            : [];
        setData(list);
        setSummary(chiRes?.data !== undefined ? chiRes.data : chiRes || null);
      }
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu báo cáo");
      setData([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const internalDebtColumns = [
    {
      title: "Đối tượng (Kho Nợ -> Kho Có)",
      key: "ten_doi_tuong",
      render: (_, record) => {
        const from = record.ten_kho_no || record.ma_kho_no || "?";
        const to = record.ten_kho_co || record.ma_kho_co || "?";
        return `${from} -> ${to}`;
      },
    },
    {
      title: "Mã đối tượng",
      dataIndex: "ma_kho_no",
      key: "ma_doi_tuong",
    },
    {
      title: "Nợ đầu kỳ",
      dataIndex: "no_dau",
      key: "no_dau",
      align: "right",
      render: (val) => formatService.formatCurrency(val || 0),
    },
    {
      title: "Phát sinh Tăng",
      dataIndex: "tong_no",
      key: "tang",
      align: "right",
      render: (val) => (
        <Text type="danger">+{formatService.formatCurrency(val)}</Text>
      ),
    },
    {
      title: "Phát sinh Giảm",
      dataIndex: "tong_da_tra",
      key: "giam",
      align: "right",
      render: (val) => (
        <Text type="success">-{formatService.formatCurrency(val)}</Text>
      ),
    },
    {
      title: "Nợ cuối kỳ",
      key: "no_cuoi",
      align: "right",
      render: (_, record) => {
        const noDau = Number(record.no_dau || 0);
        const tang = Number(record.tong_no || 0);
        const giam = Number(record.tong_da_tra || record.da_thanh_toan || 0);
        const cuoi = noDau + tang - giam;
        return <strong>{formatService.formatCurrency(cuoi)}</strong>;
      },
    },
  ];

  const customerDebtColumns = [
    {
      title: "Loại",
      dataIndex: "loai_cong_no",
      key: "loai_cong_no",
      width: 120,
      render: (loai) => {
        if (loai === "PHAI_THU") {
          return (
            <Tag color="green" icon={<RiseOutlined />}>
              Phải thu
            </Tag>
          );
        } else if (loai === "PHAI_TRA") {
          return (
            <Tag color="orange" icon={<FallOutlined />}>
              Phải trả
            </Tag>
          );
        }
        return loai;
      },
    },
    {
      title: "Đối tác",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (text, record) => (
        <div>
          <b>{text}</b>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.loai_doi_tac === "KHACH_HANG"
              ? "Khách hàng"
              : record.loai_doi_tac === "NHA_CUNG_CAP"
                ? "Nhà cung cấp"
                : "Cả hai"}
          </Text>
        </div>
      ),
    },
    {
      title: "Mã đối tác",
      dataIndex: "ma_doi_tac",
      key: "ma_doi_tac",
      width: 120,
    },
    {
      title: "Tổng nợ",
      dataIndex: "tong_no",
      key: "tong_no",
      align: "right",
      width: 150,
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Đã trả",
      dataIndex: "da_tra",
      key: "da_tra",
      align: "right",
      width: 150,
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Còn lại",
      dataIndex: "con_lai",
      key: "con_lai",
      align: "right",
      width: 150,
      render: (val, record) => (
        <strong
          style={{
            color: record.loai_cong_no === "PHAI_THU" ? "#52c41a" : "#ff4d4f",
          }}
        >
          {formatService.formatCurrency(val)}
        </strong>
      ),
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "ngay_cap_nhat",
      key: "ngay_cap_nhat",
      width: 120,
      render: (date) => formatService.formatDate(date),
    },
  ];

  const cashFlowColumns = [
    {
      title: "Ngày",
      dataIndex: "ngay_giao_dich",
      key: "ngay_giao_dich",
      render: (date) => formatService.formatDate(date),
    },
    { title: "Số phiếu", dataIndex: "so_phieu", key: "so_phieu" },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai",
      render: (val) => (
        <Tag color={val === "THU" ? "green" : "red"}>
          {val === "THU" ? "Thu" : "Chi"}
        </Tag>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "dien_giai",
      key: "dien_giai",
      render: (val, record) => val || record.noi_dung || "-",
    },
    { title: "Kho", dataIndex: "ten_kho", key: "ten_kho" },
    {
      title: "Số tiền",
      dataIndex: "so_tien",
      key: "so_tien",
      align: "right",
      render: (val, record) => (
        <Text type={record.loai === "THU" ? "success" : "danger"}>
          {record.loai === "THU" ? "+" : "-"}
          {formatService.formatCurrency(val)}
        </Text>
      ),
    },
  ];

  const profitColumns =
    params.loai === "XE"
      ? [
          {
            title: "Ngày bán",
            dataIndex: "ngay_ban",
            key: "ngay_ban",
            render: (date) => formatService.formatDate(date),
          },
          { title: "Tên xe", dataIndex: "ten_xe", key: "ten_xe" },
          { title: "Số khung", dataIndex: "so_khung", key: "so_khung" },
          { title: "Số HD", dataIndex: "so_hoa_don", key: "so_hoa_don" },
          {
            title: "Giá bán",
            dataIndex: "gia_ban",
            key: "gia_ban",
            align: "right",
            render: (v) => formatService.formatCurrency(v),
          },
          {
            title: "Giá vốn",
            dataIndex: "gia_von",
            key: "gia_von",
            align: "right",
            render: (v) => formatService.formatCurrency(v),
          },
          {
            title: "Lợi nhuận",
            dataIndex: "loi_nhuan",
            key: "loi_nhuan",
            align: "right",
            render: (v) => (
              <Text strong type={v >= 0 ? "success" : "danger"}>
                {formatService.formatCurrency(v)}
              </Text>
            ),
          },
          {
            title: "% LN",
            dataIndex: "ti_le_ln",
            key: "ti_le_ln",
            align: "right",
            render: (v) => `${Number(v).toFixed(1)}%`,
          },
        ]
      : [
          { title: "Tên phụ tùng", dataIndex: "ten_pt", key: "ten_pt" },
          { title: "Mã PT", dataIndex: "ma_pt", key: "ma_pt" },
          { title: "Số lượng", dataIndex: "so_luong", key: "so_luong" },
          {
            title: "Doanh thu",
            dataIndex: "doanh_thu",
            key: "doanh_thu",
            align: "right",
            render: (v) => formatService.formatCurrency(v),
          },
          {
            title: "Tổng giá vốn",
            dataIndex: "tong_gia_von",
            key: "tong_gia_von",
            align: "right",
            render: (v) => formatService.formatCurrency(v),
          },
          {
            title: "Lợi nhuận",
            dataIndex: "loi_nhuan",
            key: "loi_nhuan",
            align: "right",
            render: (v) => (
              <Text strong type={v >= 0 ? "success" : "danger"}>
                {formatService.formatCurrency(v)}
              </Text>
            ),
          },
        ];

  const handleExport = async (type) => {
    try {
      let reportCode = activeTab.toUpperCase().replace(/-/g, "_");
      if (activeTab === "cong-no-khach-hang") reportCode = "CONG_NO_KH";
      if (activeTab === "so-quy") reportCode = "THU_CHI";
      if (activeTab === "loi-nhuan") reportCode = "PROFIT_LOSS";

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
    <div className="manage-page-container">
      <Card
        title={
          <Space>
            <DollarCircleOutlined /> Báo cáo tài chính & Công nợ
          </Space>
        }
        size="small"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "cong-no-noi-bo", label: "Công nợ Nội bộ" },
            { key: "cong-no-khach-hang", label: "Công nợ Khách hàng" },
            { key: "loi-nhuan", label: "Lợi nhuận (P&L)" },
            { key: "so-quy", label: "Sổ quỹ Thu chi" },
          ]}
        />

        {/* Summary Cards - Only show for customer debt report with summary */}
        {activeTab === "cong-no-khach-hang" && summary && (
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Tổng phải thu"
                  value={summary.tong_phai_thu || 0}
                  precision={0}
                  styles={{ content: { color: "#52c41a" } }}
                  prefix={<RiseOutlined />}
                  suffix="₫"
                  formatter={(value) => formatService.formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Tổng phải trả"
                  value={summary.tong_phai_tra || 0}
                  precision={0}
                  styles={{ content: { color: "#ff4d4f" } }}
                  prefix={<FallOutlined />}
                  suffix="₫"
                  formatter={(value) => formatService.formatCurrency(value)}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Số khách hàng còn nợ"
                  value={summary.so_khach_hang_no || 0}
                  styles={{ content: { color: "#1890ff" } }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Số nhà cung cấp còn nợ"
                  value={summary.so_nha_cung_cap_no || 0}
                  styles={{ content: { color: "#faad14" } }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "var(--bg-secondary, #fafafa)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
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

            {activeTab === "cong-no-khach-hang" && (
              <Col xs={24} sm={8} md={5}>
                <Text strong>Loại công nợ:</Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả"
                  allowClear
                  value={params.loai_cong_no}
                  onChange={(val) =>
                    setParams({ ...params, loai_cong_no: val })
                  }
                >
                  <Option value="PHAI_THU">Phải thu (Khách hàng)</Option>
                  <Option value="PHAI_TRA">Phải trả (Nhà cung cấp)</Option>
                </Select>
              </Col>
            )}

            {activeTab === "loi-nhuan" && (
              <Col xs={24} sm={8} md={5}>
                <Text strong>Loại hàng:</Text>
                <Select
                  style={{ width: "100%" }}
                  value={params.loai}
                  onChange={(val) => setParams({ ...params, loai: val })}
                >
                  <Option value="XE">Xe máy</Option>
                  <Option value="PHU_TUNG">Phụ tùng</Option>
                </Select>
              </Col>
            )}

            <Col
              xs={24}
              sm={8}
              flex="auto"
              style={{
                textAlign: isMobile ? "left" : "right",
                marginTop: isMobile ? 8 : 22,
              }}
            >
              <Space wrap>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchData}
                  size={isMobile ? "small" : "middle"}
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  danger
                  onClick={() => handleExport("excel")}
                  size={isMobile ? "small" : "middle"}
                >
                  Excel
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={() => handleExport("pdf")}
                  size={isMobile ? "small" : "middle"}
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
            activeTab === "so-quy"
              ? cashFlowColumns
              : activeTab === "cong-no-khach-hang"
                ? customerDebtColumns
                : activeTab === "loi-nhuan"
                  ? profitColumns
                  : internalDebtColumns
          }
          rowKey={(record) =>
            record.id || record.ma_doi_tuong || record.so_phieu || Math.random()
          }
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
        />
      </Card>
      <style>{`
        .manage-page-container {
          padding: 16px;
          background: var(--bg-layout, #f0f2f5);
          min-height: 100vh;
        }
        @media (max-width: 640px) {
          .manage-page-container {
            padding: 8px 4px;
          }
          .ant-card-body {
            padding: 12px !important;
          }
        }
      `}</style>
      <style>{`
        .manage-page-container {
          padding: 16px;
          background: var(--bg-layout, #f0f2f5);
          min-height: 100vh;
        }
        @media (max-width: 640px) {
          .manage-page-container {
            padding: 8px 4px;
          }
          .ant-card-body {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FinancialReportPage;
