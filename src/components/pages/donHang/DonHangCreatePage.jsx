// src/pages/donHang/DonHangCreatePage.jsx
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
  Divider,
  Row,
  Col,
  Modal,
  Tag,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { donHangAPI, khoAPI, khachHangAPI, phuTungAPI } from "../../api";
import {
  formatService,
  notificationService,
  validationService,
  calculationService,
  storageService,
  authService,
} from "../../services";

const { Option } = Select;
const { TextArea } = Input;

const DonHangCreatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Chi tiết đơn hàng
  const [chiTiet, setChiTiet] = useState([]);
  const [editingKey, setEditingKey] = useState("");

  // Options
  const [khoList, setKhoList] = useState([]);
  const [nccList, setNccList] = useState([]);
  const [phuTungList, setPhuTungList] = useState([]);

  // Modal for adding items
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [selectedPhuTung, setSelectedPhuTung] = useState(null);

  useEffect(() => {
    fetchInitialData();
    loadDraft();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [khos, nccs, pts] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getNhaCungCap(),
        phuTungAPI.getAll(),
      ]);

      setKhoList(khos || []);
      setNccList(nccs || []);
      setPhuTungList(pts || []);

      // Set default kho
      const defaultKho = authService.getDefaultWarehouse();
      if (defaultKho) {
        form.setFieldsValue({ ma_kho_nhap: defaultKho });
      }
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = () => {
    const draft = storageService.getDraft("don-hang-create");
    if (draft) {
      form.setFieldsValue({
        ...draft,
        ngay_dat_hang: draft.ngay_dat_hang
          ? dayjs(draft.ngay_dat_hang)
          : dayjs(),
      });
      setChiTiet(draft.chi_tiet || []);
    } else {
      form.setFieldsValue({
        ngay_dat_hang: dayjs(),
      });
    }
  };

  const saveDraft = () => {
    const values = form.getFieldsValue();
    storageService.saveDraft("don-hang-create", {
      ...values,
      chi_tiet: chiTiet,
    });
  };

  const handleValuesChange = () => {
    saveDraft();
  };

  const handleAddItem = () => {
    setAddItemVisible(true);
  };

  const handleSelectPhuTung = (value) => {
    const pt = phuTungList.find((p) => p.ma_pt === value);
    setSelectedPhuTung(pt);
  };

  const handleConfirmAddItem = (values) => {
    const pt = phuTungList.find((p) => p.ma_pt === values.ma_pt);

    // Check if item already exists
    const existingIndex = chiTiet.findIndex(
      (item) => item.ma_pt === values.ma_pt
    );

    const newItem = {
      key:
        existingIndex >= 0 ? chiTiet[existingIndex].key : Date.now().toString(),
      stt: existingIndex >= 0 ? chiTiet[existingIndex].stt : chiTiet.length + 1,
      ma_pt: pt.ma_pt,
      ten_pt: pt.ten_pt,
      don_vi_tinh: pt.don_vi_tinh,
      so_luong: values.so_luong,
      don_gia: values.don_gia || pt.gia_nhap,
      thanh_tien: values.so_luong * (values.don_gia || pt.gia_nhap),
    };

    if (existingIndex >= 0) {
      // Update existing item
      const newChiTiet = [...chiTiet];
      newChiTiet[existingIndex] = newItem;
      setChiTiet(newChiTiet);
    } else {
      // Add new item
      setChiTiet([...chiTiet, newItem]);
    }

    setAddItemVisible(false);
    setSelectedPhuTung(null);
    saveDraft();
  };

  const handleDeleteItem = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc muốn xóa ${record.ten_pt}?`,
      onOk: () => {
        const newChiTiet = chiTiet.filter((item) => item.key !== record.key);
        // Re-index stt
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
    const vat = form.getFieldValue("vat") || 0;
    const vatAmount = calculationService.calculateVAT(subtotal, vat);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  };

  const handleSubmit = async (values) => {
    // Validate chi tiet
    const chiTietValidation = validationService.validateChiTiet(chiTiet);
    if (!chiTietValidation.isValid) {
      notificationService.error(
        chiTietValidation.message || chiTietValidation.errors[0]
      );
      return;
    }

    setSubmitting(true);
    try {
      const { total } = calculateTotals();

      const data = {
        ...values,
        ngay_dat_hang: values.ngay_dat_hang.format("YYYY-MM-DD"),
        tong_tien: total,
        chi_tiet: chiTiet.map((item) => ({
          ma_pt: item.ma_pt,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
        })),
      };

      await donHangAPI.create(data);
      notificationService.createSuccess("đơn hàng");
      storageService.removeDraft("don-hang-create");
      navigate("/don-hang");
    } catch (error) {
      notificationService.createError("đơn hàng", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndSend = async () => {
    try {
      const values = await form.validateFields();
      await handleSubmit(values);
      // After create, send for approval
      // This would need the created order ID
    } catch (error) {
      console.error("Validation failed:", error);
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
      title: "Mã phụ tùng",
      dataIndex: "ma_pt",
      key: "ma_pt",
      width: 120,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "ten_pt",
      key: "ten_pt",
      ellipsis: true,
    },
    {
      title: "ĐVT",
      dataIndex: "don_vi_tinh",
      key: "don_vi_tinh",
      width: 80,
      align: "center",
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      key: "so_luong",
      width: 100,
      align: "right",
      render: (text) => formatService.formatNumber(text),
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
      title: "Thao tác",
      key: "action",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xóa">
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteItem(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShoppingCartOutlined /> Tạo đơn hàng mua
          </h1>
          <p style={{ color: "#8c8c8c", margin: 0 }}>
            Tạo đơn hàng mua phụ tùng mới
          </p>
        </div>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/don-hang")}
        >
          Quay lại
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        {/* Thông tin chung */}
        <Card title="Thông tin đơn hàng" style={{ marginBottom: "16px" }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="ma_kho_nhap"
                label="Kho nhập"
                rules={[{ required: true, message: "Vui lòng chọn kho nhập" }]}
              >
                <Select
                  placeholder="Chọn kho nhập"
                  showSearch
                  optionFilterProp="children"
                >
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
                name="ma_ncc"
                label="Nhà cung cấp"
                rules={[
                  { required: true, message: "Vui lòng chọn nhà cung cấp" },
                ]}
              >
                <Select
                  placeholder="Chọn nhà cung cấp"
                  showSearch
                  optionFilterProp="children"
                >
                  {nccList.map((ncc) => (
                    <Option key={ncc.ma_kh} value={ncc.ma_kh}>
                      {ncc.ho_ten} - {ncc.dien_thoai}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="ngay_dat_hang"
                label="Ngày đặt hàng"
                rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="vat" label="VAT (%)" initialValue={0}>
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  placeholder="Nhập VAT"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="dien_giai" label="Diễn giải">
                <TextArea rows={3} placeholder="Nhập ghi chú, diễn giải..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Chi tiết đơn hàng */}
        <Card
          title="Chi tiết đơn hàng"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddItem}
            >
              Thêm phụ tùng
            </Button>
          }
          style={{ marginBottom: "16px" }}
        >
          <Table
            dataSource={chiTiet}
            columns={chiTietColumns}
            rowKey="key"
            pagination={false}
            scroll={{ x: 900 }}
            locale={{ emptyText: "Chưa có phụ tùng nào" }}
            summary={() => (
              <Table.Summary>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={6} align="right">
                    <strong>Tạm tính:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <strong>{formatService.formatCurrency(subtotal)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} />
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={6} align="right">
                    <strong>VAT:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <strong>{formatService.formatCurrency(vatAmount)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} />
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={6} align="right">
                    <strong style={{ fontSize: "16px" }}>TỔNG CỘNG:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                      {formatService.formatCurrency(total)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Actions */}
        <Card>
          <Space>
            <Button onClick={() => navigate("/don-hang")}>Hủy</Button>
            <Button icon={<SaveOutlined />} onClick={() => saveDraft()}>
              Lưu nháp
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
            >
              Lưu đơn hàng
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSaveAndSend}
              loading={submitting}
            >
              Lưu và gửi duyệt
            </Button>
          </Space>
        </Card>
      </Form>

      {/* Modal thêm phụ tùng */}
      <Modal
        title="Thêm phụ tùng"
        open={addItemVisible}
        onCancel={() => {
          setAddItemVisible(false);
          setSelectedPhuTung(null);
        }}
        footer={null}
        width={600}
      >
        <Form layout="vertical" onFinish={handleConfirmAddItem}>
          <Form.Item
            name="ma_pt"
            label="Phụ tùng"
            rules={[{ required: true, message: "Vui lòng chọn phụ tùng" }]}
          >
            <Select
              placeholder="Chọn phụ tùng"
              showSearch
              optionFilterProp="children"
              onChange={handleSelectPhuTung}
            >
              {phuTungList.map((pt) => (
                <Option key={pt.ma_pt} value={pt.ma_pt}>
                  {pt.ma_pt} - {pt.ten_pt} ({pt.don_vi_tinh})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedPhuTung && (
            <div
              style={{
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "4px",
                marginBottom: "16px",
              }}
            >
              <p>
                <strong>Đơn vị tính:</strong> {selectedPhuTung.don_vi_tinh}
              </p>
              <p>
                <strong>Giá nhập gốc:</strong>{" "}
                {formatService.formatCurrency(selectedPhuTung.gia_nhap)}
              </p>
            </div>
          )}

          <Form.Item
            name="so_luong"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 1, message: "Số lượng phải lớn hơn 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Nhập số lượng"
            />
          </Form.Item>

          <Form.Item
            name="don_gia"
            label="Đơn giá"
            rules={[
              { required: true, message: "Vui lòng nhập đơn giá" },
              { type: "number", min: 0, message: "Đơn giá phải lớn hơn 0" },
            ]}
            initialValue={selectedPhuTung?.gia_nhap}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập đơn giá"
            />
          </Form.Item>

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

export default DonHangCreatePage;
