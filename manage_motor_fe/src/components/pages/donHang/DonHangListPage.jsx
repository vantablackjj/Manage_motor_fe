// src/pages/donHang/DonHangListPage.jsx
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
  Tooltip,
  Row,
  Col,
  Statistic,
  Badge,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { donHangAPI, khoAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
  validationService,
  storageService,
} from "../../../services";
import { TRANG_THAI_COLORS } from "../../../utils/constant";

const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

const DonHangListPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState(() => {
    return (
      storageService.getFilterSettings("don-hang-list") || {
        ma_kho: authService.getDefaultWarehouse(),
        trang_thai: null,
        search: "",
      }
    );
  });

  const [khoList, setKhoList] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    nhap: 0,
    guiDuyet: 0,
    daDuyet: 0,
  });

  useEffect(() => {
    fetchKhoList();
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  const fetchKhoList = async () => {
    try {
      const khos = await khoAPI.getAll();
      setKhoList(khos || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách kho");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        ma_kho_nhap: filters.ma_kho,
        trang_thai: filters.trang_thai,
        search: filters.search,
      };

      const response = await donHangAPI.getAll(params);

      setData(response.data || []);
      setTotal(response.total || 0);

      const statsData = response.stats || {};
      setStats({
        total: statsData.total || 0,
        nhap: statsData.nhap || 0,
        guiDuyet: statsData.guiDuyet || 0,
        daDuyet: statsData.daDuyet || 0,
      });
    } catch (error) {
      notificationService.error("Không thể tải danh sách đơn hàng");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
    storageService.saveFilterSettings("don-hang-list", newFilters);
  };

  const handleView = (record) => {
    navigate(`/don-hang/${record.so_phieu}`);
  };

  const handleEdit = (record) => {
    if (!validationService.canEdit(record.trang_thai)) {
      notificationService.warning("Không thể chỉnh sửa đơn hàng này");
      return;
    }
    navigate(`/don-hang/${record.so_phieu}/edit`);
  };

  const handleSendForApproval = (record) => {
    if (!validationService.canSendForApproval(record.trang_thai)) {
      notificationService.warning("Không thể gửi duyệt đơn hàng này");
      return;
    }

    confirm({
      title: "Xác nhận gửi duyệt",
      content: `Bạn có chắc chắn muốn gửi đơn hàng ${record.so_phieu} để phê duyệt?`,
      okText: "Gửi duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await donHangAPI.guiDuyet(record.so_phieu);
          notificationService.sendForApprovalSuccess("đơn hàng");
          fetchData();
        } catch (error) {
          notificationService.sendForApprovalError("đơn hàng", error);
        }
      },
    });
  };

  const handleApprove = (record) => {
    if (!validationService.canApprove(record.trang_thai)) {
      notificationService.warning("Không thể phê duyệt đơn hàng này");
      return;
    }

    if (!authService.canApprove()) {
      notificationService.unauthorized();
      return;
    }

    confirm({
      title: "Xác nhận phê duyệt",
      content: `Bạn có chắc chắn muốn phê duyệt đơn hàng ${record.so_phieu}?`,
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await donHangAPI.pheDuyet(record.so_phieu);
          notificationService.approveSuccess("đơn hàng");
          fetchData();
        } catch (error) {
          notificationService.approveError("đơn hàng", error);
        }
      },
    });
  };

  const handleReject = (record) => {
    if (!authService.canApprove()) {
      notificationService.unauthorized();
      return;
    }

    confirm({
      title: "Xác nhận từ chối",
      content: `Bạn có chắc chắn muốn từ chối đơn hàng ${record.so_phieu}?`,
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await donHangAPI.huyDuyet(record.so_phieu);
          notificationService.rejectSuccess("đơn hàng");
          fetchData();
        } catch (error) {
          notificationService.rejectError("đơn hàng", error);
        }
      },
    });
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) =>
        formatService.formatTableIndex(index, page, pageSize),
    },
    {
      title: "Số phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      width: 150,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "ngay_dat_hang",
      key: "ngay_dat_hang",
      width: 120,
      render: (text) => formatService.formatDate(text),
    },
    {
      title: "Nhà cung cấp",
      dataIndex: "ten_ncc",
      key: "ten_ncc",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Kho nhập",
      dataIndex: "ten_kho",
      key: "ten_kho",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "tong_tien",
      key: "tong_tien",
      width: 150,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      width: 130,
      render: (text) => (
        <Tag color={TRANG_THAI_COLORS[text]}>
          {formatService.formatTrangThai(text)}
        </Tag>
      ),
    },
    {
      title: "Người tạo",
      dataIndex: "nguoi_tao",
      key: "nguoi_tao",
      width: 120,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
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

          {validationService.canEdit(record.trang_thai) &&
            authService.canEdit() && (
              <Tooltip title="Chỉnh sửa">
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
            )}

          {validationService.canSendForApproval(record.trang_thai) && (
            <Tooltip title="Gửi duyệt">
              <Button
                type="link"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSendForApproval(record)}
              />
            </Tooltip>
          )}

          {validationService.canApprove(record.trang_thai) &&
            authService.canApprove() && (
              <>
                <Tooltip title="Phê duyệt">
                  <Button
                    type="link"
                    size="small"
                    icon={<CheckOutlined />}
                    style={{ color: "#52c41a" }}
                    onClick={() => handleApprove(record)}
                  />
                </Tooltip>
                <Tooltip title="Từ chối">
                  <Button
                    type="link"
                    size="small"
                    icon={<CloseOutlined />}
                    danger
                    onClick={() => handleReject(record)}
                  />
                </Tooltip>
              </>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingCartOutlined /> Đơn hàng mua
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>Quản lý đơn hàng mua</p>
        </div>
        <Space wrap>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
          {authService.canCreate() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/don-hang/create")}
            >
              Tạo đơn hàng
            </Button>
          )}
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats.total}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang nhập"
              value={stats.nhap}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Badge count={stats.guiDuyet} offset={[10, 0]}>
              <Statistic
                title="Chờ duyệt"
                value={stats.guiDuyet}
                valueStyle={{ color: "#faad14" }}
              />
            </Badge>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={stats.daDuyet}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: "16px" }}>
        <Space wrap style={{ width: "100%" }}>
          <Select
            placeholder="Chọn kho"
            style={{ width: 200 }}
            value={filters.ma_kho}
            onChange={(value) => handleFilterChange("ma_kho", value)}
          >
            {[].map((kho) => (
              <Option key={kho.ma_kho} value={kho.ma_kho}>
                {kho.ten_kho}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={filters.trang_thai}
            onChange={(value) => handleFilterChange("trang_thai", value)}
            allowClear
          >
            <Option value="NHAP">Đang nhập</Option>
            <Option value="GUI_DUYET">Chờ duyệt</Option>
            <Option value="DA_DUYET">Đã duyệt</Option>
            <Option value="TU_CHOI">Từ chối</Option>
            <Option value="DA_HUY">Đã hủy</Option>
          </Select>

          <Search
            placeholder="Tìm số phiếu, NCC..."
            style={{ width: 300 }}
            onSearch={(value) => handleFilterChange("search", value)}
            allowClear
          />

          <Button
            onClick={() => {
              setFilters({
                ma_kho: authService.getDefaultWarehouse(),
                trang_thai: null,
                search: "",
              });
              setPage(1);
            }}
          >
            Xóa bộ lọc
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="so_phieu"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            onChange: (page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default DonHangListPage;
