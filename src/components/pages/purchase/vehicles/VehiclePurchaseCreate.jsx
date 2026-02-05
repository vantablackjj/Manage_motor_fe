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
import {
  donHangMuaXeAPI,
  khoAPI,
  khachHangAPI,
  xeAPI,
  danhMucAPI,
} from "../../../../api";
import { notificationService } from "../../../../services";

const { Option } = Select;

const VehiclePurchaseCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [khoList, setKhoList] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [colors, setColors] = useState([]); // Or fetch per type if needed

  // Table Rows
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [khoRes, supRes, typeRes, colorRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getNhaCungCap(), // Use specific method
        danhMucAPI.modelCar.getAll(), // Changed from loaiHinh to modelCar
        danhMucAPI.color.getAll(),
      ]);
      setKhoList(Array.isArray(khoRes) ? khoRes : khoRes?.data || []);

      // Handle both { data: [...] } and [...] response formats
      const allCustomers = Array.isArray(supRes) ? supRes : supRes?.data || [];
      const suppliers = allCustomers.filter(
        (c) =>
          (c.loai_doi_tac === "NHA_CUNG_CAP" ||
            c.la_ncc === true ||
            c.la_ncc === "true") &&
          c.status !== false &&
          c.status !== "false",
      );
      setSupplierList(suppliers);

      // Robust loading for vehicles and colors
      setVehicleTypes(Array.isArray(typeRes) ? typeRes : typeRes?.data || []);
      setColors(Array.isArray(colorRes) ? colorRes : colorRes?.data || []);
    } catch (error) {
      console.error("Error loading master data", error);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      ma_loai_xe: null,
      mau_sac: null,
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

        // Auto-fill price when selecting vehicle type
        if (field === "ma_loai_xe") {
          const type = vehicleTypes.find((t) => t.ma_loai === value);
          if (type?.gia_nhap) {
            updatedItem.don_gia = Number(type.gia_nhap);
          }
        }

        if (
          field === "so_luong" ||
          field === "don_gia" ||
          field === "ma_loai_xe"
        ) {
          updatedItem.thanh_tien =
            (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const onFinish = async (values) => {
    if (items.length === 0) {
      notificationService.error("Vui lòng thêm ít nhất 1 xe");
      return;
    }

    // Validate items
    for (let item of items) {
      if (!item.ma_loai_xe || !item.mau_sac || item.so_luong <= 0) {
        notificationService.error(
          "Vui lòng điền đầy đủ thông tin chi tiết (Loại xe, Màu, Số lượng > 0)",
        );
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Explode items (Quantity N -> N rows of Quantity 1)
      const explodedItems = [];
      items.forEach((item) => {
        const qty = Number(item.so_luong);
        for (let i = 0; i < qty; i++) {
          explodedItems.push({
            ...item,
            so_luong: 1, // Force quantity to 1
          });
        }
      });

      // Atomic Create
      const payload = {
        ma_kho_nhap: values.ma_kho_nhap,
        ma_ncc: values.ma_ncc,
        ngay_dat_hang: values.ngay_dat_hang.toISOString(),
        dien_giai: values.dien_giai,
        vat_percentage: values.vat_percentage || 0,
        chiet_khau: values.chiet_khau || 0,
        chi_tiet: explodedItems.map((item) => ({
          ma_loai_xe: item.ma_loai_xe,
          ma_mau: item.mau_sac || null, // Ensure null if empty/undefined
          so_luong: 1, // Always 1
          don_gia: Number(item.don_gia),
        })),
      };

      console.log("Original Items:", items);
      console.log("Exploded Items:", explodedItems);
      console.log("Final Payload:", payload);

      await donHangMuaXeAPI.createWithDetails(payload);

      notificationService.success("Tạo đơn hàng thành công");
      navigate("/purchase/vehicles");
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Loại xe",
      dataIndex: "ma_loai_xe",
      render: (text, record) => (
        <Select
          style={{ width: 200 }}
          placeholder="Chọn loại xe"
          value={text}
          onChange={(val) => handleRowChange(record.key, "ma_loai_xe", val)}
          showSearch
          optionFilterProp="children"
        >
          {vehicleTypes.map((t) => (
            <Option key={t.ma_loai} value={t.ma_loai}>
              {t.ten_loai}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Màu sắc",
      dataIndex: "mau_sac",
      render: (text, record) => (
        <Select
          style={{ width: 120 }}
          placeholder="Màu"
          value={text}
          onChange={(val) => handleRowChange(record.key, "mau_sac", val)}
          showSearch
          optionFilterProp="children"
        >
          {colors.map((c) => (
            <Option key={c.ma_mau} value={c.ma_mau}>
              {c.ten_mau}
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
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase/vehicles")}
            />
            <span>Tạo Đơn Mua Xe</span>
          </Space>
        }
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            ngay_dat_hang: moment(),
            vat_percentage: 10,
            chiet_khau: 0,
          }}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ma_ncc"
                label="Nhà cung cấp"
                rules={[{ required: true, message: "Chọn nhà cung cấp" }]}
              >
                <Select
                  placeholder="Chọn NCC"
                  showSearch
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {supplierList.map((s) => (
                    <Option
                      key={s.ma_doi_tac || s.ma_kh}
                      value={s.ma_doi_tac || s.ma_kh}
                    >
                      {s.ten_doi_tac || s.ho_ten}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="ma_kho_nhap"
                label="Kho nhập"
                rules={[{ required: true, message: "Chọn kho nhập" }]}
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
                name="ngay_dat_hang"
                label="Ngày đặt hàng"
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

          <Form.Item label="Ghi chú" name="dien_giai">
            <Input.TextArea rows={2} />
          </Form.Item>

          {/* DETAILS TABLE */}
          <div style={{ marginBottom: 16 }}>
            <Row
              justify="space-between"
              align="middle"
              style={{ marginBottom: 8 }}
              gutter={[8, 8]}
            >
              <Col xs={24} sm={12}>
                <h3 style={{ margin: 0 }}>Chi tiết xe</h3>
              </Col>
              <Col xs={24} sm={12} style={{ textAlign: "right" }}>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  block
                >
                  Thêm dòng
                </Button>
              </Col>
            </Row>
            <Table
              dataSource={items}
              columns={columns}
              rowKey="key"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              locale={{ emptyText: "Chưa có dữ liệu" }}
              summary={(pageData) => {
                let totalAmt = 0;
                pageData.forEach(({ thanh_tien }) => {
                  totalAmt += thanh_tien;
                });
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
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
            <Space wrap>
              <Button onClick={() => navigate("/purchase/vehicles")}>
                Hủy
              </Button>
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

export default VehiclePurchaseCreate;
