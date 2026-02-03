// src/components/pages/khachHang/KhachHangManage.jsx
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tag,
  Card,
  Tabs,
  Row,
  Col,
  DatePicker,
  Select,
  Checkbox,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  SearchOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { khachHangAPI } from "../../../api";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import { notificationService, authService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LOAI_DOI_TAC,
  LOAI_DOI_TAC_LABELS,
  LOAI_DOI_TAC_COLORS,
} from "../../../utils/constant";
import dayjs from "dayjs";

const KhachHangManage = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize based on URL or default to ALL
  const getTabFromUrl = () => {
    if (location.pathname.includes("nha-cung-cap"))
      return LOAI_DOI_TAC.NHA_CUNG_CAP;
    if (location.pathname.includes("khach-hang"))
      return LOAI_DOI_TAC.KHACH_HANG;
    if (location.pathname.includes("ca-hai")) return LOAI_DOI_TAC.CA_HAI;
    return "ALL";
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [loading, setLoading] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location.pathname]);

  useEffect(() => {
    fetchData();
  }, [activeTab, showDeleted]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchText,
        status: !showDeleted,
      };
      if (activeTab === LOAI_DOI_TAC.KHACH_HANG) {
        params.la_ncc = false;
      } else if (activeTab === LOAI_DOI_TAC.NHA_CUNG_CAP) {
        params.la_ncc = true;
      } else if (activeTab === LOAI_DOI_TAC.CA_HAI) {
        params.loai_doi_tac = LOAI_DOI_TAC.CA_HAI;
      }

      const response = await khachHangAPI.getAll(params);
      const allData = response?.data || response || [];
      setData(allData);
    } catch (error) {
      notificationService.error("Không thể tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    // Pre-fill roles based on current tab if not ALL
    if (activeTab === LOAI_DOI_TAC.KHACH_HANG) {
      form.setFieldsValue({ roles: ["KH"] });
    } else if (activeTab === LOAI_DOI_TAC.NHA_CUNG_CAP) {
      form.setFieldsValue({ roles: ["NCC"] });
    } else if (activeTab === LOAI_DOI_TAC.CA_HAI) {
      form.setFieldsValue({ roles: ["KH", "NCC"] });
    } else {
      form.setFieldsValue({ roles: ["KH"] });
    }
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    const roles = [];
    if (record.loai_doi_tac === LOAI_DOI_TAC.KHACH_HANG) roles.push("KH");
    else if (record.loai_doi_tac === LOAI_DOI_TAC.NHA_CUNG_CAP)
      roles.push("NCC");
    else if (record.loai_doi_tac === LOAI_DOI_TAC.CA_HAI)
      roles.push("KH", "NCC");

    form.setFieldsValue({
      ...record,
      roles,
      ngay_sinh: record.ngay_sinh ? dayjs(record.ngay_sinh) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (ma_kh) => {
    try {
      await khachHangAPI.delete(ma_kh);
      notificationService.success("Đã ngừng sử dụng");
      fetchData();
    } catch (error) {
      notificationService.error("Không thể ngừng sử dụng");
    }
  };

  const handleRestore = async (record) => {
    try {
      await khachHangAPI.update(record.ma_kh, { ...record, status: true });
      notificationService.success("Khôi phục thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Không thể khôi phục");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const { roles, ...rest } = values;
      let loai_doi_tac = LOAI_DOI_TAC.KHACH_HANG;
      if (roles?.includes("KH") && roles?.includes("NCC")) {
        loai_doi_tac = LOAI_DOI_TAC.CA_HAI;
      } else if (roles?.includes("NCC")) {
        loai_doi_tac = LOAI_DOI_TAC.NHA_CUNG_CAP;
      }

      const payload = {
        ...rest,
        loai_doi_tac,
        ngay_sinh: values.ngay_sinh
          ? values.ngay_sinh.format("YYYY-MM-DD")
          : null,
      };

      if (editingRecord) {
        await khachHangAPI.update(editingRecord.ma_kh, payload);
        notificationService.success("Cập nhật thành công");
      } else {
        await khachHangAPI.create(payload);
        notificationService.success("Tạo mới thành công");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Không thể lưu",
      );
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchText) return true;
    const search = searchText.toLowerCase();
    return (
      item.ho_ten?.toLowerCase().includes(search) ||
      item.dien_thoai?.toLowerCase().includes(search) ||
      item.ma_kh?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã đối tác",
      dataIndex: "ma_kh",
      key: "ma_kh",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Họ tên",
      dataIndex: "ho_ten",
      key: "ho_ten",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "loai_doi_tac",
      key: "loai_doi_tac",
      width: 130,
      render: (type) => (
        <Tag color={LOAI_DOI_TAC_COLORS[type] || "default"}>
          {LOAI_DOI_TAC_LABELS[type] || type}
        </Tag>
      ),
    },
    !isMobile && {
      title: "Điện thoại",
      dataIndex: "dien_thoai",
      key: "dien_thoai",
      width: 120,
    },
    !isMobile && {
      title: "Địa chỉ",
      dataIndex: "dia_chi",
      key: "dia_chi",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          {record.status !== false ? (
            <>
              {authService.canEdit() && (
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                >
                  Sửa
                </Button>
              )}
              {authService.canDelete() && (
                <Popconfirm
                  title="Xác nhận ngừng sử dụng?"
                  onConfirm={() => handleDelete(record.ma_kh)}
                >
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                  >
                    Ngừng sử dụng
                  </Button>
                </Popconfirm>
              )}
            </>
          ) : (
            <Popconfirm
              title="Khôi phục đối tác này?"
              onConfirm={() => handleRestore(record)}
            >
              <Button
                type="link"
                size="small"
                icon={<RollbackOutlined />}
                style={{ color: "#52c41a" }}
              >
                Phục hồi
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ].filter(Boolean);

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <Card size="small">
        <Row
          justify="space-between"
          align="middle"
          gutter={[8, 16]}
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} sm={12}>
            <h2
              style={{ margin: 0, fontSize: isMobile ? "1.25rem" : "1.5rem" }}
            >
              <Space>
                <UserOutlined />
                <span>Quản lý Đối tác</span>
              </Space>
            </h2>
          </Col>
          <Col
            xs={24}
            sm={12}
            style={{ textAlign: isMobile ? "left" : "right" }}
          >
            <Space wrap>
              <div style={{ marginRight: 16 }}>
                <span style={{ marginRight: 8, fontSize: "0.9rem" }}>
                  Hiển thị đã ngừng sử dụng
                </span>
                <Switch
                  size="small"
                  checked={showDeleted}
                  onChange={setShowDeleted}
                />
              </div>
              <ImportButton
                module="customer"
                title="Đối tác"
                onSuccess={fetchData}
                size="small"
              />
              <ExportButton
                module="customer"
                title="Đối tác"
                params={{
                  loai_doi_tac: activeTab !== "ALL" ? activeTab : undefined,
                }}
                size="small"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                size="small"
              >
                Tải lại
              </Button>
              {authService.canCreate() && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                  size="small"
                >
                  Thêm mới
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Tìm tên, SĐT, mã..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: "100%", maxWidth: 300 }}
            size="small"
          />
        </div>

        <Tabs
          activeKey={activeTab}
          size="small"
          onChange={(key) => {
            if (key === LOAI_DOI_TAC.NHA_CUNG_CAP)
              navigate("/danh-muc/nha-cung-cap");
            else if (key === LOAI_DOI_TAC.KHACH_HANG)
              navigate("/danh-muc/khach-hang");
            else if (key === LOAI_DOI_TAC.CA_HAI) navigate("/danh-muc/ca-hai");
            else navigate("/danh-muc/doi-tac");
          }}
          items={[
            { key: "ALL", label: "Tất cả" },
            { key: LOAI_DOI_TAC.KHACH_HANG, label: "Khách hàng" },
            { key: LOAI_DOI_TAC.NHA_CUNG_CAP, label: "Nhà cung cấp" },
            { key: LOAI_DOI_TAC.CA_HAI, label: "Cả hai" },
          ]}
        />

        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="ma_kh"
          loading={loading}
          scroll={{ x: 800 }}
          size="small"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng: ${total}`,
          }}
          rowClassName={(record) =>
            record.status === false ? "inactive-row" : ""
          }
        />
      </Card>

      <Modal
        title={editingRecord ? "Sửa đối tác" : "Thêm đối tác"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="small"
        >
          <Row gutter={16}>
            {!!editingRecord && (
              <Col span={12}>
                <Form.Item name="ma_kh" label="Mã đối tác">
                  <Input disabled />
                </Form.Item>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                name="roles"
                label="Vai trò đối tác"
                rules={[
                  { required: true, message: "Chọn ít nhất một vai trò" },
                ]}
                initialValue={["KH"]}
              >
                <Checkbox.Group>
                  <Space direction="horizontal">
                    <Checkbox value="KH">Khách hàng</Checkbox>
                    <Checkbox value="NCC">Nhà cung cấp</Checkbox>
                  </Space>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ho_ten"
                label="Họ tên"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dien_thoai" label="Điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ngay_sinh" label="Ngày sinh">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="ma_so_thue" label="Mã số thuế">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="so_cmnd" label="CMND/CCCD">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      <style>{`
        .inactive-row {
          background-color: #fafafa !important;
          color: #bfbfbf !important;
        }
        .inactive-row td {
          color: #bfbfbf !important;
        }
        .inactive-row .ant-tag {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default KhachHangManage;
