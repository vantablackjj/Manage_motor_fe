import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  InputNumber,
  Row,
  Col,
  Space,
  Input,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { donHangAPI, khoAPI, khachHangAPI, phuTungAPI } from "../../../../api";
import { notificationService } from "../../../../services";

const { Option } = Select;

const PartPurchaseCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [khoList, setKhoList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [partList, setPartList] = useState([]);

  // Table Rows
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [khoRes, supRes, partRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll(), // Fetch all, filter manually
        phuTungAPI.getAll(), // Fetch parts
      ]);
      setKhoList(khoRes || []);

      const allCustomers = supRes.data || [];
      const suppliers = allCustomers.filter((c) => c.la_ncc === true);
      setSupplierList(suppliers);

      setPartList(partRes.data || []);
    } catch (error) {
      console.error("Error loading master data", error);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      ma_pt: null,
      ten_pt: "",
      don_vi_tinh: "",
      so_luong: 1,
      don_gia: 0,
      thanh_tien: 0,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleRowChange = (key, field, value) => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };
        if (field === "so_luong" || field === "don_gia") {
          updatedItem.thanh_tien = updatedItem.so_luong * updatedItem.don_gia;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const handlePartChange = (key, ma_pt) => {
    const part = partList.find((p) => String(p.ma_pt) === String(ma_pt));
    const newItems = items.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          ma_pt: ma_pt,
          ten_pt: part?.ten_phu_tung || "",
          don_vi_tinh: part?.don_vi_tinh || "",
          // Optional: set default price if available
          // don_gia: part?.don_gia_nhap || 0,
        };
      }
      return item;
    });
    setItems(newItems);
  };

  const onFinish = async (values) => {
    if (items.length === 0) {
      notificationService.error("Vui lòng thêm ít nhất 1 phụ tùng");
      return;
    }

    // Validate items
    for (let item of items) {
      if (!item.ma_pt || item.so_luong <= 0) {
        notificationService.error(
          "Vui lòng điền đầy đủ thông tin chi tiết (Phụ tùng, Số lượng > 0)"
        );
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create Header
      const payload = {
        ...values,
        ngay_dat_hang: values.ngay_dat_hang.toISOString(),
        tong_tien: items.reduce((acc, curr) => acc + curr.thanh_tien, 0),
      };

      const res = await donHangAPI.create(payload);
      const so_phieu = res.data?.so_phieu;

      // 2. Add Details
      // Note: donHangAPI usually adds detail one by one or in batch.
      // Based on donHang.api.js: addChiTiet takes (ma_phieu, data)
      const detailPromises = items.map((item) => {
        // Fallback lookup to ensure ten_pt and don_vi_tinh are present
        const part = partList.find(
          (p) => String(p.ma_pt) === String(item.ma_pt)
        );
        const finalName = item.ten_pt || part?.ten_phu_tung || "Unknown";
        const finalUnit = item.don_vi_tinh || part?.don_vi_tinh || "Cái";

        return donHangAPI.addChiTiet(so_phieu, {
          ma_pt: item.ma_pt,
          ten_pt: finalName,
          don_vi_tinh: finalUnit,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
          thanh_tien: item.thanh_tien,
        });
      });

      await Promise.all(detailPromises);

      notificationService.success("Tạo đơn hàng thành công");
      navigate("/purchase/parts");
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Phụ tùng",
      dataIndex: "ma_pt",
      render: (text, record) => (
        <Select
          style={{ width: 300 }}
          placeholder="Chọn phụ tùng"
          value={text}
          onChange={(val) => handlePartChange(record.key, val)}
          showSearch
          optionFilterProp="children"
        >
          {partList.map((p) => (
            <Option key={p.ma_pt} value={p.ma_pt}>
              {p.ten_phu_tung} ({p.ma_pt})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      render: (val, record) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(v) => handleRowChange(record.key, "so_luong", v)}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      render: (val, record) => (
        <InputNumber
          min={0}
          style={{ width: 150 }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          value={val}
          onChange={(v) => handleRowChange(record.key, "don_gia", v)}
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      align: "right",
      render: (val) => val?.toLocaleString("vi-VN"),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase/parts")}
            />
            <span>Tạo Đơn Mua Phụ Tùng</span>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ ngay_dat_hang: moment() }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="ma_ncc"
                label="Nhà cung cấp"
                rules={[{ required: true, message: "Chọn nhà cung cấp" }]}
              >
                <Select
                  placeholder="Chọn NCC"
                  showSearch
                  optionFilterProp="children"
                >
                  {supplierList.map((s) => (
                    <Option key={s.ma_kh} value={s.ma_kh}>
                      {s.ho_ten}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ma_kho_nhap"
                label="Kho nhập"
                rules={[{ required: true, message: "Chọn kho nhập" }]}
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
            <Col span={8}>
              <Form.Item
                name="ngay_dat_hang"
                label="Ngày đặt hàng"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="dien_giai">
            <Input.TextArea rows={2} />
          </Form.Item>

          {/* DETAILS TABLE */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <h3>Chi tiết phụ tùng</h3>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
              >
                Thêm dòng
              </Button>
            </div>
            <Table
              dataSource={items}
              columns={columns}
              rowKey="key"
              pagination={false}
              locale={{ emptyText: "Chưa có dữ liệu" }}
              summary={(pageData) => {
                let totalAmt = 0;
                pageData.forEach(({ thanh_tien }) => {
                  totalAmt += thanh_tien;
                });
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3} align="right">
                      <strong>Tổng cộng:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>{totalAmt.toLocaleString("vi-VN")}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} />
                  </Table.Summary.Row>
                );
              }}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => navigate("/purchase/parts")}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Lưu đơn hàng
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default PartPurchaseCreate;
