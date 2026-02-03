import React, { useState } from "react";
import { Modal, Form, Input, Row, Col, Space, Button, DatePicker } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { khachHangAPI } from "../../../api";
import { notificationService } from "../../../services";

import { LOAI_DOI_TAC } from "../../../utils/constant";

const QuickAddCustomerModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        loai_doi_tac: LOAI_DOI_TAC.KHACH_HANG,
        ngay_sinh: values.ngay_sinh
          ? values.ngay_sinh.format("YYYY-MM-DD")
          : null,
      };

      const res = await khachHangAPI.create(payload);
      notificationService.success("Thêm khách hàng thành công");
      form.resetFields();
      onSuccess(res?.data || res || values);
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Không thể thêm khách hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined />
          <span>Khai báo khách hàng mới</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} size="small">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ho_ten"
              label="Họ tên"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Tên khách hàng" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dien_thoai"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập SĐT" },
                { pattern: /^[0-9]*$/, message: "Chỉ được nhập số" },
              ]}
            >
              <Input placeholder="0xxxxxxxxx" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ type: "email" }]}>
              <Input placeholder="email@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ngay_sinh" label="Ngày sinh">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="so_cmnd" label="CMND/CCCD">
              <Input placeholder="Số CMND/CCCD" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="dia_chi" label="Địa chỉ">
          <Input.TextArea rows={2} placeholder="Địa chỉ thường trú" />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Space>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Lưu & Chọn
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default QuickAddCustomerModal;
