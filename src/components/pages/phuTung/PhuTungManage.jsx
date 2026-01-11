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
import { phuTungAPI, tonKhoAPI } from "../../../api";
import authService from "../../../services/auth.service";
import PhuTungForm from "./PhuTungForm";
import LichSuModal from "./PhuTungLichSu";
import DanhSachKhoaTab from "./DanhSachKhoa";
import { useResponsive } from "../../../hooks/useResponsive";
import { notificationService } from "../../../services";

const PhuTungManagement = () => {
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
    console.log(khoList);
  }, [khoList]);

  const loadDanhSach = async () => {
    setLoading(true);
    try {
      const response = await phuTungAPI.getAll({
        nhom_pt: nhomPT,
        search: searchText,
      });
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      message.error("Không thể tải danh sách!");
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
  };

  const loadTonKho = async () => {
    setLoading(true);
    try {
      const res = await tonKhoAPI.getAll({
        ma_pt: searchText || undefined, // nếu backend hỗ trợ
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

  const handleDelete = async (ma_pt) => {
    try {
      const response = await phuTungAPI.delete(ma_pt);
      if (response.success) {
        message.success("Xóa phụ tùng thành công!");
        loadDanhSach();
      }
    } catch (error) {
      message.error("Không thể xóa phụ tùng!");
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (formMode === "create") {
        const response = await phuTungAPI.create(values);
        if (response.success) {
          message.success("Tạo phụ tùng thành công!");
          loadDanhSach();
        }
      } else {
        const response = await phuTungAPI.update(editingRecord.ma_pt, values);
        if (response.success) {
          message.success("Cập nhật phụ tùng thành công!");
          loadDanhSach();
        }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    }
  };

  const handleViewLichSu = (record) => {
    setSelectedPhuTung(record);
    setLichSuVisible(true);
  };

  // Columns cho danh sách phụ tùng
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
      width: 120,
      render: (nhom) => (nhom ? <Tag color="blue">{nhom}</Tag> : "-"),
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
              title="Xóa phụ tùng"
              description="Bạn có chắc muốn xóa phụ tùng này?"
              onConfirm={() => handleDelete(record.ma_pt)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Columns cho tồn kho
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
      title: "Số lượng tồn",
      dataIndex: "so_luong_ton",
      key: "so_luong_ton",
      width: 130,
      align: "right",
      render: (num) => <Tag color={num === 0 ? "red" : "green"}>{num}</Tag>,
    },
    !isMobile && {
      title: "Cập nhật",
      dataIndex: "ngay_cap_nhat",
      key: "ngay_cap_nhat",
      width: 160,
      render: (d) => new Date(d).toLocaleString("vi-VN"),
    },
  ].filter(Boolean);

  // Tính toán thống kê
  const tongTonKho = tonKhoData.reduce(
    (sum, item) => sum + item.so_luong_ton,
    0
  );
  const tongKhoa = tonKhoData.reduce(
    (sum, item) => sum + item.so_luong_khoa,
    0
  );
  const tongKhaDung = tonKhoData.reduce(
    (sum, item) => sum + item.so_luong_kha_dung,
    0
  );
  const phuTungSapHet = tonKhoData.filter(
    (item) => item.so_luong_ton < item.so_luong_toi_thieu
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
              {
                key: "danh-sach",
                label: "Danh sách",
              },
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

        {/* Filters */}
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
                  <Select.Option value="Động cơ">Động cơ</Select.Option>
                  <Select.Option value="Phanh">Phanh</Select.Option>
                  <Select.Option value="Điện">Điện</Select.Option>
                  <Select.Option value="Truyền động">Truyền động</Select.Option>
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

        {/* Statistics for Ton Kho tab */}
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

        {/* Tables */}
        {activeTab === "danh-sach" && (
          <Table
            columns={danhSachColumns.filter(
              (col) =>
                !isMobile ||
                !["gia_nhap", "gia_ban", "vat"].includes(col.dataIndex)
            )}
            dataSource={data}
            rowKey="ma_pt"
            loading={loading}
            scroll={{ x: 800 }}
            size="small"
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
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng: ${total}`,
              size: "small",
            }}
            rowClassName={(record) =>
              record.so_luong_ton < record.so_luong_toi_thieu
                ? "low-stock-row"
                : ""
            }
          />
        )}

        {activeTab === "bi-khoa" && <DanhSachKhoaTab ma_kho={ma_kho} />}
      </Card>

      {/* Form Modal */}
      <PhuTungForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingRecord}
        mode={formMode}
        khoList={khoList}
      />

      {/* Lich Su Modal */}
      <LichSuModal
        visible={lichSuVisible}
        onClose={() => setLichSuVisible(false)}
        ma_pt={selectedPhuTung?.ma_pt}
        ten_pt={selectedPhuTung?.ten_pt}
      />

      <style>{`
        .low-stock-row {
          background-color: #fff1f0 !important;
        }
        .low-stock-row:hover {
          background-color: #ffe7e7 !important;
        }
      `}</style>
    </div>
  );
};

export default PhuTungManagement;
