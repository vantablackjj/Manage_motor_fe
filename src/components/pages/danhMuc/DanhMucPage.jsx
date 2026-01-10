// src/pages/danhMuc/DanhMucPage.jsx
import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import { danhMucAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";

const { TabPane } = Tabs;

const DanhMucPage = () => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState("brand");
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
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [brands, colors, loaiHinh, noiSX, models] = await Promise.all([
        danhMucAPI.brand.getAll(),
        danhMucAPI.color.getAll(),
        danhMucAPI.loaiHinh.getAll(),
        danhMucAPI.noiSanXuat.getAll(),
        danhMucAPI.modelCar.getAll(),
      ]);

      setBrandList(brands || []);
      setColorList(colors || []);
      setLoaiHinhList(loaiHinh || []);
      setNoiSXList(noiSX || []);
      setModelList(models || []);
    } catch (error) {
      notificationService.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab) => {
    setLoading(true);
    try {
      let data;
      switch (tab) {
        case "brand":
          data = await danhMucAPI.brand.getAll();
          setBrandList(data || []);
          break;
        case "color":
          data = await danhMucAPI.color.getAll();
          setColorList(data || []);
          break;
        case "loaiHinh":
          data = await danhMucAPI.loaiHinh.getAll();
          setLoaiHinhList(data || []);
          break;
        case "noiSX":
          data = await danhMucAPI.noiSanXuat.getAll();
          setNoiSXList(data || []);
          break;
        case "model":
          data = await danhMucAPI.modelCar.getAll();
          setModelList(data || []);
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
      notificationService.deleteSuccess("danh mục");
      fetchTabData(activeTab);
    } catch (error) {
      notificationService.deleteError("danh mục", error);
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

  // Common columns
  const getActionColumn = () => ({
    title: "Thao tác",
    key: "action",
    width: 100,
    fixed: "right",
    render: (_, record) => (
      <Space size="small">
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
            title="Xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
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
            <Form.Item
              name="ma_mau"
              label="Mã màu"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input disabled={!!editingRecord} />
            </Form.Item>
            <Form.Item
              name="ten_mau"
              label="Tên màu"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="VD: Đỏ, Xanh, Đen..." />
            </Form.Item>
            <Form.Item
              name="gia_tri"
              label="Mã màu Hex"
              rules={[
                { required: true, message: "Vui lòng nhập mã màu" },
                {
                  pattern: /^#[0-9A-Fa-f]{6}$/,
                  message: "Mã màu không hợp lệ (VD: #FF0000)",
                },
              ]}
            >
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
      model: "Model xe",
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
            setActiveTab(key);
            fetchTabData(key);
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
                />
              ),
            },
            {
              key: "model",
              label: "Model xe",
              children: (
                <Table
                  dataSource={modelList}
                  columns={modelColumns}
                  rowKey="ma_loai"
                  loading={loading}
                  size="small"
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 10, size: "small" }}
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
    </div>
  );
};

export default DanhMucPage;
