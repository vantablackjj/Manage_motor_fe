import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  DatePicker,
  Descriptions,
  Row,
  Col,
} from "antd";
import { UploadOutlined, DollarOutlined } from "@ant-design/icons";
import { congNoAPI, khoAPI } from "../../../api";
import { notificationService, formatService } from "../../../services";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const PartnerThanhToanModal = ({ visible, onCancel, onSuccess, initData }) => {
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
          ma_doi_tac: initData.ma_doi_tac || initData.ma_kh,
          loai_cong_no: initData.loai_cong_no,
          so_tien: initData.con_lai,
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
    setLoading(true);
    try {
      const payload = {
        ...values,
        ma_doi_tac: values.ma_doi_tac || initData?.ma_doi_tac || initData?.ma_kh,
        loai_cong_no: values.loai_cong_no || initData?.loai_cong_no,
      };
      // Call NEW API create partner payment
      await congNoAPI.createThanhToanDoiTac(payload);
      notificationService.success("Đã tạo phiếu thanh toán công nợ đối tác");
      onSuccess();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo thanh toán",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thanh toán Công nợ Đối tác"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={600}
    >
      {initData && (
        <Descriptions
          bordered
          column={1}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="Đối tác">
            <b>{initData.ho_ten}</b> ({initData.ma_doi_tac || initData.ma_kh})
          </Descriptions.Item>
          <Descriptions.Item label="Loại công nợ">
            {initData.loai_cong_no === "PHAI_THU"
              ? "Khách nợ (Phải thu)"
              : "Nợ NCC (Phải trả)"}
          </Descriptions.Item>
          <Descriptions.Item label="Dư nợ hiện tại">
            <b
              style={{
                color: initData.loai_cong_no === "PHAI_THU" ? "green" : "red",
              }}
            >
              {formatService.formatCurrency(initData.con_lai)}
            </b>
          </Descriptions.Item>
        </Descriptions>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          hinh_thuc: "TIEN_MAT",
        }}
      >
        <Form.Item name="ma_doi_tac" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="loai_cong_no" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="ma_kho"
              label="Kho thực hiện"
              rules={[{ required: true, message: "Chọn kho" }]}
            >
              <Select placeholder="Chọn kho phát sinh giao dịch">
                {khoList.map((k) => (
                  <Option key={k.ma_kho} value={k.ma_kho}>
                    {k.ten_kho}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="so_tien"
              label="Số tiền thanh toán"
              rules={[
                { required: true, message: "Nhập số tiền" },
                {
                  type: "number",
                  min: 1000,
                  message: "Tối thiểu 1.000đ",
                  transform: (value) => (value ? Number(value) : 0),
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                }
                parser={(value) => value.replace(/[^\d]/g, "")}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="hinh_thuc"
              label="Phương thức"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="TIEN_MAT">Tiền mặt</Option>
                <Option value="CHUYEN_KHOAN">Chuyển khoản</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* Optional: Reference Invoice */}
            <Form.Item name="ma_hoa_don" label="Mã hóa đơn (nếu có)">
              <Input placeholder="Ví dụ: HD2024..." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="dien_giai" label="Ghi chú">
          <TextArea
            rows={3}
            placeholder="Ví dụ: Trả nợ tiền xe, thanh toán tiền phụ tùng..."
          />
        </Form.Item>

        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<DollarOutlined />}
          >
            Tạo phiếu thanh toán
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default PartnerThanhToanModal;
