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
  InputNumber,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { orderAPI, khoAPI, khachHangAPI } from "../../../api";
import { notificationService } from "../../../services";
import { LOAI_DON_HANG, LOAI_BEN } from "../../../utils/constant";
import QuickAddCustomerModal from "../khachHang/QuickAddCustomerModal";
import { Divider } from "antd";

const { Option } = Select;

const SalesOrderCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [khoList, setKhoList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [khoRes, khRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getKhachHang(),
      ]);
      setKhoList(khoRes || []);
      const customers = (khRes.data || khRes || []).filter((c) => c.status);
      setCustomerList(customers);
    } catch (error) {
      console.error("Error loading master data", error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Chuẩn bị payload theo cấu trúc Unified ERP
      const payload = {
        loai_don_hang: LOAI_DON_HANG.BAN_HANG,
        ngay_dat_hang: values.ngay_ban.toISOString(),

        // Cấu trúc Đối thể đa hình (Polymorphic Entities)
        ma_ben_xuat: values.ma_kho_xuat,
        loai_ben_xuat: LOAI_BEN.KHO, // Kho xuất hàng

        ma_ben_nhap: values.ma_kh,
        loai_ben_nhap: LOAI_BEN.DOI_TAC, // Khách hàng nhận hàng

        ghi_chu: values.ghi_chu || null,
        vat_percentage: values.vat_percentage || 0,
        chiet_khau: values.chiet_khau || 0,
        status: true,
      };

      const res = await orderAPI.create(payload);
      const orderId = res.data?.id;

      notificationService.success("Tạo đơn hàng bán thành công");
      // Chuyển sang trang chi tiết để thêm Xe/Phụ tùng
      navigate(`/sales/orders/${orderId}`);
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo đơn hàng bán",
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
          initialValues={{
            ngay_ban: moment(),
            vat_percentage: 10,
            chiet_khau: 0,
          }}
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
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <div style={{ padding: "0 8px 4px" }}>
                        <Button
                          type="text"
                          block
                          icon={<PlusOutlined />}
                          onClick={() => setCustomerModalVisible(true)}
                          style={{ textAlign: "left" }}
                        >
                          Thêm khách hàng mới
                        </Button>
                      </div>
                    </>
                  )}
                >
                  {customerList.map((c) => (
                    <Option
                      key={c.ma_doi_tac || c.ma_kh}
                      value={c.ma_doi_tac || c.ma_kh}
                    >
                      {c.ten_doi_tac || c.ho_ten} - {c.dien_thoai}
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

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item name="vat_percentage" label="VAT (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="chiet_khau" label="Chiết khấu (VNĐ)">
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
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

      <QuickAddCustomerModal
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        onSuccess={(newCustomer) => {
          setCustomerModalVisible(false);
          loadMasterData();
          form.setFieldsValue({ ma_kh: newCustomer.ma_kh });
        }}
      />
    </div>
  );
};

export default SalesOrderCreate;
