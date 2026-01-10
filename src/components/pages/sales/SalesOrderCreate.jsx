import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  Input,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { hoaDonBanAPI, khoAPI, khachHangAPI } from "../../../api";
import { notificationService } from "../../../services";

const { Option } = Select;

const SalesOrderCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [khoList, setKhoList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [khoRes, khRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll(),
      ]);
      setKhoList(khoRes || []);

      const allCustomers = khRes.data || [];
      const customers = allCustomers.filter((c) => !c.la_ncc);
      setCustomerList(customers);
    } catch (error) {
      console.error("Error loading master data", error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        ngay_ban: values.ngay_ban.format("YYYY-MM-DD"),
      };

      const res = await hoaDonBanAPI.create(payload);
      const so_hd = res.data?.so_hd;

      notificationService.success("Tạo hóa đơn thành công");
      navigate(`/sales/orders/${so_hd}`);
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo hóa đơn"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/sales/orders")}
            />
            <span>Tạo Bán Hàng</span>
          </Space>
        }
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ ngay_ban: moment() }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ma_kh"
                label="Khách hàng"
                rules={[{ required: true, message: "Chọn khách hàng" }]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {customerList.map((c) => (
                    <Option key={c.ma_kh} value={c.ma_kh}>
                      {c.ho_ten}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ma_kho_xuat"
                label="Kho xuất"
                rules={[{ required: true, message: "Chọn kho xuất" }]}
              >
                <Select placeholder="Chọn kho" style={{ width: "100%" }}>
                  {khoList.map((k) => (
                    <Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ngay_ban"
                label="Ngày bán"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="ghi_chu">
            <Input.TextArea rows={2} />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space wrap>
              <Button onClick={() => navigate("/sales/orders")}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Tiếp tục
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SalesOrderCreate;
