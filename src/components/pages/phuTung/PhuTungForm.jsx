import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Select, Row, Col } from "antd";

const PhuTungForm = ({ visible, onClose, onSubmit, initialValues, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, mode, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Validate Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={mode === "create" ? "Thêm phụ tùng mới" : "Cập nhật phụ tùng"}
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText={mode === "create" ? "Tạo mới" : "Cập nhật"}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          don_vi_tinh: "Cái",
          vat: 10,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Mã phụ tùng"
              name="ma_pt"
              rules={[
                { required: true, message: "Vui lòng nhập mã phụ tùng!" },
                { max: 50, message: "Mã không quá 50 ký tự!" },
              ]}
            >
              <Input placeholder="VD: PT001" disabled={mode === "edit"} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Đơn vị tính"
              name="don_vi_tinh"
              rules={[{ required: true, message: "Vui lòng chọn đơn vị!" }]}
            >
              <Select placeholder="Chọn đơn vị">
                <Select.Option value="Cái">Cái</Select.Option>
                <Select.Option value="Bộ">Bộ</Select.Option>
                <Select.Option value="Chiếc">Chiếc</Select.Option>
                <Select.Option value="Hộp">Hộp</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Tên phụ tùng"
          name="ten_pt"
          rules={[
            { required: true, message: "Vui lòng nhập tên phụ tùng!" },
            { max: 200, message: "Tên không quá 200 ký tự!" },
          ]}
        >
          <Input placeholder="VD: Lọc gió AirBlade" />
        </Form.Item>

        <Form.Item label="Nhóm phụ tùng" name="nhom_pt">
          <Select placeholder="Chọn nhóm phụ tùng" allowClear>
            <Select.Option value="Động cơ">Động cơ</Select.Option>
            <Select.Option value="Phanh">Phanh</Select.Option>
            <Select.Option value="Điện">Điện</Select.Option>
            <Select.Option value="Truyền động">Truyền động</Select.Option>
            <Select.Option value="Khác">Khác</Select.Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Giá nhập"
              name="gia_nhap"
              rules={[
                { required: true, message: "Vui lòng nhập giá nhập!" },
                { type: "number", min: 0, message: "Giá phải >= 0!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="0"
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Giá bán"
              name="gia_ban"
              rules={[
                { required: true, message: "Vui lòng nhập giá bán!" },
                { type: "number", min: 0, message: "Giá phải >= 0!" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="0"
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="VAT (%)" name="vat">
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            max={100}
            placeholder="10"
          />
        </Form.Item>

        <Form.Item label="Ghi chú" name="ghi_chu">
          <Input.TextArea rows={3} placeholder="Ghi chú về phụ tùng..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default PhuTungForm;
