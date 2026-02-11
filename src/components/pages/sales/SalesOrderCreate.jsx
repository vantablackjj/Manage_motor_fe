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
import { Divider, Table, Popconfirm } from "antd";
import {
  CarOutlined,
  ToolOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  orderAPI,
  khoAPI,
  khachHangAPI,
  xeAPI,
  phuTungAPI,
} from "../../../api";
import { notificationService } from "../../../services";
import { LOAI_DON_HANG, LOAI_BEN } from "../../../utils/constant";
import QuickAddCustomerModal from "../khachHang/QuickAddCustomerModal";

const { Option } = Select;

const SalesOrderCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [availableXe, setAvailableXe] = useState([]);
  const [availablePT, setAvailablePT] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);

  useEffect(() => {
    loadMasterData();
  }, []);

  const fetchStock = async (ma_kho) => {
    if (!ma_kho) return;
    try {
      const [xeRes, ptRes] = await Promise.all([
        xeAPI.getTonKho(ma_kho, { trang_thai: "TON_KHO" }),
        phuTungAPI.getTonKho(ma_kho),
      ]);
      setAvailableXe(xeRes.data || xeRes || []);
      setAvailablePT(ptRes.data || ptRes || []);
    } catch (error) {
      console.error("Lỗi tải tồn kho", error);
    }
  };

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

  const handleAddItem = () => {
    if (!form.getFieldValue("ma_kho_xuat")) {
      notificationService.warning("Vui lòng chọn kho xuất trước");
      return;
    }
    const newItem = {
      key: Date.now().toString(),
      loai_hang: "PHU_TUNG",
      so_luong: 1,
      don_gia: 0,
      thanh_tien: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (key) => {
    setItems(items.filter((i) => i.key !== key));
  };

  const handleRowChange = (key, field, value) => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: value };

        if (field === "loai_hang") {
          updatedItem.xe_key = null;
          updatedItem.ma_pt = null;
          updatedItem.ten_hang = "";
          updatedItem.don_gia = 0;
          updatedItem.so_luong = 1;
        }

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

  const handleProductChange = (key, value) => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        let updatedItem = { ...item };
        if (item.loai_hang === "XE") {
          const xe = availableXe.find((x) => x.xe_key === value);
          if (xe) {
            updatedItem.xe_key = xe.xe_key;
            updatedItem.ma_pt = null;
            updatedItem.ten_hang = `${xe.ten_loai} - ${xe.ten_mau} (${xe.so_khung})`;
            updatedItem.don_gia = xe.gia_ban || 0;
            updatedItem.so_luong = 1;
          }
        } else {
          const pt = availablePT.find((p) => p.ma_pt === value);
          if (pt) {
            updatedItem.ma_pt = pt.ma_pt;
            updatedItem.xe_key = null;
            updatedItem.ten_hang = pt.ten_pt;
            updatedItem.don_gia = pt.gia_ban || 0;
          }
        }
        updatedItem.thanh_tien =
          (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const totalBeforeVat = items.reduce(
    (sum, item) => sum + (item.thanh_tien || 0),
    0,
  );

  const onFinish = async (values, submitForApproval = false) => {
    if (items.length === 0) {
      notificationService.warning("Vui lòng thêm sản phẩm");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        loai_don_hang: LOAI_DON_HANG.BAN_HANG,
        ngay_dat_hang: values.ngay_ban.toISOString(),
        ma_ben_xuat: values.ma_kho_xuat,
        loai_ben_xuat: LOAI_BEN.KHO,
        ma_ben_nhap: values.ma_kh,
        loai_ben_nhap: LOAI_BEN.DOI_TAC,
        ghi_chu: values.ghi_chu || null,
        vat_percentage: values.vat_percentage || 0,
        chiet_khau: values.chiet_khau || 0,
        status: true,
      };

      const res = await orderAPI.create(payload);
      const orderId = res.data?.id || res.id;

      // Add Details
      await Promise.all(
        items.map((item) =>
          orderAPI.addDetail(orderId, {
            ma_hang_hoa: item.xe_key || item.ma_pt,
            don_gia: item.don_gia,
            so_luong_dat: item.so_luong,
            loai_hang: item.loai_hang,
            yeu_cau_dac_biet: item.xe_key
              ? { ma_serial_du_kien: item.xe_key }
              : {},
          }),
        ),
      );

      if (submitForApproval) {
        await orderAPI.updateStatus(orderId, "GUI_DUYET");
        notificationService.success("Đã tạo và gửi duyệt đơn hàng");
      } else {
        notificationService.success("Tạo đơn hàng thành công (Nháp)");
      }
      navigate(`/sales/orders/${orderId}`);
    } catch (error) {
      notificationService.error(error?.response?.data?.message || "Lỗi xử lý");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "loai_hang",
      width: 120,
      render: (val, record) => (
        <Select
          value={val}
          onChange={(v) => handleRowChange(record.key, "loai_hang", v)}
          style={{ width: "100%" }}
        >
          <Option value="XE">Xe</Option>
          <Option value="PHU_TUNG">Phụ tùng</Option>
        </Select>
      ),
    },
    {
      title: "Sản phẩm",
      key: "san_pham",
      render: (_, record) => (
        <Select
          showSearch
          placeholder="Chọn sản phẩm"
          style={{ width: "100%" }}
          value={record.xe_key || record.ma_pt}
          onChange={(v) => handleProductChange(record.key, v)}
          optionFilterProp="children"
        >
          {record.loai_hang === "XE"
            ? availableXe.map((x) => (
                <Option key={x.xe_key} value={x.xe_key}>
                  {x.ten_loai} - {x.ten_mau} ({x.so_khung})
                </Option>
              ))
            : availablePT.map((p) => (
                <Option key={p.ma_pt} value={p.ma_pt}>
                  {p.ten_pt} - Tồn: {p.so_luong_ton}
                </Option>
              ))}
        </Select>
      ),
    },
    {
      title: "SL",
      dataIndex: "so_luong",
      width: 100,
      render: (val, record) => (
        <InputNumber
          min={1}
          disabled={record.loai_hang === "XE"}
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
          value={val}
          onChange={(v) => handleRowChange(record.key, "don_gia", v)}
          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
          style={{ width: "100%" }}
          addonAfter="₫"
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      align: "right",
      width: 130,
      render: (v) => <b>{v?.toLocaleString()}</b>,
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
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
                <Select
                  placeholder="Chọn kho"
                  style={{ width: "100%" }}
                  onChange={(val) => {
                    fetchStock(val);
                    setItems([]); // Reset items if warehouse changes
                  }}
                >
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

          <Divider orientation="left">Chi tiết hàng hóa</Divider>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              onClick={handleAddItem}
              icon={<PlusOutlined />}
              block
              style={{ marginBottom: 16 }}
            >
              Thêm hàng hóa
            </Button>
            <Table
              dataSource={items}
              columns={columns}
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    <b>Tạm tính:</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <b>{totalBeforeVat.toLocaleString()} ₫</b>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </div>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space wrap>
              <Button onClick={() => navigate("/sales/orders")}>Hủy</Button>
              <Button
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() =>
                  form.validateFields().then((v) => onFinish(v, false))
                }
              >
                Lưu nháp
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={() =>
                  form.validateFields().then((v) => onFinish(v, true))
                }
              >
                Lưu và Gửi duyệt
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
