import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Button,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { danhMucAPI } from "../../../api";
import QuickAddBrandModal from "./QuickAddBrandModal";

const PhuTungForm = ({ visible, onClose, onSubmit, initialValues, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [brandList, setBrandList] = useState([]);
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await danhMucAPI.brand.getAll({ ma_nhom_cha: "PT" });
      setBrandList(res || []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  };

  const handleQuickAddSuccess = (newBrand) => {
    setBrandList((prev) => [...prev, newBrand]);
    form.setFieldsValue({ nhom_pt: newBrand.ma_nh });
  };

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
    <>
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
            {mode === "edit" && (
              <Col span={12}>
                <Form.Item label="Mã phụ tùng" name="ma_pt">
                  <Input disabled />
                </Form.Item>
              </Col>
            )}

            <Col span={mode === "edit" ? 12 : 24}>
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

          <Form.Item label="Nhóm phụ tùng" required style={{ marginBottom: 0 }}>
            <Row gutter={8}>
              <Col flex="auto">
                <Form.Item
                  name="nhom_pt"
                  rules={[
                    { required: true, message: "Vui lòng chọn nhóm phụ tùng!" },
                  ]}
                >
                  <Select
                    placeholder="Chọn nhóm phụ tùng"
                    allowClear
                    notFoundContent={
                      brandList.length === 0
                        ? "Chưa có nhóm hàng nào. Vui lòng tạo nhóm mới"
                        : null
                    }
                  >
                    {brandList.map((brand) => (
                      <Select.Option key={brand.ma_nh} value={brand.ma_nh}>
                        {brand.ten_nh}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col flex="40px">
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setQuickAddVisible(true)}
                />
              </Col>
            </Row>
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

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.don_vi_lon !== currentValues.don_vi_lon
            }
          >
            {({ getFieldValue }) => (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Đơn vị quy đổi (Lớn)" name="don_vi_lon">
                    <Input placeholder="VD: Thùng, Hộp..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {getFieldValue("don_vi_lon") ? (
                    <Form.Item
                      label={`Tỷ lệ quy đổi (1 ${getFieldValue("don_vi_lon")} = ?)`}
                      name="ty_le_quy_doi"
                      rules={[
                        { required: true, message: "Vui lòng nhập tỷ lệ!" },
                        {
                          type: "number",
                          min: 1,
                          message: "Tỷ lệ phải lớn hơn 1!",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="VD: 24"
                      />
                    </Form.Item>
                  ) : null}
                </Col>
              </Row>
            )}
          </Form.Item>

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
      <QuickAddBrandModal
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSuccess={handleQuickAddSuccess}
      />
    </>
  );
};
export default PhuTungForm;
