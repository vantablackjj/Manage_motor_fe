// src/components/pages/reports/SalesReportPage.jsx
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
} from "antd";
import {
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { reportAPI, khoAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { useAuth } from "../../../contexts/AuthContext";
import dayjs from "dayjs";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const SalesReportPage = () => {
  const { isMobile } = useResponsive();
  const { user, activeWarehouse } = useAuth();
  const [activeTab, setActiveTab] = useState("doanh-thu-theo-thang");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);

  // Filter params
  const [params, setParams] = useState({
    ma_kho: user?.vai_tro === "ADMIN" ? activeWarehouse || null : user?.ma_kho,
    nam: dayjs().year(),
    tu_ngay: dayjs().startOf("month"),
    den_ngay: dayjs(),
    loai: null, // For product & detailed report
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
    params.nam,
    params.tu_ngay,
    params.den_ngay,
    params.loai,
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

      if (activeTab === "doanh-thu-theo-thang") {
        res = await reportAPI.sales.getByMonth(apiParams);
      } else if (activeTab === "doanh-thu-theo-san-pham") {
        res = await reportAPI.sales.getByProduct(apiParams);
      } else if (activeTab === "doanh-thu-chi-tiet") {
        res = await reportAPI.sales.getDetailed(apiParams);
      } else {
        res = await reportAPI.sales.getSummary(apiParams);
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
      if (activeTab === "doanh-thu-theo-thang") reportCode = "DOAN_THU_THANG";

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

  const monthColumns = [
    {
      title: "Tháng",
      dataIndex: "thang",
      key: "thang",
      render: (val) => `Tháng ${val}`,
    },
    {
      title: "Số hóa đơn",
      dataIndex: "so_luong_hd",
      key: "so_luong_hd",
      align: "center",
      render: (val) => formatService.formatNumber(val),
    },
    {
      title: "Doanh thu",
      dataIndex: "doanh_thu",
      key: "doanh_thu",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Thực thu",
      dataIndex: "thuc_thu",
      key: "thuc_thu",
      align: "right",
      render: (val) => (
        <Text type="success">{formatService.formatCurrency(val)}</Text>
      ),
    },
  ];

  const productColumns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      render: (_, __, i) => i + 1,
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "san_pham",
      key: "san_pham",
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      key: "so_luong",
      align: "right",
      render: (val) => formatService.formatNumber(val),
    },
    {
      title: "Doanh thu",
      dataIndex: "doanh_thu",
      key: "doanh_thu",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
  ];

  const summaryColumns = [
    {
      title: "Kho/Hệ thống",
      dataIndex: "ten_kho",
      key: "ten_kho",
      render: (val) => val || "Toàn hệ thống",
    },
    {
      title: "Tổng Doanh thu",
      dataIndex: "tong_doanh_thu",
      key: "tong_doanh_thu",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Thực thu",
      dataIndex: "tong_thuc_thu",
      key: "tong_thuc_thu",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Số hóa đơn",
      dataIndex: "tong_hoa_don",
      key: "tong_hoa_don",
      align: "right",
      render: (val) => formatService.formatNumber(val),
    },
  ];

  const detailedColumns = [
    {
      title: "Ngày",
      dataIndex: "ngay",
      key: "ngay",
      width: 120,
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Số phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      width: 140,
    },
    {
      title: "Loại",
      dataIndex: "loai_doanh_thu",
      key: "loai_doanh_thu",
      width: 100,
      render: (val) => {
        let color = "blue";
        let text = val;
        if (val === "XE") {
          color = "green";
          text = "Bán Xe";
        } else if (val === "PHU_TUNG") {
          color = "orange";
          text = "Phụ Tùng";
        } else if (val === "DICH_VU") {
          color = "purple";
          text = "Dịch Vụ";
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Khách hàng",
      dataIndex: "khach_hang",
      key: "khach_hang",
      ellipsis: true,
    },
    {
      title: "Nội dung",
      dataIndex: "noi_dung",
      key: "noi_dung",
      ellipsis: true,
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
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      key: "thanh_tien",
      align: "right",
      render: (val) => (
        <Text strong type="danger">
          {formatService.formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: "Kho",
      dataIndex: "kho",
      key: "kho",
      width: 120,
    },
  ];

  return (
    <div className="manage-page-container">
      <Card
        title={
          <Space>
            <LineChartOutlined /> Báo cáo doanh thu & kinh doanh
          </Space>
        }
        size="small"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: "doanh-thu-theo-thang", label: "Doanh thu theo tháng" },
            {
              key: "doanh-thu-theo-san-pham",
              label: "Doanh thu theo sản phẩm",
            },
            { key: "doanh-thu-chi-tiet", label: "Doanh thu chi tiết" },
            { key: "doanh-thu-tong-hop", label: "Tổng hợp toàn hệ thống" },
          ]}
        />

        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "var(--bg-secondary, #fafafa)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <Text strong>Chọn kho:</Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Tất cả kho"
                allowClear
                disabled={user?.vai_tro !== "ADMIN"}
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

            {activeTab === "doanh-thu-theo-thang" && (
              <Col xs={24} sm={8} md={4}>
                <Text strong>Năm:</Text>
                <DatePicker
                  picker="year"
                  style={{ width: "100%" }}
                  value={dayjs().year(params.nam)}
                  onChange={(val) =>
                    setParams({
                      ...params,
                      nam: val ? val.year() : dayjs().year(),
                    })
                  }
                />
              </Col>
            )}

            {(activeTab === "doanh-thu-theo-san-pham" ||
              activeTab === "doanh-thu-chi-tiet") && (
              <>
                <Col xs={12} sm={8} md={4}>
                  <Text strong>Loại:</Text>
                  <Select
                    style={{ width: "100%" }}
                    value={params.loai}
                    onChange={(val) => setParams({ ...params, loai: val })}
                    allowClear
                    placeholder="Tất cả"
                  >
                    {activeTab === "doanh-thu-chi-tiet" ? (
                      <>
                        <Option value="XE">Bán Xe</Option>
                        <Option value="PHU_TUNG">Phụ Tùng</Option>
                        <Option value="DICH_VU">Dịch Vụ (Bảo trì)</Option>
                      </>
                    ) : (
                      <>
                        <Option value="XE">Xe</Option>
                        <Option value="PHU_TUNG">Phụ tùng</Option>
                      </>
                    )}
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
              </>
            )}

            {activeTab === "doanh-thu-tong-hop" && (
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
                  onClick={() => handleExport("excel")}
                  danger
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
            activeTab === "doanh-thu-theo-thang"
              ? monthColumns
              : activeTab === "doanh-thu-theo-san-pham"
                ? productColumns
                : activeTab === "doanh-thu-chi-tiet"
                  ? detailedColumns
                  : summaryColumns
          }
          rowKey={(record) =>
            record.so_phieu ||
            record.san_pham ||
            record.ma_sp ||
            record.thang ||
            record.ma_kho ||
            Math.random()
          }
          pagination={{ pageSize: 12 }}
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
    </div>
  );
};

export default SalesReportPage;
