import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Tag,
  Space,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Segmented,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  ImportOutlined,
  ShoppingCartOutlined,
  ScanOutlined,
  DownloadOutlined,
  TableOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import MotorcycleIcon from "../../common/MotorcycleIcon";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import QRScannerModal from "../../features/Scanner/QRScannerModal";
import OrderKanban from "../../features/OrderKanban/OrderKanban";
import { useNavigate } from "react-router-dom";
import {
  donHangMuaXeAPI,
  donHangAPI,
  khoAPI,
  khachHangAPI,
} from "../../../api";
import {
  notificationService,
  formatService,
  authService,
} from "../../../services";
import {
  TRANG_THAI,
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
  LOAI_HANG,
} from "../../../utils/constant";
import OrderReceiveModal from "./OrderReceiveModal";
import PartReceiveModal from "./parts/PartReceiveModal";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [viewMode, setViewMode] = useState("table");

  // Modal State
  const [receiveModalVisible, setReceiveModalVisible] = useState(false);
  const [partReceiveModalVisible, setPartReceiveModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  const [filters, setFilters] = useState({
    ma_kho: null,
    trang_thai: null,
    tu_ngay: null,
    den_ngay: null,
    loai_hang: null,
  });

  useEffect(() => {
    fetchMasterData();
    fetchData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [khoRes, nccRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll(),
      ]);
      setKhoList(khoRes || []);
      setSupplierList(nccRes?.data || nccRes || []);
    } catch (error) {
      console.error("Lỗi tải master data", error);
    }
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...currentFilters };
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      let combinedData = [];

      // Fetch Vehicles
      if (!params.loai_hang || params.loai_hang === LOAI_HANG.XE) {
        try {
          const xeRes = await donHangMuaXeAPI.getAll(params);
          const xeList = (xeRes.data?.data || xeRes.data || []).map((item) => ({
            ...item,
            id: item.id || item.so_phieu,
            loai_hang_label: LOAI_HANG.XE,
            ten_ncc: item.ten_ncc || getSupplierName(item.ma_ncc),
            ten_kho: item.ten_kho || getKhoName(item.ma_kho_nhap),
          }));
          combinedData = [...combinedData, ...xeList];
        } catch (e) {
          console.error("Lỗi tải danh sách nhập xe", e);
        }
      }

      // Fetch Parts
      if (!params.loai_hang || params.loai_hang === LOAI_HANG.PHU_TUNG) {
        try {
          const ptRes = await donHangAPI.getAll(params);
          const ptList = (ptRes.data?.data || ptRes.data || []).map((item) => ({
            ...item,
            id: item.id || item.so_phieu,
            loai_hang_label: LOAI_HANG.PHU_TUNG,
            ten_ncc:
              item.ten_ncc || item.ma_ben_xuat || getSupplierName(item.ma_ncc),
            ten_kho:
              item.ten_kho || item.ma_ben_nhap || getKhoName(item.ma_kho_nhap),
            so_phieu: item.so_phieu || item.so_don_hang,
          }));
          combinedData = [...combinedData, ...ptList];
        } catch (e) {
          console.error("Lỗi tải danh sách nhập phụ tùng", e);
        }
      }

      // Sort by date descending
      combinedData.sort(
        (a, b) =>
          new Date(b.ngay_dat_hang || b.created_at) -
          new Date(a.ngay_dat_hang || a.created_at),
      );
      setData(combinedData);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách nhập hàng");
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (id) => {
    if (!id) return "-";
    const sup = supplierList.find(
      (s) => s.id === id || s.ma_kh === id || s.ma_doi_tac === id,
    );
    return sup ? sup.ho_ten || sup.ten_doi_tac : id;
  };

  const getKhoName = (id) => {
    if (!id) return "-";
    const kho = khoList.find((k) => k.ma_kho === id);
    return kho ? kho.ten_kho : id;
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchData(newFilters);
  };

  const handleOpenReceiveModal = (record) => {
    setSelectedOrderId(record.id || record.so_phieu);
    if (record.loai_hang_label === LOAI_HANG.XE) {
      setReceiveModalVisible(true);
    } else {
      setPartReceiveModalVisible(true);
    }
  };

  const handleScanSuccess = (decodedText) => {
    setScannerVisible(false);
    if (decodedText) {
      const matched = data.find(
        (item) => item.so_phieu === decodedText || item.id === decodedText,
      );
      if (matched) {
        navigate(
          matched.loai_hang_label === LOAI_HANG.XE
            ? `/purchase/vehicles/${matched.so_phieu}`
            : `/purchase/parts/${matched.id}`,
        );
      } else {
        navigate(`/purchase/vehicles/${decodedText}`);
      }
    }
  };

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại",
      dataIndex: "loai_hang_label",
      key: "loai_hang_label",
      render: (val) => (
        <Tag
          color={val === LOAI_HANG.XE ? "blue" : "orange"}
          icon={
            val === LOAI_HANG.XE ? <MotorcycleIcon /> : <ShoppingCartOutlined />
          }
        >
          {val === LOAI_HANG.XE ? "Xe" : "Phụ tùng"}
        </Tag>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat_hang",
      key: "ngay_dat_hang",
      render: (text) => formatService.formatDate(text),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "ten_ncc",
      key: "ten_ncc",
      render: (text) => text || "-",
    },
    {
      title: "Kho nhập",
      dataIndex: "ten_kho",
      key: "ten_kho",
      render: (text) => text || "-",
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      align: "right",
      render: (val, record) =>
        formatService.formatCurrency(val || record.thanh_tien || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>
          {TRANG_THAI_LABELS[status] || status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              const path =
                record.loai_hang_label === LOAI_HANG.XE
                  ? `/purchase/vehicles/${record.so_phieu}`
                  : `/purchase/parts/${record.id}`;
              navigate(path);
            }}
          >
            Chi tiết
          </Button>
          {(record.trang_thai === "DA_DUYET" ||
            record.trang_thai === "DANG_NHAP_KHO") && (
            <Button
              icon={<DownloadOutlined />}
              size="small"
              type="primary"
              onClick={() => handleOpenReceiveModal(record)}
            >
              Nhập kho
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: "16px 8px",
        background: "var(--bg-layout, #f0f2f5)",
        minHeight: "100vh",
      }}
    >
      <Card size="small">
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[8, 16]}>
            <Col xs={24} md={8}>
              <Space align="center" size="large">
                <h2 style={{ margin: 0 }}>
                  <ImportOutlined style={{ marginRight: 8 }} />
                  Nhập hàng
                </h2>
                <Segmented
                  options={[
                    { label: "Bảng", value: "table", icon: <TableOutlined /> },
                    {
                      label: "Kanban",
                      value: "kanban",
                      icon: <ProjectOutlined />,
                    },
                  ]}
                  value={viewMode}
                  onChange={setViewMode}
                />
              </Space>
            </Col>
            <Col xs={24} md={16} style={{ textAlign: "right" }}>
              <Space wrap>
                <Button
                  icon={<ScanOutlined />}
                  onClick={() => setScannerVisible(true)}
                >
                  Quét mã
                </Button>

                <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                  Làm mới
                </Button>

                <ImportButton
                  module="nhap-kho"
                  title="Nhập Phụ tùng"
                  onSuccess={fetchData}
                />

                <ExportButton
                  module="nhap-kho"
                  title="Xuất Excel Phụ tùng"
                  params={filters}
                />

                {authService.hasPermission("purchase_orders", "create") && (
                  <Space.Compact>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate("/purchase/vehicles/create")}
                    >
                      Thêm Xe
                    </Button>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate("/purchase/parts/create")}
                      style={{ background: "#52c41a", borderColor: "#52c41a" }}
                    >
                      Thêm PT
                    </Button>
                  </Space.Compact>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Loại hàng"
                style={{ width: "100%" }}
                allowClear
                onChange={(val) => handleFilterChange("loai_hang", val)}
              >
                <Option value={LOAI_HANG.XE}>Xe</Option>
                <Option value={LOAI_HANG.PHU_TUNG}>Phụ tùng</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Chọn kho"
                style={{ width: "100%" }}
                allowClear
                onChange={(val) => handleFilterChange("ma_kho", val)}
              >
                {khoList.map((kho) => (
                  <Option key={kho.ma_kho} value={kho.ma_kho}>
                    {kho.ten_kho}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Trạng thái"
                style={{ width: "100%" }}
                allowClear
                onChange={(val) => handleFilterChange("trang_thai", val)}
              >
                {Object.keys(TRANG_THAI).map((key) => (
                  <Option key={key} value={key}>
                    {TRANG_THAI_LABELS[key]}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                onChange={(dates) => {
                  const newFilters = {
                    ...filters,
                    tu_ngay: dates ? dates[0] : null,
                    den_ngay: dates ? dates[1] : null,
                  };
                  setFilters(newFilters);
                  fetchData(newFilters);
                }}
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </Col>
            <Col xs={24} sm={24} md={4}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => fetchData()}
                block
              >
                Tìm
              </Button>
            </Col>
          </Row>
        </div>

        {viewMode === "table" ? (
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(record) =>
              `${record.loai_hang_label}-${record.id || record.so_phieu}`
            }
            loading={loading}
            size="small"
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total}`,
              size: "small",
            }}
          />
        ) : (
          <OrderKanban
            data={data}
            loading={loading}
            onCardClick={(item) => {
              const path =
                item.loai_hang_label === LOAI_HANG.XE
                  ? `/purchase/vehicles/${item.so_phieu}`
                  : `/purchase/parts/${item.id}`;
              navigate(path);
            }}
          />
        )}
      </Card>

      <OrderReceiveModal
        visible={receiveModalVisible}
        onCancel={() => setReceiveModalVisible(false)}
        onSuccess={() => {
          fetchData();
          setReceiveModalVisible(false);
        }}
        orderId={selectedOrderId}
      />

      <PartReceiveModal
        visible={partReceiveModalVisible}
        onCancel={() => setPartReceiveModalVisible(false)}
        onSuccess={() => {
          fetchData();
          setPartReceiveModalVisible(false);
        }}
        orderId={selectedOrderId}
      />

      <QRScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default PurchaseOrderList;
