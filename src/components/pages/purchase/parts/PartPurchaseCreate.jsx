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
// import { LOAI_DON_HANG, LOAI_BEN } from "../../../../utils/constant";

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
        khachHangAPI.getNhaCungCap(),
        phuTungAPI.getAll(),
      ]);
      setKhoList(khoRes || []);
      const suppliers = (supRes.data || supRes || []).filter((s) => s.status);
      setSupplierList(suppliers);
      setPartList(partRes.data || partRes || []);
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
          updatedItem.thanh_tien =
            (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const handlePartChange = (key, ma_pt) => {
    const part = partList.find((p) => String(p.ma_pt) === String(ma_pt));
    const techSpecs = part?.thong_so_ky_thuat || {};

    const newItems = items.map((item) => {
      if (item.key === key) {
        return {
          ...item,
          ma_pt: ma_pt,
          ten_pt: part?.ten_phu_tung || part?.ten_pt || "",
          don_vi_tinh: part?.don_vi_tinh || "",
          don_gia: part?.don_gia_nhap || 0,
          thanh_tien: (part?.don_gia_nhap || 0) * (item.so_luong || 1),
          // Conversion fields
          don_vi_co_ban: part?.don_vi_tinh || "",
          don_vi_lon: techSpecs.don_vi_lon,
          ty_le_quy_doi: techSpecs.ty_le_quy_doi,
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
          "Vui lòng điền đầy đủ thông tin chi tiết (Phụ tùng, Số lượng > 0)",
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Step 1: Create Header
      const headerPayload = {
        ngay_dat_hang: values.ngay_dat_hang.format("YYYY-MM-DD"),
        ma_kho_nhap: values.ma_kho_nhap,
        ma_ncc: values.ma_ncc,
        dien_giai: values.dien_giai || "",
        vat_percentage: values.vat_percentage || 0,
        chiet_khau: values.chiet_khau || 0,
      };

      const res = await donHangAPI.create(headerPayload);
      const createdOrder = res.data || res;
      const ma_phieu = createdOrder.so_phieu || createdOrder.id; // Ensure we get ID/Code

      if (!ma_phieu) {
        throw new Error("Không lấy được mã phiếu sau khi tạo");
      }

      // Step 2: Add Items
      // We loop and add one by one (or Promise.all) as per guide "Endpoint: POST .../chi-tiet"
      // Assuming API handles one item per call or checking if it accepts array.
      // Guide says "Payload: { ma_pt... }" (Singular). So loop.

      const detailPromises = items.map(async (item) => {
        let finalQty = item.so_luong;
        let notes = "";
        // Simplify conversion logic for creation?
        // Guide says: "Payload: ... so_luong: 100 ...".
        // If we want to support inputting "Boxes", we should probably convert here OR send as is if backend supports unit.
        // Guide payload: "don_vi_tinh": "Cái".
        // If user selected "Box", we should probably convert to "Cái" here or send "Box" if we want to store PO as Box.
        // But guide "PartReceiveModal" implies PO has "PO Unit".
        // Let's send what user selected.

        const detailPayload = {
          ma_pt: item.ma_pt,
          ten_pt: item.ten_pt,
          don_vi_tinh: item.don_vi_tinh, // User selected unit
          so_luong: item.so_luong,
          don_gia: item.don_gia,
        };

        return donHangAPI.addChiTiet(ma_phieu, detailPayload);
      });

      await Promise.all(detailPromises);

      notificationService.success("Tạo đơn hàng mua phụ tùng thành công");
      navigate("/purchase/parts");
    } catch (error) {
      console.error(error);
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Phụ tùng",
      dataIndex: "ma_pt",
      width: 250,
      render: (text, record) => (
        <Select
          style={{ width: "100%" }}
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
      title: "ĐVT",
      dataIndex: "don_vi_tinh",
      width: 120,
      render: (val, record) => {
        if (record.don_vi_lon && record.ty_le_quy_doi) {
          return (
            <Select
              value={val}
              onChange={(v) => handleRowChange(record.key, "don_vi_tinh", v)}
              style={{ width: "100%" }}
            >
              <Option value={record.don_vi_co_ban}>
                {record.don_vi_co_ban}
              </Option>
              <Option value={record.don_vi_lon}>{record.don_vi_lon}</Option>
            </Select>
          );
        }
        return val;
      },
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      width: 120,
      render: (val, record) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(v) => handleRowChange(record.key, "so_luong", v)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      width: 150,
      render: (val, record) => (
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          value={val}
          onChange={(v) => handleRowChange(record.key, "don_gia", v)}
          addonAfter={
            record.don_vi_tinh === record.don_vi_lon && record.don_vi_lon
              ? `/${record.don_vi_lon}`
              : ""
          }
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      align: "right",
      width: 150,
      render: (val) => val?.toLocaleString("vi-VN"),
    },
    {
      title: "",
      key: "action",
      width: 50,
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
              onClick={() => navigate("/purchase/parts")}
            />
            <span>Tạo Mua Phụ Tùng</span>
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
                <h3 style={{ margin: 0 }}>Chi tiết phụ tùng</h3>
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
            <Space wrap>
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
