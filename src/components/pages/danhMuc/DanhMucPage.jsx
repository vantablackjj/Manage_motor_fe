// src/pages/danhMuc/DanhMucPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Tag,
  Card,
  ColorPicker,
  Row,
  Col,
} from "antd";
import { useResponsive } from "../../../hooks/useResponsive";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  ImportOutlined,
  ExportOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { danhMucAPI } from "../../../api";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";

const { TabPane } = Tabs;

const DanhMucPage = () => {
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path) => {
    if (path.includes("nhan-hieu")) return "brand";
    if (path.includes("mau-xe")) return "color";
    if (path.includes("loai-hinh")) return "loaiHinh";
    if (path.includes("noi-san-xuat")) return "noiSX";
    if (path.includes("model")) return "model";
    return "brand";
  };

  const getPathFromTab = (tab) => {
    switch (tab) {
      case "brand":
        return "/danh-muc/nhan-hieu";
      case "color":
        return "/danh-muc/mau-xe";
      case "loaiHinh":
        return "/danh-muc/loai-hinh";
      case "noiSX":
        return "/danh-muc/noi-san-xuat";
      case "model":
        return "/danh-muc/model";
      default:
        return "/danh-muc/nhan-hieu";
    }
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Data states
  const [brandList, setBrandList] = useState([]);
  const [colorList, setColorList] = useState([]);
  const [loaiHinhList, setLoaiHinhList] = useState([]);
  const [noiSXList, setNoiSXList] = useState([]);
  const [modelList, setModelList] = useState([]);

  useEffect(() => {
    const tab = getTabFromPath(location.pathname);
    setActiveTab(tab);
    fetchTabData(tab);
  }, [location.pathname]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = { status: "all" };
      const [brands, colors, loaiHinh, noiSX] = await Promise.all([
        danhMucAPI.brand.getAll(params),
        danhMucAPI.color.getAll(params),
        danhMucAPI.loaiHinh.getAll(params),
        danhMucAPI.noiSanXuat.getAll(params),
      ]);

      setBrandList(brands?.data || brands || []);
      setColorList(colors?.data || colors || []);
      setLoaiHinhList(loaiHinh?.data || loaiHinh || []);
      setNoiSXList(noiSX?.data || noiSX || []);
    } catch (error) {
      notificationService.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      let res;
      // Fetch all data (active & inactive) for Management Screen
      const params = { status: "all" };
      switch (tab) {
        case "brand":
          res = await danhMucAPI.brand.getAll(params);
          setBrandList(res?.data || res || []);
          break;
        case "color":
          res = await danhMucAPI.color.getAll(params);
          setColorList(res?.data || res || []);
          break;
        case "loaiHinh":
          res = await danhMucAPI.loaiHinh.getAll(params);
          setLoaiHinhList(res?.data || res || []);
          break;
        case "noiSX":
          res = await danhMucAPI.noiSanXuat.getAll(params);
          setNoiSXList(res?.data || res || []);
          break;
      }
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      switch (activeTab) {
        case "brand":
          await danhMucAPI.brand.delete(record.ma_nh);
          break;
        case "color":
          await danhMucAPI.color.delete(record.ma_mau);
          break;
        case "loaiHinh":
          await danhMucAPI.loaiHinh.delete(record.ma_lh);
          break;
        case "noiSX":
          await danhMucAPI.noiSanXuat.delete(record.ma);
          break;
        case "model":
          await danhMucAPI.modelCar.delete(record.ma_loai);
          break;
      }
      notificationService.success("Đã ngừng sử dụng");
      fetchTabData(activeTab);
    } catch (error) {
      notificationService.error("Có lỗi xảy ra");
    }
  };

  const handleRestore = async (record) => {
    try {
      const payload = { ...record, status: true };
      switch (activeTab) {
        case "brand":
          await danhMucAPI.brand.update(record.ma_nh, payload);
          break;
        case "color":
          await danhMucAPI.color.update(record.ma_mau, payload);
          break;
        case "loaiHinh":
          await danhMucAPI.loaiHinh.update(record.ma_lh, payload);
          break;
        case "noiSX":
          await danhMucAPI.noiSanXuat.update(record.ma, payload);
          break;
        case "model":
          await danhMucAPI.modelCar.update(record.ma_loai, payload);
          break;
      }
      notificationService.success("Khôi phục thành công");
      fetchTabData(activeTab);
    } catch (error) {
      notificationService.error("Không thể khôi phục");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        // Update
        switch (activeTab) {
          case "brand":
            await danhMucAPI.brand.update(editingRecord.ma_nh, values);
            break;
          case "color":
            await danhMucAPI.color.update(editingRecord.ma_mau, values);
            break;
          case "loaiHinh":
            await danhMucAPI.loaiHinh.update(editingRecord.ma_lh, values);
            break;
          case "noiSX":
            await danhMucAPI.noiSanXuat.update(editingRecord.ma, values);
            break;
          case "model":
            await danhMucAPI.modelCar.update(editingRecord.ma_loai, values);
            break;
        }
        notificationService.updateSuccess("danh mục");
      } else {
        // Create
        switch (activeTab) {
          case "brand":
            await danhMucAPI.brand.create(values);
            break;
          case "color":
            await danhMucAPI.color.create(values);
            break;
          case "loaiHinh":
            await danhMucAPI.loaiHinh.create(values);
            break;
          case "noiSX":
            await danhMucAPI.noiSanXuat.create(values);
            break;
          case "model":
            await danhMucAPI.modelCar.create(values);
            break;
        }
        notificationService.createSuccess("danh mục");
      }

      setModalVisible(false);
      form.resetFields();
      fetchTabData(activeTab);
    } catch (error) {
      notificationService.error("Không thể lưu danh mục");
    }
  };

  const getStatusColumn = () => ({
    title: "Trạng thái",
    dataIndex: "status",
    key: "status",
    width: 120,
    align: "center",
    render: (status) =>
      status === false ? (
        <Tag color="error">Ngừng sử dụng</Tag>
      ) : (
        <Tag color="success">Đang sử dụng</Tag>
      ),
  });

  // Common columns
  const getActionColumn = () => ({
    title: "Thao tác",
    key: "action",
    width: 100,
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
              />
            )}
            {authService.canDelete() && (
              <Popconfirm
                title="Ngừng sử dụng?"
                onConfirm={() => handleDelete(record)}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            )}
          </>
        ) : (
          <Popconfirm
            title="Khôi phục dữ liệu này?"
            onConfirm={() => handleRestore(record)}
            okText="Khôi phục"
            cancelText="Hủy"
          >
            <Button
              type="link"
              size="small"
              icon={<RollbackOutlined />}
              title="Khôi phục"
            >
              Phục hồi
            </Button>
          </Popconfirm>
        )}
      </Space>
    ),
  });

  // Brand columns
  const brandColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã nhãn hiệu",
      dataIndex: "ma_nh",
      key: "ma_nh",
      width: 150,
    },
    {
      title: "Tên nhãn hiệu",
      dataIndex: "ten_nh",
      key: "ten_nh",
    },
    getStatusColumn(),
    getActionColumn(),
  ];

  // Color columns
  const colorColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã màu",
      dataIndex: "ma_mau",
      key: "ma_mau",
      width: 120,
    },
    {
      title: "Tên màu",
      dataIndex: "ten_mau",
      key: "ten_mau",
      width: 150,
    },
    {
      title: "Mã màu (Hex)",
      dataIndex: "gia_tri",
      key: "gia_tri",
      width: 120,
      render: (text) => <Tag color={text}>{text}</Tag>,
    },
    {
      title: "Preview",
      dataIndex: "gia_tri",
      key: "preview",
      width: 80,
      render: (text) => (
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: text,
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
          }}
        />
      ),
    },
    getStatusColumn(),
    getActionColumn(),
  ];

  // Loại hình columns
  const loaiHinhColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã loại hình",
      dataIndex: "ma_lh",
      key: "ma_lh",
      width: 150,
    },
    {
      title: "Tên loại hình",
      dataIndex: "ten_lh",
      key: "ten_lh",
    },
    getStatusColumn(),
    getActionColumn(),
  ];

  // Nơi sản xuất columns
  const noiSXColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã",
      dataIndex: "ma",
      key: "ma",
      width: 150,
    },
    {
      title: "Tên nơi sản xuất",
      dataIndex: "ten_noi_sx",
      key: "ten_noi_sx",
    },
    getStatusColumn(),
    getActionColumn(),
  ];

  // Model columns
  const modelColumns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã loại",
      dataIndex: "ma_loai",
      key: "ma_loai",
      width: 120,
    },
    {
      title: "Tên loại xe",
      dataIndex: "ten_loai",
      key: "ten_loai",
    },
    {
      title: "Nhãn hiệu",
      dataIndex: "ten_nh",
      key: "ten_nh",
      width: 150,
    },
    {
      title: "Loại hình",
      dataIndex: "ten_lh",
      key: "ten_lh",
      width: 120,
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
      title: "Giá bán",
      dataIndex: "gia_ban",
      key: "gia_ban",
      width: 130,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
    },
    getStatusColumn(),
    getActionColumn(),
  ];

  const getFormFields = () => {
    switch (activeTab) {
      case "brand":
        return (
          <>
            <Form.Item
              name="ma_nh"
              label="Mã nhãn hiệu"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input disabled={!!editingRecord} />
            </Form.Item>
            <Form.Item
              name="ten_nh"
              label="Tên nhãn hiệu"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="VD: Honda, Yamaha, SYM..." />
            </Form.Item>
          </>
        );

      case "color":
        return (
          <>
            <Form.Item name="ma_mau" label="Mã màu">
              <Input disabled={!!editingRecord} />
            </Form.Item>
            <Form.Item
              name="ten_mau"
              label="Tên màu"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="VD: Đỏ, Xanh, Đen..." />
            </Form.Item>
            <Form.Item name="gia_tri" label="Mã màu Hex">
              <Input placeholder="#FF0000" />
            </Form.Item>
          </>
        );

      case "loaiHinh":
        return (
          <>
            <Form.Item
              name="ma_lh"
              label="Mã loại hình"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input disabled={!!editingRecord} />
            </Form.Item>
            <Form.Item
              name="ten_lh"
              label="Tên loại hình"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="VD: Xe số, Xe ga, Xe tay ga..." />
            </Form.Item>
          </>
        );

      case "noiSX":
        return (
          <>
            <Form.Item
              name="ma"
              label="Mã"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input disabled={!!editingRecord} />
            </Form.Item>
            <Form.Item
              name="ten_noi_sx"
              label="Tên nơi sản xuất"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="VD: Việt Nam, Nhật Bản, Thái Lan..." />
            </Form.Item>
          </>
        );

      case "model":
        return (
          <>
            <Form.Item
              name="ma_loai"
              label="Mã loại xe"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input
                disabled={!!editingRecord}
                placeholder="VD: WAVE_ALPHA, SH150I"
              />
            </Form.Item>
            <Form.Item
              name="ten_loai"
              label="Tên loại xe"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="VD: Wave Alpha, SH 150i" />
            </Form.Item>
            <Form.Item
              name="ma_nh"
              label="Nhãn hiệu"
              rules={[{ required: true, message: "Vui lòng chọn nhãn hiệu" }]}
            >
              <Input placeholder="Mã nhãn hiệu" />
            </Form.Item>
            <Form.Item name="loai_hinh" label="Loại hình">
              <Input placeholder="Mã loại hình" />
            </Form.Item>
            <Form.Item name="noi_sx" label="Nơi sản xuất">
              <Input placeholder="Mã nơi sản xuất" />
            </Form.Item>
            <Form.Item
              name="gia_nhap"
              label="Giá nhập"
              rules={[{ required: true, message: "Vui lòng nhập giá nhập" }]}
            >
              <Input type="number" placeholder="0" addonAfter="₫" />
            </Form.Item>
            <Form.Item
              name="gia_ban"
              label="Giá bán"
              rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
            >
              <Input type="number" placeholder="0" addonAfter="₫" />
            </Form.Item>
          </>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    const titles = {
      brand: "Nhãn hiệu",
      color: "Màu sắc",
      loaiHinh: "Loại hình xe",
      noiSX: "Nơi sản xuất",
    };
    return titles[activeTab] || "";
  };

  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <div style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[8, 16]}>
          <Col xs={24} sm={16}>
            <h1
              style={{ margin: 0, fontSize: isMobile ? "1.25rem" : "1.5rem" }}
            >
              <Space wrap>
                <SettingOutlined />
                <span>Danh mục</span>
              </Space>
            </h1>
          </Col>
          <Col
            xs={24}
            sm={8}
            style={{ textAlign: isMobile ? "left" : "right" }}
          >
            <Space wrap>
              <ImportButton
                module={
                  activeTab === "brand"
                    ? "brand"
                    : activeTab === "color"
                      ? "color"
                      : activeTab === "loaiHinh"
                        ? "loai-hinh"
                        : activeTab === "noiSX"
                          ? "noi-sx"
                          : activeTab === "model"
                            ? "model-car"
                            : ""
                }
                title={getTitle()}
                onSuccess={() => fetchTabData(activeTab)}
                size="small"
              />
              <ExportButton
                module={
                  activeTab === "brand"
                    ? "brand"
                    : activeTab === "color"
                      ? "color"
                      : activeTab === "loaiHinh"
                        ? "loai-hinh"
                        : activeTab === "noiSX"
                          ? "noi-sx"
                          : activeTab === "model"
                            ? "model-car"
                            : ""
                }
                title={getTitle()}
                size="small"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchTabData(activeTab)}
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
                  Thêm
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </div>

      <Card size="small">
        <Tabs
          activeKey={activeTab}
          size={isMobile ? "small" : "middle"}
          onChange={(key) => {
            navigate(getPathFromTab(key));
          }}
          items={[
            {
              key: "brand",
              label: "Nhãn hiệu",
              children: (
                <Table
                  dataSource={brandList}
                  columns={brandColumns}
                  rowKey="ma_nh"
                  loading={loading}
                  size="small"
                  scroll={{ x: 400 }}
                  pagination={{ pageSize: 10, size: "small" }}
                  rowClassName={(record) =>
                    record.status === false ? "inactive-row" : ""
                  }
                />
              ),
            },
            {
              key: "color",
              label: "Màu sắc",
              children: (
                <Table
                  dataSource={colorList}
                  columns={colorColumns}
                  rowKey="ma_mau"
                  loading={loading}
                  size="small"
                  scroll={{ x: 500 }}
                  pagination={{ pageSize: 10, size: "small" }}
                  rowClassName={(record) =>
                    record.status === false ? "inactive-row" : ""
                  }
                />
              ),
            },
            {
              key: "loaiHinh",
              label: "Loại hình",
              children: (
                <Table
                  dataSource={loaiHinhList}
                  columns={loaiHinhColumns}
                  rowKey="ma_lh"
                  loading={loading}
                  size="small"
                  scroll={{ x: 400 }}
                  pagination={{ pageSize: 10, size: "small" }}
                  rowClassName={(record) =>
                    record.status === false ? "inactive-row" : ""
                  }
                />
              ),
            },
            {
              key: "noiSX",
              label: "Nơi SX",
              children: (
                <Table
                  dataSource={noiSXList}
                  columns={noiSXColumns}
                  rowKey="ma"
                  loading={loading}
                  size="small"
                  scroll={{ x: 400 }}
                  pagination={{ pageSize: 10, size: "small" }}
                  rowClassName={(record) =>
                    record.status === false ? "inactive-row" : ""
                  }
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={`${editingRecord ? "Sửa" : "Thêm"} ${getTitle()}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? "100%" : 500}
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="small"
        >
          {getFormFields()}

          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)} block={isMobile}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" block={isMobile}>
                {editingRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
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

export default DanhMucPage;
