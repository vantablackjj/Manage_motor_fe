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
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { xeAPI, khoAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import { TRANG_THAI_COLORS, TRANG_THAI_LABELS } from "../../../utils/constant";
import XeForm from "./XeForm";

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

  // Modal states
  const [formVisible, setFormVisible] = useState(false);
  const [selectedXe, setSelectedXe] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchKhoList();
    fetchData();
  }, [filters]);

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
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.xe_key}</Typography.Text>
          <Typography.Text type="secondary" size="small">
            {record.ten_loai} - {record.ten_mau}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Số khung / Số máy",
      key: "numbers",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text small>
            {formatService.formatSoKhung(record.so_khung)}
          </Typography.Text>
          <Typography.Text type="secondary" small>
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
        <Space direction="vertical" size={0}>
          <Typography.Text small>
            {record.nguoi_tao_ten || record.created_by}
          </Typography.Text>
          <Typography.Text type="secondary" small>
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
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <Space>
                <CheckCircleOutlined />
                Phê duyệt xe nhập lẻ
              </Space>
            </Title>
          </Col>
          <Col>
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
              <Option value="NHAP">Nháp</Option>
              <Option value="CHO_DUYET">Chờ duyệt</Option>
              <Option value="DA_TU_CHOI">Từ chối</Option>
            </Select>
          </Col>
        </Row>

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
      </Card>

      {/* Edit Form Modal */}
      <Modal
        title="Chỉnh sửa thông tin xe"
        width={800}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnClose
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
        destroyOnClose
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
