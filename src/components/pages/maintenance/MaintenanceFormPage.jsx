// src/components/pages/maintenance/MaintenanceFormPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  InputNumber,
  Row,
  Col,
  Space,
  Input,
  Tooltip,
  Divider,
  Badge,
  Alert,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  CarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  maintenanceAPI,
  xeAPI,
  khachHangAPI,
  phuTungAPI,
  userAPI,
  productsAPI,
} from "../../../api";
import { notificationService, formatService } from "../../../services";
import { LOAI_BAO_TRI, LOAI_BAO_TRI_LABELS } from "../../../utils/constant";

const { Option } = Select;

const MaintenanceFormPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchingXe, setSearchingXe] = useState(false);
  const [xeList, setXeList] = useState([]);
  const [phuTungList, setPhuTungList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [productList, setProductList] = useState([]); // For external vehicle product selection
  const [partnerList, setPartnerList] = useState([]); // For external vehicle partner selection

  // Extra state for vehicle identification
  const [isExternal, setIsExternal] = useState(false);
  const [warrantyInfo, setWarrantyInfo] = useState(null);

  // Table Rows (Chi tiết bảo trì)
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [ptRes, userRes, prodRes, partnerRes] = await Promise.all([
        phuTungAPI.getAll({ limit: 100 }),
        userAPI.getAllUsers(),
        productsAPI.getAll({ type: "XE", limit: 50 }),
        khachHangAPI.getAll({ limit: 100 }),
      ]);
      setPhuTungList(ptRes?.data?.data || ptRes?.data || []);
      setUserList(userRes?.data || []);
      setProductList(prodRes?.data?.data || prodRes?.data || []);
      setPartnerList(partnerRes?.data?.data || partnerRes?.data || []);
    } catch (error) {
      console.error("Error loading master data", error);
    }
  };

  const handleSearchXe = async (value) => {
    if (!value || value.length < 3) return;
    setSearchingXe(true);
    try {
      const res = await xeAPI.getAll({ search: value, limit: 10 });
      setXeList(res.data?.data || []);
    } catch (error) {
      console.error("Error searching vehicle", error);
    } finally {
      setSearchingXe(false);
    }
  };

  const onSelectXe = async (value) => {
    // If user picks from list, it's a known vehicle
    const xe = xeList.find((x) => x.ma_serial === value);
    if (xe) {
      setIsExternal(false);
      // Try fetching detail for warranty info
      try {
        const detail = await xeAPI.getDetail(value);
        const fullXe = detail.data || detail;
        setWarrantyInfo(fullXe.warranty || null);

        form.setFieldsValue({
          ma_doi_tac: fullXe.ma_doi_tac,
          so_km_hien_tai: fullXe.so_km_hien_tai || 0,
          loai_bao_tri: fullXe.warranty?.is_eligible
            ? LOAI_BAO_TRI.MIEN_PHI
            : LOAI_BAO_TRI.TINH_PHI,
        });

        if (fullXe.warranty?.is_eligible) {
          notificationService.info("Xe cửa hàng - Trong hạn bảo trì miễn phí");
        }
      } catch (err) {
        form.setFieldsValue({
          ma_doi_tac: xe.ma_doi_tac,
          so_km_hien_tai: xe.so_km_hien_tai || 0,
        });
      }
    }
  };

  const detectExternalVehicle = () => {
    const serial = form.getFieldValue("ma_serial");
    if (!serial) {
      notificationService.warning("Vui lòng nhập số khung/số máy trước");
      return;
    }

    // If not in list, assume external
    const exists = xeList.some((x) => x.ma_serial === serial);
    if (!exists) {
      setIsExternal(true);
      setWarrantyInfo(null);
      form.setFieldsValue({
        ma_doi_tac: null,
        loai_bao_tri: LOAI_BAO_TRI.TINH_PHI,
      });
      notificationService.info("Đã chuyển sang chế độ khai báo Xe Ngoài");
    } else {
      onSelectXe(serial);
    }
  };

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      loai_hang_muc: "PHU_TUNG",
      ma_hang_hoa: null,
      ten_hang_muc: "",
      so_luong: 1,
      don_gia: 0,
      thanh_tien: 0,
      ghi_chu: "",
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleRowChange = (key, field, value) => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        let updatedItem = { ...item, [field]: value };

        // Nếu chọn phụ tùng từ danh mục
        if (
          field === "ma_hang_hoa" &&
          updatedItem.loai_hang_muc === "PHU_TUNG"
        ) {
          const pt = phuTungList.find((p) => p.ma_pt === value);
          if (pt) {
            updatedItem.ten_hang_muc = pt.ten_pt;
            updatedItem.don_gia = pt.gia_ban || 0;
          }
        }

        if (field === "loai_hang_muc" && value === "DICH_VU") {
          updatedItem.ma_hang_hoa = null;
          // If maintenance type is MIEN_PHI, labor fee is 0
          if (form.getFieldValue("loai_bao_tri") === LOAI_BAO_TRI.MIEN_PHI) {
            updatedItem.don_gia = 0;
          }
        }

        // Tính thành tiền
        if (
          field === "so_luong" ||
          field === "don_gia" ||
          field === "ma_hang_hoa" ||
          field === "loai_hang_muc"
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

  const handleMaintenanceTypeChange = (type) => {
    if (type === LOAI_BAO_TRI.MIEN_PHI) {
      // Set all DICH_VU prices to 0
      const newItems = items.map((item) => {
        if (item.loai_hang_muc === "DICH_VU") {
          return { ...item, don_gia: 0, thanh_tien: 0 };
        }
        return item;
      });
      setItems(newItems);
    }
  };

  const onFinish = async (values) => {
    if (items.length === 0) {
      notificationService.error("Vui lòng thêm ít nhất 1 hạng mục bảo trì");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ma_serial: values.ma_serial,
        ma_doi_tac: values.ma_doi_tac,
        so_km_hien_tai: values.so_km_hien_tai,
        ghi_chu: values.ghi_chu,
        loai_bao_tri: values.loai_bao_tri,
        ma_hang_hoa: isExternal ? values.ma_hang_hoa_xe : null, // ID loại xe từ products
        so_khung: isExternal ? values.so_khung_thuc_te : null,
        tong_tien: items.reduce((sum, item) => sum + (item.thanh_tien || 0), 0),
        chi_tiet: items.map((item) => ({
          ma_hang_hoa: item.ma_hang_hoa,
          ten_hang_muc: item.ten_hang_muc,
          loai_hang_muc: item.loai_hang_muc,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
          thanh_tien: item.thanh_tien,
          ghi_chu: item.ghi_chu,
        })),
        performer: values.performer,
      };

      await maintenanceAPI.createMaintenance(payload);
      notificationService.success("Tạo phiếu bảo trì thành công");
      navigate("/maintenance");
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo phiếu bảo trì",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "loai_hang_muc",
      width: 120,
      render: (val, record) => (
        <Select
          value={val}
          onChange={(v) => handleRowChange(record.key, "loai_hang_muc", v)}
          style={{ width: "100%" }}
        >
          <Option value="PHU_TUNG">Phụ tùng</Option>
          <Option value="DICH_VU">Dịch vụ</Option>
        </Select>
      ),
    },
    {
      title: "Hạng mục",
      dataIndex: "ten_hang_muc",
      render: (val, record) => {
        if (record.loai_hang_muc === "PHU_TUNG") {
          return (
            <Select
              showSearch
              placeholder="Chọn phụ tùng"
              value={record.ma_hang_hoa}
              onChange={(v) => handleRowChange(record.key, "ma_hang_hoa", v)}
              style={{ width: "100%" }}
              optionFilterProp="children"
            >
              {phuTungList.map((p) => (
                <Option key={p.ma_pt} value={p.ma_pt}>
                  {p.ma_pt} - {p.ten_pt}
                </Option>
              ))}
            </Select>
          );
        }
        return (
          <Input
            placeholder="Tên dịch vụ/hạng mục"
            value={val}
            onChange={(e) =>
              handleRowChange(record.key, "ten_hang_muc", e.target.value)
            }
          />
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      width: 100,
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
          value={val}
          onChange={(v) => handleRowChange(record.key, "don_gia", v)}
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          disabled={
            record.loai_hang_muc === "DICH_VU" &&
            form.getFieldValue("loai_bao_tri") === LOAI_BAO_TRI.MIEN_PHI
          }
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      width: 150,
      align: "right",
      render: (val) => <strong>{formatService.formatCurrency(val)}</strong>,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghi_chu",
      render: (val, record) => (
        <Input
          placeholder="Ghi chú"
          value={val}
          onChange={(e) =>
            handleRowChange(record.key, "ghi_chu", e.target.value)
          }
        />
      ),
    },
    {
      title: "",
      key: "action",
      width: 50,
      render: (_, record) => (
        <Button
          danger
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.thanh_tien || 0),
    0,
  );

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/maintenance")}
              type="text"
            />
            <span>Lập Phiếu Bảo Trì Mới</span>
          </Space>
        }
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ loai_bao_tri: LOAI_BAO_TRI.TINH_PHI }}
        >
          <Row gutter={16} align="bottom">
            <Col xs={24} md={8}>
              <Form.Item
                name="ma_serial"
                label="Tìm Xe (Số khung/Số máy)"
                rules={[{ required: true, message: "Vui lòng chọn xe" }]}
                extra={
                  isExternal ? (
                    <Badge status="warning" text="Xe ngoài hệ thống" />
                  ) : warrantyInfo?.is_eligible ? (
                    <Badge
                      status="success"
                      text="Xe cửa đặt - Ưu đãi bảo trì"
                    />
                  ) : null
                }
              >
                <Select
                  showSearch
                  placeholder="Nhập số khung/số máy để tìm..."
                  onSearch={handleSearchXe}
                  onChange={onSelectXe}
                  loading={searchingXe}
                  filterOption={false}
                  style={{ width: "100%" }}
                  onBlur={(e) => {
                    // Auto-detect if user typed full serial not in list
                    if (
                      !xeList.some(
                        (x) => x.ma_serial === form.getFieldValue("ma_serial"),
                      )
                    ) {
                      // Optional: can trigger detection here
                    }
                  }}
                >
                  {xeList.map((x) => (
                    <Option key={x.ma_serial} value={x.ma_serial}>
                      {x.ma_serial} - {x.ten_xe} (
                      {x.Partner?.ho_ten || "Chưa có chủ"})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={4}>
              <Form.Item label=" ">
                <Button
                  icon={<SearchOutlined />}
                  onClick={detectExternalVehicle}
                  disabled={isExternal}
                >
                  Xác nhận xe ngoài
                </Button>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              {warrantyInfo && (
                <Alert
                  message={
                    warrantyInfo.is_eligible
                      ? "Xe cửa hàng - Trong hạn bảo trì miễn phí"
                      : "Xe cửa hàng - Hết hạn ưu đãi"
                  }
                  type={warrantyInfo.is_eligible ? "success" : "info"}
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}
              {isExternal && (
                <Alert
                  message="Xe ngoài hệ thống"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              )}
            </Col>
          </Row>

          {isExternal && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="ma_hang_hoa_xe"
                  label="Loại xe (Danh mục hàng hóa)"
                  rules={[{ required: isExternal, message: "Chọn loại xe" }]}
                >
                  <Select
                    placeholder="Chọn model xe từ danh mục"
                    showSearch
                    optionFilterProp="children"
                  >
                    {productList.map((p) => (
                      <Option key={p.id} value={p.id}>
                        {p.sku} - {p.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="so_khung_thuc_te"
                  label="Số khung thực tế"
                  rules={[
                    { required: isExternal, message: "Nhập số khung thực tế" },
                  ]}
                >
                  <Input placeholder="Nhập lại số khung để xác thực" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="ma_doi_tac"
                label="Khách hàng"
                rules={[
                  { required: true, message: "Khách hàng không được để trống" },
                ]}
              >
                <Select
                  placeholder="Chọn khách hàng"
                  disabled={!isExternal && !form.getFieldValue("ma_serial")}
                  showSearch
                  optionFilterProp="children"
                >
                  {partnerList.map((p) => (
                    <Option key={p.ma_kh} value={p.ma_kh}>
                      {p.ho_ten} - {p.so_dien_thoai}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="so_km_hien_tai"
                label="Số KM hiện tại"
                rules={[{ required: true, message: "Nhập số KM" }]}
              >
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="loai_bao_tri"
                label="Loại hình bảo trì"
                rules={[{ required: true }]}
              >
                <Select onChange={handleMaintenanceTypeChange}>
                  {Object.keys(LOAI_BAO_TRI).map((key) => (
                    <Option key={key} value={LOAI_BAO_TRI[key]}>
                      {LOAI_BAO_TRI_LABELS[key]}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="performer" label="Người thực hiện">
                <Select placeholder="Chọn kỹ thuật viên">
                  {userList.map((u) => (
                    <Option key={u.id} value={u.id}>
                      {u.fullname}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item name="ghi_chu" label="Ghi chú chung">
                <Input placeholder="Ghi chú cho phiếu bảo trì này" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Chi tiết hạng mục bảo trì</Divider>

          <Table
            dataSource={items}
            columns={columns}
            rowKey="key"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
            footer={() => (
              <Button
                type="dashed"
                onClick={handleAddItem}
                block
                icon={<PlusOutlined />}
              >
                Thêm hạng mục
              </Button>
            )}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    <strong>Tổng cộng:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ color: "#1677ff", fontSize: "16px" }}>
                      {formatService.formatCurrency(totalAmount)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => navigate("/maintenance")}>Hủy</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                htmlType="submit"
              >
                Lưu phiếu bảo trì
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default MaintenanceFormPage;
