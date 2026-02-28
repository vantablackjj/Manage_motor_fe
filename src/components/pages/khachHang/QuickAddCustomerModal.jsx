import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Space,
  Button,
  DatePicker,
  Select,
} from "antd";
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        size="small"
        initialValues={{ is_business: false }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="is_business" label="Loại khách hàng">
              <Select
                options={[
                  { label: "Cá nhân", value: false },
                  { label: "Doanh nghiệp", value: true },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.is_business !== currentValues.is_business
          }
        >
          {({ getFieldValue }) => {
            const isBusiness = getFieldValue("is_business");
            return (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="ho_ten"
                    label={
                      isBusiness ? "Tên công ty/doanh nghiệp" : "Họ tên cá nhân"
                    }
                    rules={[
                      {
                        required: true,
                        message: isBusiness
                          ? "Vui lòng nhập tên công ty"
                          : "Vui lòng nhập họ tên",
                      },
                    ]}
                  >
                    <Input
                      placeholder={
                        isBusiness ? "Công ty TNHH..." : "Nguyễn Văn A"
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="ma_so_thue"
                    label={isBusiness ? "Mã số thuế" : "Số CCCD/MST cá nhân"}
                    rules={[
                      {
                        required: isBusiness,
                        message: "Vui lòng nhập mã số thuế",
                      },
                      {
                        pattern: /^[0-9]{10,13}$/,
                        message: "Mã số thuế/CCCD không hợp lệ (10-13 số)",
                      },
                    ]}
                  >
                    <Input
                      placeholder={
                        isBusiness
                          ? "MST doanh nghiệp"
                          : "Số CCCD hoặc MST cá nhân"
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            );
          }}
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dien_thoai"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập SĐT" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ (10-11 số)",
                },
              ]}
            >
              <Input placeholder="0xxxxxxxxx" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Email không hợp lệ" }]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.is_business !== currentValues.is_business
          }
        >
          {({ getFieldValue }) => {
            const isBusiness = getFieldValue("is_business");
            return (
              <Row gutter={16}>
                <Col span={12}>
                  {!isBusiness ? (
                    <Form.Item name="ngay_sinh" label="Ngày sinh">
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày sinh"
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item name="dai_dien" label="Người đại diện">
                      <Input placeholder="Họ tên người đại diện" />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            );
          }}
        </Form.Item>

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
