import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Space,
  message,
  Tag,
  Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import { useAuth } from "../../../contexts/AuthContext";
import { MASTER_DATA_CONFIG } from "../../../utils/masterDataConfig";
import { masterDataApi } from "../../../api/";

const MasterDataPage = () => {
  const { hasRole } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const canCreate = hasRole(["ADMIN", "MANAGER"]);
  const canDelete = hasRole(["ADMIN", "MANAGER"]);
  const canUpdate = hasRole(["ADMIN", "MANAGER"]);

  const { type } = useParams();
  const config = MASTER_DATA_CONFIG[type];
  console.log(config);
  if (!config) {
    return <div>Master data not found</div>;
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await masterDataApi.getAll(config.resource);
      setData(res.data || []);
    } catch {
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      ...record,
      loai_kho: record.chinh ? "CHINH" : "DAILY",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        chinh: values.loai_kho === "CHINH",
        daily: values.loai_kho === "DAILY",
      };

      delete payload.loai_kho;

      if (editingItem) {
        await masterDataApi.update(config.resource, editingItem.id, values);
        message.success("Cập nhật thành công");
      } else {
        await masterDataApi.create(config.resource, values);
        message.success("Tạo mới thành công");
      }

      setOpen(false);
      fetchData();
    } catch {
      message.error("Lưu dữ liệu thất bại");
    }
  };

  const handleDelete = async (id) => {
    try {
      await masterDataApi.remove(config.resource, id);
      message.success("Xóa thành công");
      fetchData();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  const columns = [
    ...config.columns.map((col) => ({
      title: col.label,
      dataIndex: col.key,
      render: col.render,
    })),
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) =>
        status === "ACTIVE" ? (
          <Tag color="green">ACTIVE</Tag>
        ) : (
          <Tag color="red">INACTIVE</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Space>
          {canUpdate && (
            <Button type="link" onClick={() => openEditModal(record)}>
              Sửa
            </Button>
          )}
          {canDelete && (
            <Button danger type="link" onClick={() => handleDelete(record.id)}>
              Xóa
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>{config.title}</h2>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm mới
          </Button>
        )}
      </Space>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        open={open}
        title={editingItem ? "Cập nhật" : "Thêm mới"}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {config.columns
            .filter((col) => col.key !== "id") // loại bỏ id khỏi form
            .map((col) => (
              <Form.Item
                key={col.key}
                name={col.key}
                label={col.label}
                rules={
                  col.required
                    ? [
                        {
                          required: true,
                          message: `Vui lòng nhập ${col.label}`,
                        },
                      ]
                    : []
                }
              >
                {col.type === "select" ? (
                  <Select options={col.options} />
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
        </Form>
      </Modal>
    </>
  );
};

export default MasterDataPage;
