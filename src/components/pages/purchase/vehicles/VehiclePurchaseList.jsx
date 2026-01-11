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
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  ImportOutlined,
  ExportOutlined,
  CarOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ImportButton from "../../../features/Import/ImportButton";
import ExportButton from "../../../features/Export/ExportButton";
import { useNavigate } from "react-router-dom";
import { donHangMuaXeAPI, khoAPI, khachHangAPI } from "../../../../api";
import { formatService, notificationService } from "../../../../services";
import { TRANG_THAI_COLORS } from "../../../../utils/constant";

const { Option } = Select;
const { RangePicker } = DatePicker;

const VehiclePurchaseList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [filters, setFilters] = useState({
    ma_kho: null,
    trang_thai: null,
    tu_ngay: null,
    den_ngay: null,
  });

  useEffect(() => {
    fetchMasterData();
    fetchData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [khoRes, nccRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll({ la_nha_cung_cap: true }),
      ]);

      setKhoList(khoRes || []);
      setSupplierList(nccRes?.data || []);
    } catch (error) {
      notificationService.error("Lỗi tải dữ liệu master");
    }
  };

  const fetchData = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { ...currentFilters };
      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      const res = await donHangMuaXeAPI.getAll(params);
      setData(res.data?.data || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách đơn hàng mua xe");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const getSupplierName = (id) => {
    const sup = supplierList.find((s) => s.id === id || s.ma_kh === id);
    return sup ? sup.ho_ten : id;
  };

  const getKhoName = (id) => {
    const kho = khoList.find((k) => k.ma_kho === id);
    return kho ? kho.ten_kho : id;
  };

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat_hang",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "ma_ncc",
      key: "ma_ncc",
      render: (id) => getSupplierName(id),
    },
    {
      title: "Kho nhập",
      dataIndex: "ma_kho_nhap",
      key: "ma_kho_nhap",
      render: (id) => getKhoName(id),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
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
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/purchase/vehicles/${record.so_phieu}`)}
        >
          Chi tiết
        </Button>
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
            <h2 style={{ margin: 0 }}>Mua Xe</h2>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <ImportButton
                module="nhap-kho-xe"
                title="Đơn Nhập Kho Xe"
                onSuccess={fetchData}
              />
              <ExportButton
                module="nhap-kho-xe"
                title="Đơn Nhập Kho Xe"
                params={filters}
              />
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/purchase/vehicles/create")}
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
                  onChange={(v) => handleFilterChange("ma_kho", v)}
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
    </div>
  );
};

export default VehiclePurchaseList;
