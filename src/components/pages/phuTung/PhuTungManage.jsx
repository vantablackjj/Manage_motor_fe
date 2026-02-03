import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Tabs,
  Button,
  Space,
  Input,
  Select,
  Row,
  Badge,
  Col,
  Tooltip,
  Popconfirm,
  message,
  Statistic,
  Tag,
  Modal,
  Switch,
} from "antd";
import {
  PlusOutlined,
  LockOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  HistoryOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import { phuTungAPI, tonKhoAPI, danhMucAPI } from "../../../api";
import authService from "../../../services/auth.service";
import PhuTungForm from "./PhuTungForm";
import LichSuModal from "./PhuTungLichSu";
import DanhSachKhoaTab from "./DanhSachKhoa";
import { useResponsive } from "../../../hooks/useResponsive";
import { notificationService } from "../../../services";

const PhuTungManage = () => {
  const { isMobile, isTablet } = useResponsive();

  const [activeTab, setActiveTab] = useState("danh-sach");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [tonKhoData, setTonKhoData] = useState([]);
  const [khoList, setKhoList] = useState([]);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [nhomPT, setNhomPT] = useState(undefined);
  const [trangThaiTon, setTrangThaiTon] = useState(undefined);
  const [nhomPTList, setNhomPTList] = useState([]);

  // Modal states
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingRecord, setEditingRecord] = useState(null);
  const [lichSuVisible, setLichSuVisible] = useState(false);
  const [selectedPhuTung, setSelectedPhuTung] = useState(null);

  const ma_kho = authService.getDefaultWarehouse();

  useEffect(() => {
    if (activeTab === "danh-sach") {
      loadDanhSach();
    } else if (activeTab === "ton-kho") {
      loadTonKho();
    }
  }, [activeTab, nhomPT, searchText, trangThaiTon]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const res = await danhMucAPI.brand.getAll({
        ma_nhom_cha: "PT",
        status: "all",
      });
      setNhomPTList(res || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDanhSach = async () => {
    setLoading(true);
    try {
      const response = await phuTungAPI.getAll({
        ma_nh: nhomPT,
        search: searchText,
        status: "all",
      });
      if (response.success) {
        const mappedData = response.data.map((item) => ({
          ...item,
          ma_pt: item.ma_pt,
          ten_pt: item.ten_pt,
          nhom_pt: item.nhom_pt,
          ten_nh: item.ten_nh,
          gia_nhap: Number(item.gia_nhap),
          gia_ban: Number(item.gia_ban),
          vat: Number(item.vat),
        }));
        setData(mappedData);
      }
    } catch (error) {
      message.error("Không thể tải danh sách!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const loadTonKho = async () => {
    setLoading(true);
    try {
      const res = await tonKhoAPI.getAll({
        ma_pt: searchText || undefined,
      });
      if (res.success) {
        setTonKhoData(res.data);
      }
    } catch (e) {
      message.error("Không thể tải tồn kho");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormMode("create");
    setEditingRecord(null);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setFormMode("edit");
    setEditingRecord(record);
    setFormVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      const response = await phuTungAPI.delete(record.ma_pt);
      if (response) {
        message.success("Khóa phụ tùng thành công!");
        loadDanhSach();
      }
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        "Không thể khóa phụ tùng khi còn tồn kho";
      message.error(errorMsg);
    }
  };

  const handleRestore = async (record) => {
    try {
      const response = await phuTungAPI.update(record.ma_pt, {
        ...record,
        status: true,
      });
      if (response) {
        message.success("Khôi phục phụ tùng thành công!");
        loadDanhSach();
      }
    } catch (error) {
      message.error("Không thể khôi phục phụ tùng!");
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      const payload = {
        ten_pt: values.ten_pt,
        ma_nh: values.nhom_pt || "PT",
        loai_quan_ly: "BATCH",
        gia_nhap: values.gia_nhap,
        gia_ban: values.gia_ban,
        don_vi_tinh: values.don_vi_tinh,
        nhom_pt: values.nhom_pt,
        thong_so_ky_thuat: {
          ghi_chu: values.ghi_chu,
          vat: values.vat,
          don_vi_lon: values.don_vi_lon,
          ty_le_quy_doi: values.ty_le_quy_doi,
        },
      };

      if (formMode === "edit") {
        payload.ma_loai = values.ma_pt;
      }

      if (formMode === "create") {
        await phuTungAPI.create(payload);
        message.success("Tạo phụ tùng thành công!");
      } else {
        await phuTungAPI.update(editingRecord.ma_pt, payload);
        message.success("Cập nhật phụ tùng thành công!");
      }
      setFormVisible(false);
      loadDanhSach();
    } catch (error) {
      message.error("Có lỗi xảy ra! " + (error?.response?.data?.message || ""));
    }
  };

  const handleViewLichSu = (record) => {
    setSelectedPhuTung(record);
    setLichSuVisible(true);
  };

  const danhSachColumns = [
    {
      title: "Mã PT",
      dataIndex: "ma_pt",
      key: "ma_pt",
      width: 100,
      fixed: "left",
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "ten_pt",
      key: "ten_pt",
      width: 250,
      ellipsis: true,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          {record.status === false && (
            <Tag color="red" size="small" style={{ fontSize: "10px" }}>
              Đã khóa
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "ĐVT",
      dataIndex: "don_vi_tinh",
      key: "don_vi_tinh",
      width: 80,
      align: "center",
    },
    {
      title: "Nhóm",
      dataIndex: "nhom_pt",
      key: "nhom_pt",
      width: 150,
      render: (_, record) =>
        record.ten_nh ? (
          <Tag color="blue">{record.ten_nh}</Tag>
        ) : (
          <Tag color="default">{record.nhom_pt || "-"}</Tag>
        ),
    },
    {
      title: "Giá nhập",
      dataIndex: "gia_nhap",
      key: "gia_nhap",
      width: 130,
      align: "right",
      render: (price) => price?.toLocaleString("vi-VN"),
    },
    {
      title: "Giá bán",
      dataIndex: "gia_ban",
      key: "gia_ban",
      width: 130,
      align: "right",
      render: (price) => price?.toLocaleString("vi-VN"),
    },
    {
      title: "VAT (%)",
      dataIndex: "vat",
      key: "vat",
      width: 80,
      align: "center",
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Lịch sử">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => handleViewLichSu(record)}
            />
          </Tooltip>
          {record.status !== false ? (
            <>
              {authService.canEdit() && (
                <Tooltip title="Sửa">
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>
              )}
              {authService.canDelete() && (
                <Popconfirm
                  title="Khóa phụ tùng"
                  description="Bạn có chắc muốn khóa phụ tùng này không?"
                  onConfirm={() => handleDelete(record)}
                  okText="Khóa"
                  cancelText="Hủy"
                >
                  <Tooltip title="Khóa/Xóa">
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Tooltip>
                </Popconfirm>
              )}
            </>
          ) : (
            <Popconfirm
              title="Khôi phục phụ tùng"
              description="Bạn có muốn khôi phục phụ tùng này không?"
              onConfirm={() => handleRestore(record)}
            >
              <Tooltip title="Khôi phục">
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  style={{ color: "#52c41a" }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const formatStock = (quantity, record) => {
    const product = data.find((p) => p.ma_pt === record.ma_pt);
    const unit = product?.don_vi_tinh || "Cái";
    const techSpecs = product?.thong_so_ky_thuat || {};
    const bigUnit = techSpecs.don_vi_lon;
    const rate = techSpecs.ty_le_quy_doi;

    if (quantity > 0 && bigUnit && rate > 1) {
      const bigQty = Math.floor(quantity / rate);
      const smallQty = quantity % rate;
      let text = [];
      if (bigQty > 0) text.push(`${bigQty} ${bigUnit}`);
      if (smallQty > 0) text.push(`${smallQty} ${unit}`);
      return (
        <Tooltip title={`Tổng: ${quantity} ${unit}`}>
          <Tag color="green">{text.join(", ")}</Tag>
        </Tooltip>
      );
    }
    return (
      <Tag color={quantity === 0 ? "red" : "green"}>
        {quantity} {unit}
      </Tag>
    );
  };

  const tonKhoColumns = [
    {
      title: "Mã kho",
      dataIndex: "ma_kho",
      key: "ma_kho",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Mã PT",
      dataIndex: "ma_pt",
      key: "ma_pt",
      width: 100,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "ten_pt",
      key: "ten_pt",
      width: 200,
      render: (text, record) => {
        const product = data.find((p) => p.ma_pt === record.ma_pt);
        return product ? product.ten_pt : text || record.ma_pt;
      },
    },
    {
      title: "Số lượng tồn",
      dataIndex: "so_luong_ton",
      key: "so_luong_ton",
      width: 180,
      align: "right",
      render: (num, record) => formatStock(num, record),
    },
    !isMobile && {
      title: "Cập nhật",
      dataIndex: "ngay_cap_nhat",
      key: "ngay_cap_nhat",
      width: 160,
      render: (d) => new Date(d).toLocaleString("vi-VN"),
    },
  ].filter(Boolean);

  const tongTonKho = tonKhoData.reduce(
    (sum, item) => sum + item.so_luong_ton,
    0,
  );
  const phuTungSapHet = tonKhoData.filter(
    (item) => item.so_luong_ton < item.so_luong_toi_thieu,
  ).length;
  const khoHetHang = tonKhoData.filter((i) => i.so_luong_ton === 0).length;

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card size="small">
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[8, 16]}>
            <Col xs={24} sm={12}>
              <h2 style={{ margin: 0 }}>
                <Space wrap>
                  <span>Quản lý Phụ tùng</span>
                  <Badge
                    count={data.length}
                    showZero
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </Space>
              </h2>
            </Col>
            <Col
              xs={24}
              sm={12}
              style={{ textAlign: isMobile ? "left" : "right" }}
            >
              <Space>
                {activeTab === "danh-sach" && (
                  <Space wrap>
                    <ImportButton
                      module="part"
                      title="Phụ tùng"
                      onSuccess={loadDanhSach}
                    />
                    <ExportButton
                      module="part"
                      title="Phụ tùng"
                      params={{ nhom_pt: nhomPT, search: searchText }}
                    />
                  </Space>
                )}
                {activeTab === "danh-sach" && authService.canCreate() && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                    block={isMobile}
                  >
                    Thêm phụ tùng
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          <Tabs
            size={isMobile ? "small" : "middle"}
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: "danh-sach", label: "Danh sách" },
              {
                key: "ton-kho",
                label: (
                  <Badge count={phuTungSapHet} offset={[10, 0]} size="small">
                    Tồn kho
                  </Badge>
                ),
              },
              {
                key: "bi-khoa",
                label: (
                  <Space>
                    <LockOutlined />
                    Bị khóa
                  </Space>
                ),
              },
            ]}
          />
        </div>

        {activeTab === "ton-kho" && (
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Tổng tồn"
                  value={tongTonKho}
                  valueStyle={{ fontSize: isMobile ? 16 : 24 }}
                />
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card size="small">
                <Statistic
                  title="Hết hàng"
                  value={khoHetHang}
                  valueStyle={{
                    color: khoHetHang ? "#cf1322" : "#3f8600",
                    fontSize: isMobile ? 16 : 24,
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        <div
          style={{
            marginBottom: 16,
            padding: isMobile ? 8 : 16,
            background: "#fafafa",
            borderRadius: 8,
          }}
        >
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Input
                placeholder="Mã, tên phụ tùng..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearch}
                allowClear
                size="small"
              />
            </Col>
            {activeTab === "danh-sach" && (
              <Col xs={24} sm={12} md={6} lg={6}>
                <Select
                  placeholder="Nhóm phụ tùng"
                  style={{ width: "100%" }}
                  value={nhomPT}
                  onChange={setNhomPT}
                  allowClear
                  size="small"
                >
                  {nhomPTList.map((nhom) => (
                    <Select.Option key={nhom.ma_nh} value={nhom.ma_nh}>
                      {nhom.ten_nh}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col
              xs={24}
              sm={activeTab === "danh-sach" ? 12 : 24}
              md={activeTab === "danh-sach" ? 6 : 12}
              lg={activeTab === "danh-sach" ? 10 : 16}
              style={{ textAlign: isMobile ? "left" : "right" }}
            >
              <Space wrap>
                <Button
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    activeTab === "danh-sach" ? loadDanhSach() : loadTonKho()
                  }
                >
                  Tải lại
                </Button>
                {activeTab === "danh-sach" && (
                  <ExportButton
                    module="part"
                    title="Danh sách phụ tùng"
                    params={{ nhom_pt: nhomPT, search: searchText }}
                    size="small"
                  />
                )}
              </Space>
            </Col>
          </Row>
        </div>

        {activeTab === "danh-sach" && (
          <Table
            columns={danhSachColumns.filter(
              (col) =>
                !isMobile ||
                !["gia_nhap", "gia_ban", "vat"].includes(col.dataIndex),
            )}
            dataSource={data}
            rowKey="ma_pt"
            loading={loading}
            scroll={{ x: 800 }}
            size="small"
            rowClassName={(record) =>
              record.status === false ? "inactive-row" : ""
            }
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng: ${total}`,
              size: "small",
            }}
          />
        )}

        {activeTab === "ton-kho" && (
          <Table
            columns={tonKhoColumns}
            dataSource={tonKhoData}
            rowKey="ma_pt"
            loading={loading}
            scroll={{ x: 800 }}
            size="small"
            rowClassName={(record) => {
              let classes = [];
              if (record.so_luong_ton < record.so_luong_toi_thieu)
                classes.push("low-stock-row");
              if (record.status === false) classes.push("inactive-row");
              return classes.join(" ");
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng: ${total}`,
              size: "small",
            }}
          />
        )}

        {activeTab === "bi-khoa" && <DanhSachKhoaTab ma_kho={ma_kho} />}
      </Card>

      <PhuTungForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingRecord}
        mode={formMode}
        khoList={khoList}
      />

      <LichSuModal
        visible={lichSuVisible}
        onClose={() => setLichSuVisible(false)}
        ma_pt={selectedPhuTung?.ma_pt}
        ten_pt={selectedPhuTung?.ten_pt}
      />

      <style>{`
        .low-stock-row { background-color: #fff1f0 !important; }
        .low-stock-row:hover { background-color: #ffe7e7 !important; }
        .inactive-row { background-color: #fafafa !important; opacity: 0.6; }
        .inactive-row td { color: #bfbfbf !important; }
      `}</style>
    </div>
  );
};

export default PhuTungManage;
