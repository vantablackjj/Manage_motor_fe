import React, { useState } from "react";
import { Modal, Form, Input, message } from "antd";
import { danhMucAPI } from "../../../api";

const QuickAddBrandModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        ten_nh: values.ten_nh,
        ma_nhom_cha: "PT", // Parent category for Parts
      };

      const res = await danhMucAPI.brand.create(payload);
      if (res && res.success) {
        message.success("Thêm nhóm hàng thành công!");
        form.resetFields();
        onSuccess(res.data); // res.data contains the new object with ma_nh
        onClose();
      }
    } catch (error) {
      console.error(error);
      message.error(
        "Lỗi khi thêm nhóm hàng: " +
          (error?.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm nhanh nhóm hàng"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Tạo mới"
      cancelText="Hủy"
      width={400}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Tên nhóm"
          name="ten_nh"
          rules={[{ required: true, message: "Vui lòng nhập tên nhóm!" }]}
        >
          <Input placeholder="VD: Gương chiếu hậu" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuickAddBrandModal;
