// src/components/pages/xe/VehicleApprovalList.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Row,
  Col,
  Input,
  Select,
  Tooltip,
  Typography,
  Segmented,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  TableOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { xeAPI, khoAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import {
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
  TRANG_THAI_FILTER,
} from "../../../utils/constant";
import { useDebounce } from "../../../hooks/useDebounce";
import XeForm from "./XeForm";
import OrderKanban from "../../features/OrderKanban/OrderKanban";
import MotorcycleIcon from "../../common/MotorcycleIcon";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const VehicleApprovalList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [filters, setFilters] = useState({
    trang_thai: null,
    search: "",
  });
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'kanban'

  // Modal states
  const [formVisible, setFormVisible] = useState(false);
  const [selectedXe, setSelectedXe] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const debouncedFilters = useDebounce(filters, 500);

  useEffect(() => {
    fetchKhoList();
    fetchData();
  }, [debouncedFilters]);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await xeAPI.getApprovalList(filters);
      setData(res.data || res || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách phê duyệt");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (xe_key) => {
    try {
      await xeAPI.submitApproval(xe_key);
      notificationService.success("Đã gửi yêu cầu phê duyệt");
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Gửi duyệt thất bại",
      );
    }
  };

  const handleApprove = (xe_key) => {
    Modal.confirm({
      title: "Xác nhận phê duyệt",
      content: "Bạn có chắc chắn muốn phê duyệt xe này vào kho?",
      okText: "Phê duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await xeAPI.approve(xe_key);
          notificationService.success("Phê duyệt thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Phê duyệt thất bại",
          );
        }
      },
    });
  };

  const handleReject = (xe) => {
    setSelectedXe(xe);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      notificationService.warning("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      await xeAPI.reject(selectedXe.xe_key, { ly_do: rejectReason });
      notificationService.success("Đã từ chối phê duyệt");
      setRejectModalVisible(false);
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Thao tác thất bại",
      );
    }
  };

  const handleEdit = (record) => {
    setSelectedXe(record);
    setFormVisible(true);
  };

  const columns = [
    {
      title: "Thông tin xe",
      key: "xe_info",
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text strong>{record.xe_key}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            {record.ten_loai} - {record.ten_mau}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Số khung / Số máy",
      key: "numbers",
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text style={{ fontSize: "12px" }}>
            {formatService.formatSoKhung(record.so_khung)}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            {formatService.formatSoMay(record.so_may)}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Kho",
      dataIndex: "ten_kho",
      key: "ten_kho",
    },
    {
      title: "Người tạo/Ngày tạo",
      key: "creator",
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Typography.Text style={{ fontSize: "12px" }}>
            {record.nguoi_tao_ten || record.created_by}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            {formatService.formatDateTime(record.created_at || record.ngay_tao)}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      key: "trang_thai",
      align: "center",
      render: (status, record) => (
        <Space>
          <Tag color={TRANG_THAI_COLORS[status] || "default"}>
            {TRANG_THAI_LABELS[status] || status}
          </Tag>
          {status === "DA_TU_CHOI" && record.ly_do_tu_choi && (
            <Tooltip title={record.ly_do_tu_choi}>
              <InfoCircleOutlined style={{ color: "#ff4d4f" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "right",
      render: (_, record) => {
        const isDraft = record.trang_thai === "NHAP";
        const isPending = record.trang_thai === "CHO_DUYET";
        const isRejected = record.trang_thai === "DA_TU_CHOI";

        return (
          <Space>
            {(isDraft || isRejected) && (
              <>
                <Tooltip title="Chỉnh sửa">
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  />
                </Tooltip>
                <Tooltip title="Gửi duyệt">
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    icon={<SendOutlined />}
                    onClick={() => handleSubmit(record.xe_key)}
                  >
                    Gửi duyệt
                  </Button>
                </Tooltip>
              </>
            )}

            {isPending && authService.isAdmin() && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record.xe_key)}
                >
                  Duyệt
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record)}
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card size="small">
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
          gutter={[8, 16]}
        >
          <Col xs={24} md={12}>
            <Space align="center" size="large">
              <Title level={4} style={{ margin: 0 }}>
                <Space>
                  <CheckCircleOutlined />
                  Phê duyệt xe nhập lẻ
                </Space>
              </Title>
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
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              Làm mới
            </Button>
          </Col>
        </Row>

        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm số khung, số máy, mã xe..."
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: "100%" }}
              allowClear
              onChange={(v) => setFilters({ ...filters, trang_thai: v })}
            >
              {TRANG_THAI_FILTER.XE_APPROVAL.map((key) => (
                <Option key={key} value={key}>
                  {TRANG_THAI_LABELS[key]}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {viewMode === "table" ? (
          <Table
            dataSource={data}
            columns={columns}
            rowKey="xe_key"
            loading={loading}
            size="small"
            scroll={{ x: 1000 }}
            pagination={{
              size: "small",
              showTotal: (total) => `Tổng cộng: ${total}`,
            }}
          />
        ) : (
          <OrderKanban
            data={data}
            loading={loading}
            idField="xe_key"
            customColumns={[
              { title: "Nháp", status: "NHAP" },
              { title: "Chờ duyệt", status: "CHO_DUYET" },
              { title: "Từ chối", status: "DA_TU_CHOI" },
            ]}
            onCardClick={handleEdit}
            renderCardBody={(record) => (
              <div
                className="card-body"
                style={{ fontSize: "12px", padding: "8px 0" }}
              >
                <div style={{ marginBottom: 4 }}>
                  <MotorcycleIcon style={{ marginRight: 6 }} />
                  <Typography.Text strong>{record.ten_loai}</Typography.Text>
                </div>
                <div style={{ marginBottom: 4, color: "#8c8c8c" }}>
                  Màu: {record.ten_mau}
                </div>
                <div style={{ marginBottom: 4 }}>
                  SK: {formatService.formatSoKhung(record.so_khung)}
                </div>
                <div style={{ marginBottom: 4 }}>
                  SM: {formatService.formatSoMay(record.so_may)}
                </div>
                {record.ly_do_tu_choi && record.trang_thai === "DA_TU_CHOI" && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 4,
                      background: "#fff1f0",
                      border: "1px solid #ffa39e",
                      borderRadius: 4,
                      color: "#cf1322",
                    }}
                  >
                    Lý do: {record.ly_do_tu_choi}
                  </div>
                )}
              </div>
            )}
          />
        )}
      </Card>

      {/* Edit Form Modal */}
      <Modal
        title="Chỉnh sửa thông tin xe"
        width={800}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <XeForm
          mode="edit"
          initialData={selectedXe}
          khoList={khoList}
          onSuccess={() => {
            setFormVisible(false);
            fetchData();
          }}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối phê duyệt"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        onOk={confirmReject}
        okText="Xác nhận từ chối"
        okType="danger"
        destroyOnHidden
      >
        <div style={{ marginBottom: 8 }}>Lý do từ chối:</div>
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối phê duyệt xe này..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default VehicleApprovalList;
