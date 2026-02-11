// src/pages/hoaDon/HoaDonCreatePage.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  Table,
  InputNumber,
  Space,
  Row,
  Col,
  Modal,
  Radio,
  Divider,
  Alert,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  CarOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { hoaDonAPI, khoAPI, khachHangAPI, xeAPI, phuTungAPI } from "../../api";
import {
  formatService,
  notificationService,
  validationService,
  calculationService,
  storageService,
  authService,
} from "../../services";
import { LOAI_HANG } from "../../utils/constants";

const { Option } = Select;
const { TextArea } = Input;

const HoaDonCreatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [chiTiet, setChiTiet] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [khachHangList, setKhachHangList] = useState([]);

  // Products data
  const [xeList, setXeList] = useState([]);
  const [phuTungList, setPhuTungList] = useState([]);

  useEffect(() => {
    fetchInitialData();
    loadDraft();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [khos, khs] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getKhachHang(),
      ]);

      setKhoList(khos || []);
      setKhachHangList(khs || []);

      const defaultKho = authService.getDefaultWarehouse();
      if (defaultKho) {
        form.setFieldsValue({ ma_kho_xuat: defaultKho });
        fetchXeAndPhuTung(defaultKho);
      }
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu");
    }
  };

  const fetchXeAndPhuTung = async (ma_kho) => {
    try {
      const [xes, pts] = await Promise.all([
        xeAPI.getTonKho(ma_kho, { trang_thai: "TON_KHO", locked: false }),
        phuTungAPI.getTonKho(ma_kho),
      ]);

      setXeList(xes.data || []);
      setPhuTungList(pts || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách hàng hóa");
    }
  };

  const handleKhoChange = (ma_kho) => {
    fetchXeAndPhuTung(ma_kho);
    // Clear chi tiet when change warehouse
    setChiTiet([]);
  };

  const loadDraft = () => {
    const draft = storageService.getDraft("hoa-don-create");
    if (draft) {
      form.setFieldsValue({
        ...draft,
        ngay_ban: draft.ngay_ban ? dayjs(draft.ngay_ban) : dayjs(),
      });
      setChiTiet(draft.chi_tiet || []);
    } else {
      form.setFieldsValue({ ngay_ban: dayjs() });
    }
  };

  const saveDraft = () => {
    const values = form.getFieldsValue();
    storageService.saveDraft("hoa-don-create", {
      ...values,
      chi_tiet: chiTiet,
    });
  };

  const handleAddItem = () => {
    if (!form.getFieldValue("ma_kho_xuat")) {
      notificationService.warning("Vui lòng chọn kho xuất trước");
      return;
    }
    const newItem = {
      key: Date.now().toString(),
      stt: chiTiet.length + 1,
      loai_hang: "PHU_TUNG",
      so_luong: 1,
      don_gia: 0,
      thanh_tien: 0,
    };
    setChiTiet([...chiTiet, newItem]);
  };

  const handleRowChange = (key, field, value) => {
    const newChiTiet = chiTiet.map((item) => {
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
    setChiTiet(newChiTiet);
    saveDraft();
  };

  const handleProductChange = (key, value) => {
    const newChiTiet = chiTiet.map((item) => {
      if (item.key === key) {
        let updatedItem = { ...item };
        if (item.loai_hang === "XE") {
          const xe = xeList.find((x) => x.xe_key === value);
          if (xe) {
            updatedItem.xe_key = xe.xe_key;
            updatedItem.ma_pt = null;
            updatedItem.ten_hang = `${xe.ten_loai} - ${xe.ten_mau} (${xe.so_khung})`;
            updatedItem.don_gia = xe.gia_ban || 0;
            updatedItem.so_luong = 1;
          }
        } else {
          const pt = phuTungList.find((p) => p.ma_pt === value);
          if (pt) {
            updatedItem.ma_pt = pt.ma_pt;
            updatedItem.xe_key = null;
            updatedItem.ten_hang = `${pt.ten_pt} (${pt.don_vi_tinh})`;
            updatedItem.don_gia = pt.gia_ban || 0;
          }
        }
        updatedItem.thanh_tien =
          (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);
        return updatedItem;
      }
      return item;
    });
    setChiTiet(newChiTiet);
    saveDraft();
  };

  const handleDeleteItem = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa ${record.ten_hang}?`,
      onOk: () => {
        const newChiTiet = chiTiet.filter((item) => item.key !== record.key);
        const reindexed = newChiTiet.map((item, index) => ({
          ...item,
          stt: index + 1,
        }));
        setChiTiet(reindexed);
        saveDraft();
      },
    });
  };

  const calculateTotals = () => {
    const subtotal = calculationService.calculateSubtotal(chiTiet);
    const chietKhau = form.getFieldValue("chiet_khau") || 0;
    const vat = form.getFieldValue("vat") || 0;

    const chietKhauAmount = calculationService.calculateDiscount(
      subtotal,
      0,
      chietKhau,
    );
    const afterDiscount = subtotal - chietKhauAmount;
    const vatAmount = calculationService.calculateVAT(afterDiscount, vat);
    const total = afterDiscount + vatAmount;

    return { subtotal, chietKhauAmount, vatAmount, total };
  };

  const handleSubmit = async (values) => {
    const chiTietValidation = validationService.validateChiTiet(chiTiet);
    if (!chiTietValidation.isValid) {
      notificationService.error(chiTietValidation.message);
      return;
    }

    setSubmitting(true);
    try {
      const { total } = calculateTotals();

      const data = {
        ...values,
        ngay_ban: values.ngay_ban.format("YYYY-MM-DD"),
        thanh_toan: total,
        chi_tiet: chiTiet.map((item) => ({
          loai_hang: item.loai_hang,
          xe_key: item.xe_key,
          ma_pt: item.ma_pt,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
        })),
      };

      await hoaDonAPI.create(data);
      notificationService.createSuccess("hóa đơn");
      storageService.removeDraft("hoa-don-create");
      navigate("/hoa-don");
    } catch (error) {
      notificationService.createError("hóa đơn", error);
    } finally {
      setSubmitting(false);
    }
  };

  const chiTietColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 60,
      align: "center",
    },
    {
      title: "Loại",
      dataIndex: "loai_hang",
      key: "loai_hang",
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
      title: "Hàng hóa",
      key: "hang_hoa",
      render: (_, record) => (
        <Select
          showSearch
          placeholder="Chọn hàng hóa"
          style={{ width: "100%" }}
          value={record.xe_key || record.ma_pt}
          onChange={(v) => handleProductChange(record.key, v)}
          optionFilterProp="children"
        >
          {record.loai_hang === "XE"
            ? xeList.map((x) => (
                <Option key={x.xe_key} value={x.xe_key}>
                  {x.ten_loai} - {x.ten_mau} ({x.so_khung})
                </Option>
              ))
            : phuTungList.map((p) => (
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
      key: "so_luong",
      width: 100,
      align: "right",
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
      key: "don_gia",
      width: 150,
      align: "right",
      render: (val, record) => (
        <InputNumber
          min={0}
          value={val}
          onChange={(v) => handleRowChange(record.key, "don_gia", v)}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          style={{ width: "100%" }}
          addonAfter="₫"
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      key: "thanh_tien",
      width: 150,
      align: "right",
      render: (text) => <strong>{formatService.formatCurrency(text)}</strong>,
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(record)}
        />
      ),
    },
  ];

  const { subtotal, chietKhauAmount, vatAmount, total } = calculateTotals();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FileTextOutlined /> Tạo hóa đơn bán
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Tạo hóa đơn bán xe và phụ tùng
          </p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/hoa-don")}
        >
          Quay lại
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={saveDraft}
      >
        <Card title="Thông tin hóa đơn" style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ma_kho_xuat"
                label="Kho xuất"
                rules={[{ required: true, message: "Vui lòng chọn kho" }]}
              >
                <Select placeholder="Chọn kho" onChange={handleKhoChange}>
                  {khoList.map((kho) => (
                    <Option key={kho.ma_kho} value={kho.ma_kho}>
                      {kho.ten_kho}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="ma_kh"
                label="Khách hàng"
                rules={[
                  { required: true, message: "Vui lòng chọn khách hàng" },
                ]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  showSearch
                  optionFilterProp="children"
                >
                  {khachHangList.map((kh) => (
                    <Option key={kh.ma_kh} value={kh.ma_kh}>
                      {kh.ho_ten} - {kh.dien_thoai}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="ngay_ban"
                label="Ngày bán"
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="chiet_khau" label="Chiết khấu" initialValue={0}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="₫"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="vat" label="VAT (%)" initialValue={0}>
                <InputNumber style={{ width: "100%" }} min={0} max={100} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="ghi_chu" label="Ghi chú">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          title="Chi tiết hóa đơn"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
              disabled={!form.getFieldValue("ma_kho_xuat")}
            >
              Thêm hàng
            </Button>
          }
          style={{ marginBottom: "16px" }}
        >
          {!form.getFieldValue("ma_kho_xuat") && (
            <Alert
              message="Vui lòng chọn kho xuất trước"
              type="warning"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}

          <Table
            dataSource={chiTiet}
            columns={chiTietColumns}
            rowKey="key"
            pagination={false}
            scroll={{ x: 800 }}
            locale={{ emptyText: "Chưa có hàng hóa" }}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    Tạm tính:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    {formatService.formatCurrency(subtotal)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} />
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    Chiết khấu:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    -{formatService.formatCurrency(chietKhauAmount)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} />
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    VAT:
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    {formatService.formatCurrency(vatAmount)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} />
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <strong style={{ fontSize: "16px" }}>
                      TỔNG THANH TOÁN:
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      {formatService.formatCurrency(total)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        <Card>
          <Space>
            <Button onClick={() => navigate("/hoa-don")}>Hủy</Button>
            <Button icon={<SaveOutlined />} onClick={saveDraft}>
              Lưu nháp
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              Lưu hóa đơn
            </Button>
          </Space>
        </Card>
      </Form>

      {/* Modal removed for inline entry */}
    </div>
  );
};

export default HoaDonCreatePage;
