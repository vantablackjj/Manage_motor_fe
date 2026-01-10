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
  Radio,
} from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { thuChiAPI, khoAPI, khachHangAPI } from "../../../api";
import { notificationService, formatService } from "../../../services";
import { LOAI_THU_CHI } from "../../../utils/constant";

const { Option } = Select;

const ThuChiCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [khoList, setKhoList] = useState([]);
  const [partners, setPartners] = useState([]);

  // Get default type from URL query param
  const defaultLoai = searchParams.get("loai") || LOAI_THU_CHI.THU;

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
      setPartners(khRes.data || khRes || []); // Handle different API response structures
    } catch (error) {
      console.error("Error loading master data", error);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        ngay_giao_dich: values.ngay_giao_dich.format("YYYY-MM-DD"),
      };

      const res = await thuChiAPI.create(payload);
      if (res.success) {
        notificationService.success("Tạo phiếu thành công");
        const so_phieu = res.data?.so_phieu;
        navigate(`/thu-chi/${so_phieu}`);
      }
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo phiếu thu chi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/thu-chi")}
            />
            <span>Tạo Phiếu Thu / Chi</span>
          </Space>
        }
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            loai: defaultLoai,
            ngay_giao_dich: dayjs(),
          }}
        >
          <Row gutter={[16, 0]}>
            <Col span={24}>
              <Form.Item
                name="loai"
                label="Loại giao dịch"
                rules={[{ required: true }]}
              >
                <Radio.Group
                  buttonStyle="solid"
                  style={{ width: "100%", display: "flex" }}
                >
                  <Radio.Button
                    value={LOAI_THU_CHI.THU}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Phiếu Thu
                  </Radio.Button>
                  <Radio.Button
                    value={LOAI_THU_CHI.CHI}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Phiếu Chi
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="so_phieu"
                label="Số phiếu"
                tooltip="Số phiếu sẽ được hệ thống tự động tạo sau khi lưu"
              >
                <Input placeholder="Tự động tạo..." disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ngay_giao_dich"
                label="Ngày giao dịch"
                rules={[{ required: true, message: "Chọn ngày giao dịch" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ma_kho"
                label="Kho"
                rules={[{ required: true, message: "Chọn kho" }]}
              >
                <Select placeholder="Chọn kho">
                  {khoList.map((k) => (
                    <Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="ma_kh"
                label="Khách hàng / Nhà cung cấp"
                rules={[{ required: true, message: "Chọn đối tác" }]}
              >
                <Select
                  placeholder="Chọn đối tác"
                  showSearch
                  optionFilterProp="children"
                >
                  {partners.map((p) => (
                    <Option key={p.ma_kh} value={p.ma_kh}>
                      {p.ho_ten} ({p.ma_kh})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="so_tien"
                label="Số tiền (VNĐ)"
                rules={[
                  { required: true, message: "Nhập số tiền" },
                  { type: "number", min: 1, message: "Số tiền phải lớn hơn 0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  placeholder="Nhập số tiền"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Diễn giải" name="dien_giai">
            <Input.TextArea rows={4} placeholder="Nhập diễn giải..." />
          </Form.Item>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space wrap>
              <Button onClick={() => navigate("/thu-chi")}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu phiếu
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ThuChiCreate;
