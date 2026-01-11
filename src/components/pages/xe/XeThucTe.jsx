// src/pages/xe/XeThucTe.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Row,
  Col,
  Statistic,
  Tooltip,
  Tabs,
  Badge,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  ExportOutlined,
  CarOutlined,
  StopOutlined,
  UnlockOutlined,
  LockOutlined,
} from "@ant-design/icons";

import { xeAPI, khoAPI, danhMucAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
  storageService,
} from "../../../services";
import { XE_TRANG_THAI_COLORS } from "../../../utils/constant";
import { useResponsive } from "../../../hooks/useResponsive";
import XeForm from "./XeForm";
import DanhSachXeBiKhoa from "./DanhSachXeBiKhoa";
import TonKhoXe from "./TonKhoXe";
import ExportButton from "../../../components/features/Export/ExportButton";

const { Option } = Select;
const { Search } = Input;

const XeThucTe = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("danh-sach");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filters
  const [filters, setFilters] = useState(() => {
    return (
      storageService.getFilterSettings("xe-ton-kho") || {
        ma_kho: authService.getDefaultWarehouse(),
        ma_loai_xe: null,
        ma_mau: null,
        trang_thai: "TON_KHO",
        locked: null,
        search: "",
      }
    );
  });

  // Filter options
  const [khoList, setKhoList] = useState([]);
  const [loaiXeList, setLoaiXeList] = useState([]);
  const [mauList, setMauList] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedXe, setSelectedXe] = useState(null);

  // UI states
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    tonKho: 0,
    daBan: 0,
    dangChuyen: 0,
    biKhoa: 0,
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (activeTab === "danh-sach") {
      fetchData();
    }
  }, [page, pageSize, filters, activeTab]);

  const handleLockXe = (record) => {
    Modal.confirm({
      title: "Xác nhận khóa xe",
      content: (
        <>
          <p>
            Bạn có chắc chắn muốn <strong>khóa</strong> xe:
          </p>
          <p>
            <strong>{record.xe_key}</strong>
          </p>
          <p style={{ color: "#ff4d4f" }}>
            Xe bị khóa sẽ không thể chỉnh sửa hoặc giao dịch.
          </p>
        </>
      ),
      okText: "Khóa xe",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await xeAPI.delete(record.xe_key);
          notificationService.success("Đã khóa xe");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Không thể khóa xe"
          );
        }
      },
    });
  };

  const handleUnlockXe = (record) => {
    Modal.confirm({
      title: "Mở khóa xe",
      content: (
        <>
          <p>
            Bạn có muốn <strong>mở khóa</strong> xe:
          </p>
          <p>
            <strong>{record.xe_key}</strong>
          </p>
        </>
      ),
      okText: "Mở khóa",
      cancelText: "Hủy",
      async onOk() {
        try {
          await xeAPI.unlock(record.xe_key);
          notificationService.success("Đã mở khóa xe");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Không thể mở khóa xe"
          );
        }
      },
    });
  };

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
      notificationService.error("Không thể tải danh sách bộ lọc");
    }
  };

  const fetchData = async () => {
    if (!filters.ma_kho) {
      notificationService.warning("Vui lòng chọn kho");
      return;
    }

    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        ma_loai_xe: filters.ma_loai_xe,
        ma_mau: filters.ma_mau,
        trang_thai: filters.trang_thai,
        locked: filters.locked,
        search: filters.search,
      };

      const response = await xeAPI.getTonKho(filters.ma_kho, params);

      const list = response.data || [];

      setData(list);
      setTotal(list.length);

      // TÍNH STATS TỪ DATA
      const tonKho = list.filter((x) => x.trang_thai === "TON_KHO").length;
      const daBan = list.filter((x) => x.trang_thai === "DA_BAN").length;
      const dangChuyen = list.filter(
        (x) => x.trang_thai === "DANG_CHUYEN"
      ).length;
      const biKhoa = list.filter((x) => x.locked === true).length;

      setStats({
        total: list.length,
        tonKho,
        daBan,
        dangChuyen,
        biKhoa,
      });
    } catch (error) {
      notificationService.error("Không thể tải danh sách xe");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    storageService.saveFilterSettings("xe-ton-kho", newFilters);
  };

  const handleSearch = (value) => {
    handleFilterChange("search", value);
  };

  const handleReset = () => {
    const defaultFilters = {
      ma_kho: authService.getDefaultWarehouse(),
      ma_loai_xe: null,
      ma_mau: null,
      trang_thai: "TON_KHO",
      locked: null,
      search: "",
    };
    setFilters(defaultFilters);
    setPage(1);
    storageService.clearFilterSettings("xe-ton-kho");
  };

  const handleView = (record) => {
    setFormMode("view");
    setSelectedXe(record);
    setFormVisible(true);
  };

  const handleEdit = (record) => {
    setFormMode("edit");
    setSelectedXe(record);
    setFormVisible(true);
  };

  const handleCreate = () => {
    setFormMode("create");
    setSelectedXe(null);
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
    setSelectedXe(null);
    setFormMode("create");
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchData();
  };

  const handleExport = () => {
    notificationService.info("Chức năng xuất Excel đang được phát triển");
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      fixed: "left",
      render: (_, __, index) =>
        formatService.formatTableIndex(index, page, pageSize),
    },
    {
      title: "Mã xe",
      dataIndex: "xe_key",
      key: "xe_key",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Loại xe",
      dataIndex: "ten_loai",
      key: "ten_loai",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Màu",
      dataIndex: "ten_mau",
      key: "ten_mau",
      width: 100,
      render: (text, record) => <Tag color={record.gia_tri_mau}>{text}</Tag>,
    },
    {
      title: "Số khung",
      dataIndex: "so_khung",
      key: "so_khung",
      width: 180,
      render: (text) => formatService.formatSoKhung(text),
    },
    {
      title: "Số máy",
      dataIndex: "so_may",
      key: "so_may",
      width: 150,
      render: (text) => formatService.formatSoMay(text),
    },
    {
      title: "Giá nhập",
      dataIndex: "gia_nhap",
      key: "gia_nhap",
      width: 130,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
    },
    {
      title: "Ngày nhập",
      dataIndex: "ngay_nhap",
      key: "ngay_nhap",
      width: 120,
      render: (text) => formatService.formatDate(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 120,
      fixed: isMobile ? false : "right",
      render: (text) => (
        <Tag color={XE_TRANG_THAI_COLORS[text]}>
          {formatService.formatXeTrangThai(text)}
        </Tag>
      ),
    },
    {
      title: "Khóa",
      dataIndex: "locked",
      key: "locked",
      width: 80,
      align: "center",
      render: (locked) =>
        locked ? (
          <Tooltip title="Xe đang bị khóa">
            <Tag color="red">Khóa</Tag>
          </Tooltip>
        ) : null,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>

          {authService.canEdit() && !record.locked && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}

          {authService.canDelete() &&
            record.trang_thai === "TON_KHO" &&
            (record.locked ? (
              <Tooltip title="Mở khóa xe">
                <Button
                  type="link"
                  size="small"
                  icon={<UnlockOutlined />}
                  onClick={() => handleUnlockXe(record)}
                />
              </Tooltip>
            ) : (
              <Tooltip title="Khóa xe">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => handleLockXe(record)}
                />
              </Tooltip>
            ))}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
    getCheckboxProps: (record) => ({
      disabled: record.locked || record.trang_thai === "DA_BAN",
    }),
  };

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card size="small">
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[8, 16]}>
            <Col xs={24} sm={12}>
              <h2 style={{ margin: 0 }}>
                <Space wrap>
                  <CarOutlined />
                  <span>Quản lý xe</span>
                  <Badge
                    count={stats.total}
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
              {activeTab === "danh-sach" && authService.canCreate() && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreate}
                  block={isMobile}
                >
                  Nhập kho xe
                </Button>
              )}
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size={isMobile ? "small" : "middle"}
            items={[
              {
                key: "danh-sach",
                label: "Danh sách",
              },
              {
                key: "ton-kho",
                label: "Tồn kho",
              },
              {
                key: "bi-khoa",
                label: (
                  <Badge count={stats.biKhoa} offset={[10, 0]} size="small">
                    <Space>
                      <LockOutlined />
                      Bị khóa
                    </Space>
                  </Badge>
                ),
              },
            ]}
          />
        </div>

        {/* Tab: Danh sách xe */}
        {activeTab === "danh-sach" && (
          <>
            {/* Statistics */}
            <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tổng"
                    value={stats.total}
                    prefix={<CarOutlined />}
                    valueStyle={{ fontSize: isMobile ? 16 : 24 }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Tồn kho"
                    value={stats.tonKho}
                    valueStyle={{
                      color: "#3f8600",
                      fontSize: isMobile ? 16 : 24,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Đã bán"
                    value={stats.daBan}
                    valueStyle={{
                      color: "#cf1322",
                      fontSize: isMobile ? 16 : 24,
                    }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small">
                  <Statistic
                    title="Chuyển"
                    value={stats.dangChuyen}
                    valueStyle={{
                      color: "#1890ff",
                      fontSize: isMobile ? 16 : 24,
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: "#fafafa",
              }}
            >
              <Row gutter={[8, 8]}>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Chọn kho"
                    style={{ width: "100%" }}
                    value={filters.ma_kho}
                    onChange={(value) => handleFilterChange("ma_kho", value)}
                  >
                    {khoList.map((kho) => (
                      <Option key={kho.ma_kho} value={kho.ma_kho}>
                        {kho.ten_kho}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Loại xe"
                    style={{ width: "100%" }}
                    value={filters.ma_loai_xe}
                    onChange={(value) =>
                      handleFilterChange("ma_loai_xe", value)
                    }
                    allowClear
                  >
                    {loaiXeList.map((loai) => (
                      <Option key={loai.ma_loai} value={loai.ma_loai}>
                        {loai.ten_loai}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Màu xe"
                    style={{ width: "100%" }}
                    value={filters.ma_mau}
                    onChange={(value) => handleFilterChange("ma_mau", value)}
                    allowClear
                  >
                    {mauList.map((mau) => (
                      <Option key={mau.ma_mau} value={mau.ma_mau}>
                        <Tag color={mau.gia_tri}>{mau.ten_mau}</Tag>
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Trạng thái"
                    style={{ width: "100%" }}
                    value={filters.trang_thai}
                    onChange={(value) =>
                      handleFilterChange("trang_thai", value)
                    }
                    allowClear
                  >
                    <Option value="TON_KHO">Tồn kho</Option>
                    <Option value="DANG_CHUYEN">Đang chuyển</Option>
                    <Option value="DA_BAN">Đã bán</Option>
                  </Select>
                </Col>

                <Col xs={24} md={12}>
                  <Search
                    placeholder="Tìm kiếm xe, số khung, số máy..."
                    onSearch={handleSearch}
                    allowClear
                  />
                </Col>

                <Col xs={24} md={12} style={{ textAlign: "right" }}>
                  <Space>
                    <Button onClick={handleReset}>Xóa bộ lọc</Button>
                    <Button icon={<ReloadOutlined />} onClick={fetchData}>
                      Làm mới
                    </Button>
                    <ExportButton
                      module="xe-ton-kho"
                      title="Danh sách xe"
                      params={filters}
                    />
                    {authService.canCreate() && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                      >
                        Nhập kho xe
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Table */}
            <Table
              rowSelection={authService.canEdit() ? rowSelection : null}
              columns={columns}
              dataSource={data}
              rowKey="xe_key"
              loading={loading}
              scroll={{ x: 1200 }}
              size="small"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng: ${total}`,
                size: "small",
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                },
              }}
              locale={{
                emptyText: "Không có dữ liệu",
              }}
            />
          </>
        )}

        {/* Tab: Tồn kho */}
        {activeTab === "ton-kho" && (
          <TonKhoXe ma_kho={filters.ma_kho} khoList={khoList} />
        )}

        {/* Tab: Bị khóa */}
        {activeTab === "bi-khoa" && (
          <DanhSachXeBiKhoa ma_kho={filters.ma_kho} />
        )}
      </Card>

      {/* Form Modal */}
      <Modal
        title={
          formMode === "create"
            ? "Nhập kho xe"
            : formMode === "edit"
            ? "Chỉnh sửa xe"
            : "Chi tiết xe"
        }
        width={isMobile ? "100%" : 800}
        open={formVisible}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
      >
        <XeForm
          mode={formMode}
          initialData={selectedXe}
          loaiXeList={loaiXeList}
          mauList={mauList}
          khoList={khoList}
          currentKho={filters.ma_kho}
          onSuccess={handleFormSuccess}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
};

export default XeThucTe;
