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
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { reportAPI, khoAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const FinancialReportPage = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("cong-no-noi-bo");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);

  // Filter params
  const [params, setParams] = useState({
    ma_kho: null,
    tu_ngay: dayjs().startOf("month"),
    den_ngay: dayjs(),
    loai_doi_tac: null,
  });

  useEffect(() => {
    fetchKhoList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [
    activeTab,
    params.ma_kho,
    params.tu_ngay,
    params.den_ngay,
    params.loai_doi_tac,
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
      const apiParams = {
        ...params,
        tu_ngay: params.tu_ngay?.format("YYYY-MM-DD"),
        den_ngay: params.den_ngay?.format("YYYY-MM-DD"),
      };

      if (activeTab === "cong-no-noi-bo") {
        res = await reportAPI.debt.getInternal(apiParams);
      } else if (activeTab === "cong-no-khach-hang") {
        res = await reportAPI.debt.getCustomer(apiParams);
      } else {
        res = await reportAPI.finance.getByDay({ ...apiParams, loai: "THU" }); // Default loai
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
      title: "Khách hàng",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Mã KH",
      dataIndex: "ma_ncc",
      key: "ma_ncc",
    },
    {
      title: "Tổng phải trả",
      dataIndex: "tong_phai_tra",
      key: "tong_phai_tra",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Đã trả",
      dataIndex: "da_tra",
      key: "da_tra",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Còn lại",
      dataIndex: "con_lai",
      key: "con_lai",
      align: "right",
      render: (val) => (
        <strong style={{ color: "red" }}>
          {formatService.formatCurrency(val)}
        </strong>
      ),
    },
  ];

  const cashFlowColumns = [
    {
      title: "Ngày",
      dataIndex: "ngay",
      key: "ngay",
      render: (date) => formatService.formatDate(date),
    },
    { title: "Số phiếu", dataIndex: "so_phieu", key: "so_phieu" },
    { title: "Loại", dataIndex: "loai_phieu", key: "loai_phieu" },
    { title: "Lý do", dataIndex: "ly_do", key: "ly_do" },
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
    {
      title: "Người thực hiện",
      dataIndex: "nguoi_thuc_hien",
      key: "nguoi_thuc_hien",
    },
  ];

  const handleExport = async (type) => {
    try {
      let reportCode = activeTab.toUpperCase().replace(/-/g, "_");
      if (activeTab === "cong-no-khach-hang") reportCode = "CONG_NO_KH";
      if (activeTab === "so-quy") reportCode = "THU_CHI";

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
            { key: "so-quy", label: "Sổ quỹ Thu chi" },
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
              <Col xs={24} sm={8} md={4}>
                <Text strong>Đối tượng:</Text>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Tất cả đối tượng"
                  allowClear
                  value={params.loai_doi_tac}
                  onChange={(val) =>
                    setParams({ ...params, loai_doi_tac: val })
                  }
                >
                  <Option value="KHACH_HANG">Khách hàng</Option>
                  <Option value="NHA_CUNG_CAP">Nhà cung cấp</Option>
                  <Option value="NHAN_VIEN">Nhân viên</Option>
                </Select>
              </Col>
            )}

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
            activeTab === "so-quy"
              ? cashFlowColumns
              : activeTab === "cong-no-khach-hang"
                ? customerDebtColumns
                : internalDebtColumns
          }
          rowKey={(record) =>
            record.id || record.ma_doi_tuong || record.so_phieu || Math.random()
          }
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default FinancialReportPage;
