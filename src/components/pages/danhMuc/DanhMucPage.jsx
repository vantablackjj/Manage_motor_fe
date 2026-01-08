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
} from "antd";
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
    width: 120,
    fixed: "right",
    render: (_, record) => (
      <Space size="small">
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
            title="Xác nhận xóa?"
            onConfirm={() => handleDelete(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              Xóa
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <SettingOutlined /> Quản lý danh mục
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Quản lý danh mục cơ bản của hệ thống
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchTabData(activeTab)}
          >
            Làm mới
          </Button>
          {authService.canCreate() && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Thêm {getTitle()}
            </Button>
          )}
        </Space>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            fetchTabData(key);
          }}
        >
          <TabPane tab="Nhãn hiệu" key="brand">
            <Table
              dataSource={brandList}
              columns={brandColumns}
              rowKey="ma_nh"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Màu sắc" key="color">
            <Table
              dataSource={colorList}
              columns={colorColumns}
              rowKey="ma_mau"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Loại hình" key="loaiHinh">
            <Table
              dataSource={loaiHinhList}
              columns={loaiHinhColumns}
              rowKey="ma_lh"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Nơi sản xuất" key="noiSX">
            <Table
              dataSource={noiSXList}
              columns={noiSXColumns}
              rowKey="ma"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab="Model xe" key="model">
            <Table
              dataSource={modelList}
              columns={modelColumns}
              rowKey="ma_loai"
              loading={loading}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal Form */}
      <Modal
        title={`${editingRecord ? "Chỉnh sửa" : "Thêm"} ${getTitle()}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {getFormFields()}

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DanhMucPage;
