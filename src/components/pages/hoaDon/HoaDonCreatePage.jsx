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

  // Modal states
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [loaiHangMoi, setLoaiHangMoi] = useState("PHU_TUNG");
  const [xeList, setXeList] = useState([]);
  const [phuTungList, setPhuTungList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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
    setAddItemVisible(true);
    setSelectedItem(null);
  };

  const handleSelectItem = (value, loaiHang) => {
    if (loaiHang === "XE") {
      const xe = xeList.find((x) => x.xe_key === value);
      setSelectedItem(xe);
    } else {
      const pt = phuTungList.find((p) => p.ma_pt === value);
      setSelectedItem(pt);
    }
  };

  const handleConfirmAddItem = (values) => {
    const newItem = {
      key: Date.now().toString(),
      stt: chiTiet.length + 1,
      loai_hang: loaiHangMoi,
      so_luong: values.so_luong || 1,
      don_gia: values.don_gia,
      thanh_tien: (values.so_luong || 1) * values.don_gia,
    };

    if (loaiHangMoi === "XE") {
      const xe = xeList.find((x) => x.xe_key === values.xe_key);
      newItem.xe_key = xe.xe_key;
      newItem.ten_hang = `${xe.ten_loai} - ${xe.ten_mau} (${xe.so_khung})`;
      newItem.so_luong = 1;
    } else {
      const pt = phuTungList.find((p) => p.ma_pt === values.ma_pt);
      newItem.ma_pt = pt.ma_pt;
      newItem.ten_hang = `${pt.ten_pt} (${pt.don_vi_tinh})`;
    }

    setChiTiet([...chiTiet, newItem]);
    setAddItemVisible(false);
    setSelectedItem(null);
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
      chietKhau
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
      width: 100,
      render: (text) =>
        text === "XE" ? (
          <span>
            <CarOutlined /> Xe
          </span>
        ) : (
          <span>
            <ToolOutlined /> Phụ tùng
          </span>
        ),
    },
    {
      title: "Tên hàng",
      dataIndex: "ten_hang",
      key: "ten_hang",
      ellipsis: true,
    },
    {
      title: "SL",
      dataIndex: "so_luong",
      key: "so_luong",
      width: 80,
      align: "right",
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      key: "don_gia",
      width: 130,
      align: "right",
      render: (text) => formatService.formatCurrency(text),
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

      {/* Modal Add Item */}
      <Modal
        title="Thêm hàng hóa"
        open={addItemVisible}
        onCancel={() => setAddItemVisible(false)}
        footer={null}
        width={600}
      >
        <Radio.Group
          value={loaiHangMoi}
          onChange={(e) => setLoaiHangMoi(e.target.value)}
          style={{ marginBottom: "16px" }}
        >
          <Radio value="XE">Xe</Radio>
          <Radio value="PHU_TUNG">Phụ tùng</Radio>
        </Radio.Group>

        <Form layout="vertical" onFinish={handleConfirmAddItem}>
          {loaiHangMoi === "XE" ? (
            <>
              <Form.Item
                name="xe_key"
                label="Chọn xe"
                rules={[{ required: true, message: "Vui lòng chọn xe" }]}
              >
                <Select
                  placeholder="Chọn xe"
                  showSearch
                  onChange={(value) => handleSelectItem(value, "XE")}
                >
                  {xeList.map((xe) => (
                    <Option key={xe.xe_key} value={xe.xe_key}>
                      {xe.ten_loai} - {xe.ten_mau} ({xe.so_khung})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedItem && (
                <div
                  style={{
                    padding: "12px",
                    background: "#f5f5f5",
                    borderRadius: "4px",
                    marginBottom: "16px",
                  }}
                >
                  <p>
                    <strong>Giá bán:</strong>{" "}
                    {formatService.formatCurrency(selectedItem.gia_ban)}
                  </p>
                </div>
              )}

              <Form.Item
                name="don_gia"
                label="Đơn giá bán"
                rules={[{ required: true }]}
                initialValue={selectedItem?.gia_ban}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="₫"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="ma_pt"
                label="Chọn phụ tùng"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn phụ tùng"
                  showSearch
                  onChange={(value) => handleSelectItem(value, "PHU_TUNG")}
                >
                  {phuTungList.map((pt) => (
                    <Option key={pt.ma_pt} value={pt.ma_pt}>
                      {pt.ten_pt} - Tồn: {pt.so_luong_ton}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="so_luong"
                label="Số lượng"
                rules={[{ required: true }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  max={selectedItem?.so_luong_ton}
                />
              </Form.Item>

              <Form.Item
                name="don_gia"
                label="Đơn giá"
                rules={[{ required: true }]}
                initialValue={selectedItem?.gia_ban}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  addonAfter="₫"
                />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => setAddItemVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HoaDonCreatePage;
