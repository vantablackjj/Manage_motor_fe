import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Row,
  Col,
  DatePicker,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ImportOutlined,
  ExportOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ImportButton from "../../../features/Import/ImportButton";
import ExportButton from "../../../features/Export/ExportButton";
import { useNavigate } from "react-router-dom";
import { donHangAPI, khoAPI, khachHangAPI } from "../../../../api";
import { formatService, notificationService } from "../../../../services";
import { TRANG_THAI_COLORS, LOAI_DON_HANG } from "../../../../utils/constant";
import PartReceiveModal from "./PartReceiveModal";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PartPurchaseList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [filters, setFilters] = useState({
    ma_ben_nhap: null, // Kho nhập
    status: true,
    trang_thai: null,
    tu_ngay: null,
    den_ngay: null,
  });

  useEffect(() => {
    fetchKhoList();
    fetchSupplierList();
    fetchData();
  }, []);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {}
  };

  const fetchSupplierList = async () => {
    try {
      const res = await khachHangAPI.getAll();
      const all = res.data || res || [];
      setSupplierList(all.filter((c) => c.la_ncc));
    } catch (error) {}
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        ...currentFilters,
        // loai_don_hang: LOAI_DON_HANG.MUA_HANG, // API /don-hang-mua implies this
        // loai_hang: "PHU_TUNG", // API /don-hang-mua implies this
      };
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      // Use donHangAPI ( /api/v1/don-hang-mua ) per user request
      const res = await donHangAPI.getAll(params);
      setData(res.data?.data || res.data || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách đơn hàng phụ tùng");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleOpenReceiveModal = (id) => {
    setSelectedOrderId(id);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      // so_phieu or so_don_hang preferred
      dataIndex: "so_phieu",
      key: "so_phieu",
      render: (text, record) => <b>{text || record.so_don_hang}</b>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat_hang",
      key: "ngay_dat_hang",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "ten_ncc", // Backend returns ten_ncc
      key: "ten_ncc",
      render: (text, record) => text || record.ma_ben_xuat, // Fallback
    },
    {
      title: "Kho nhập",
      dataIndex: "ten_kho", // Backend returns ten_kho
      key: "ten_kho",
      render: (text, record) => text || record.ma_ben_nhap, // Fallback
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      align: "right",
      render: (val, record) =>
        formatService.formatCurrency(val || record.thanh_tien),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/purchase/parts/${record.id}`)}
          >
            Chi tiết
          </Button>
          {record.trang_thai === "DA_DUYET" && (
            <Button
              icon={<DownloadOutlined />}
              size="small"
              type="primary"
              onClick={() => handleOpenReceiveModal(record.id)}
            >
              Nhập kho
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card size="small">
        <Row
          justify="space-between"
          align="middle"
          gutter={[8, 16]}
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} md={12}>
            <h2 style={{ margin: 0 }}>
              <ShoppingCartOutlined /> Mua Phụ Tùng
            </h2>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <ImportButton
                module="nhap-kho"
                title="Đơn Nhập Kho"
                onSuccess={fetchData}
              />
              <ExportButton
                module="nhap-kho"
                title="Đơn Nhập Kho"
                params={filters}
              />
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/purchase/parts/create")}
              >
                Tạo mới
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Chọn kho"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("ma_ben_nhap", v)}
                >
                  {khoList.map((k) => (
                    <Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("trang_thai", v)}
                >
                  <Option value="NHAP">Nháp</Option>
                  <Option value="GUI_DUYET">Chờ duyệt</Option>
                  <Option value="DA_DUYET">Đã duyệt</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={(dates) => {
                    handleFilterChange("tu_ngay", dates ? dates[0] : null);
                    handleFilterChange("den_ngay", dates ? dates[1] : null);
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={4}>
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
          </Space>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          scroll={{ x: 800 }}
          pagination={{
            size: "small",
            showTotal: (total) => `Tổng: ${total}`,
          }}
        />
      </Card>

      <PartReceiveModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          fetchData();
          setModalVisible(false);
        }}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default PartPurchaseList;
