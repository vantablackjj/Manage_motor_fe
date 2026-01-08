import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Upload,
  Button,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { congNoAPI, khoAPI } from "../../../api";
import { notificationService } from "../../../services";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const ThanhToanModal = ({ visible, onCancel, onSuccess, initData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [khoList, setKhoList] = useState([]);

  useEffect(() => {
    fetchKhoList();
  }, []);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (initData) {
        form.setFieldsValue({
          ma_kho_tra: initData.ma_kho_tra,
          ma_kho_nhan: initData.ma_kho_nhan,
          // so_tien: initData.so_tien_no > 0 ? initData.so_tien_no : 0
        });
      }
    }
  }, [visible, initData]);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {
      console.error("Error fetching warehouses", error);
    }
  };

  const onFinish = async (values) => {
    const remaining = initData?.so_tien_no || 0;
    if (values.so_tien > remaining) {
      notificationService.error("Số tiền thanh toán vượt quá số nợ còn lại!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        ngay_thanh_toan: values.ngay_thanh_toan
          ? values.ngay_thanh_toan.toISOString()
          : moment().toISOString(),
      };
      // Call API create payment
      await congNoAPI.createThanhToan(payload);
      notificationService.success("Thanh toán thành công");
      onSuccess();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo thanh toán"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thanh toán Công Nợ"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      {initData && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "#fff1f0",
            border: "1px solid #ffa39e",
            borderRadius: 4,
          }}
        >
          <div>
            <strong>Kho Nợ (Trả):</strong>{" "}
            {khoList.find((k) => k.ma_kho === initData.ma_kho_tra)?.ten_kho}
          </div>
          <div>
            <strong>Kho Có (Nhận):</strong>{" "}
            {khoList.find((k) => k.ma_kho === initData.ma_kho_nhan)?.ten_kho}
          </div>
          <div style={{ marginTop: 8, fontSize: 16 }}>
            Tổng nợ còn lại:{" "}
            <span style={{ color: "red", fontWeight: "bold" }}>
              {initData.so_tien_no?.toLocaleString("vi-VN")} ₫
            </span>
          </div>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          ngay_thanh_toan: moment(),
          phuong_thuc: "CHUYEN_KHOAN",
        }}
      >
        <Form.Item name="ma_kho_tra" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="ma_kho_nhan" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="so_tien"
          label="Số tiền thanh toán"
          rules={[
            { required: true, message: "Nhập số tiền" },
            { type: "number", min: 1000, message: "Số tiền không hợp lệ" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            min={0}
            max={initData?.so_tien_no}
          />
        </Form.Item>

        <Form.Item
          name="ngay_thanh_toan"
          label="Ngày thanh toán"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" showTime />
        </Form.Item>

        <Form.Item name="phuong_thuc" label="Phương thức">
          <Select>
            <Option value="TIEN_MAT">Tiền mặt</Option>
            <Option value="CHUYEN_KHOAN">Chuyển khoản</Option>
          </Select>
        </Form.Item>

        <Form.Item name="dien_giai" label="Ghi chú">
          <TextArea rows={3} />
        </Form.Item>

        <div style={{ textAlign: "right" }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Thanh toán
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ThanhToanModal;
