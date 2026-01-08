// src/components/pages/kho/KhoManage.jsx
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
  Select,
  Switch,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  HomeOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { khoAPI } from "../../../api";
import { notificationService, authService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;

const KhoManage = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await khoAPI.getAll();
      setData(response || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách kho");
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
    form.setFieldsValue({
      ...record,
      loai_kho: record.chinh ? "CHINH" : "DAILY",
    });
    setModalVisible(true);
  };

  const handleDelete = async (ma_kho) => {
    try {
      await khoAPI.delete(ma_kho);
      notificationService.success("Xóa kho thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Không thể xóa kho");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        chinh: values.loai_kho === "CHINH",
        daily: values.loai_kho === "DAILY",
      };
      delete payload.loai_kho;

      if (editingRecord) {
        await khoAPI.update(editingRecord.ma_kho, payload);
        notificationService.success("Cập nhật kho thành công");
      } else {
        await khoAPI.create(payload);
        notificationService.success("Tạo kho thành công");
      }

      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Không thể lưu kho"
      );
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã kho",
      dataIndex: "ma_kho",
      key: "ma_kho",
      width: 120,
      fixed: isMobile ? false : "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Tên kho",
      dataIndex: "ten_kho",
      key: "ten_kho",
      width: 200,
      ellipsis: true,
    },
    !isMobile && {
      title: "Địa chỉ",
      dataIndex: "dia_chi",
      key: "dia_chi",
      width: 250,
      ellipsis: true,
    },
    !isMobile && {
      title: "Điện thoại",
      dataIndex: "dien_thoai",
      key: "dien_thoai",
      width: 120,
    },
    {
      title: "Loại kho",
      key: "loai_kho",
      width: 120,
      render: (_, record) =>
        record.chinh ? (
          <Tag icon={<HomeOutlined />} color="blue">
            Kho chính
          </Tag>
        ) : (
          <Tag icon={<ShopOutlined />} color="green">
            Đại lý
          </Tag>
        ),
    },
    {
      title: "Mặc định",
      dataIndex: "mac_dinh",
      key: "mac_dinh",
      width: 100,
      align: "center",
      render: (val) => (val ? <Tag color="gold">Mặc định</Tag> : <Tag>-</Tag>),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
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
              title="Xác nhận xóa kho?"
              description="Bạn có chắc chắn muốn xóa kho này?"
              onConfirm={() => handleDelete(record.ma_kho)}
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
    },
  ].filter(Boolean);

  return (
    <div style={{ padding: "24px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <h2 style={{ margin: 0 }}>
                <HomeOutlined /> Quản lý kho
              </h2>
              <p style={{ color: "#8c8c8c", margin: "4px 0 0 0" }}>
                Quản lý danh sách kho hàng
              </p>
            </Col>
            <Col>
              <Space>
                <Button icon={<ReloadOutlined />} onClick={fetchData}>
                  Làm mới
                </Button>
                {authService.canCreate() && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Thêm kho
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="ma_kho"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kho`,
          }}
        />
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingRecord ? "Chỉnh sửa kho" : "Thêm kho mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="ma_kho"
            label="Mã kho"
            rules={[
              { required: true, message: "Vui lòng nhập mã kho" },
              { max: 50, message: "Mã kho tối đa 50 ký tự" },
            ]}
          >
            <Input placeholder="VD: KHO01, KHO_HN" disabled={!!editingRecord} />
          </Form.Item>

          <Form.Item
            name="ten_kho"
            label="Tên kho"
            rules={[
              { required: true, message: "Vui lòng nhập tên kho" },
              { max: 200, message: "Tên kho tối đa 200 ký tự" },
            ]}
          >
            <Input placeholder="VD: Kho Hà Nội, Kho Đại lý Cầu Giấy" />
          </Form.Item>

          <Form.Item
            name="loai_kho"
            label="Loại kho"
            rules={[{ required: true, message: "Vui lòng chọn loại kho" }]}
          >
            <Select placeholder="Chọn loại kho">
              <Option value="CHINH">
                <HomeOutlined /> Kho chính
              </Option>
              <Option value="DAILY">
                <ShopOutlined /> Đại lý
              </Option>
            </Select>
          </Form.Item>

          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input.TextArea
              rows={2}
              placeholder="Nhập địa chỉ kho"
              maxLength={500}
            />
          </Form.Item>

          <Form.Item name="dien_thoai" label="Điện thoại">
            <Input placeholder="VD: 0123456789" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="mac_dinh"
            label="Đặt làm kho mặc định"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm (nếu có)" />
          </Form.Item>

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

export default KhoManage;
