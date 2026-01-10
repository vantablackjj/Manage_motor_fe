import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Tabs,
  Modal,
  Form,
  Select,
  InputNumber,
  Popconfirm,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { hoaDonBanAPI, xeAPI, phuTungAPI } from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import { TRANG_THAI_COLORS } from "../../../utils/constant";

const { Option } = Select;

const SalesOrderDetail = () => {
  const { so_hd } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Modal states
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);

  const [vehicleForm] = Form.useForm();
  const [partForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, [so_hd]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await hoaDonBanAPI.getById(so_hd);
      const rawData = res?.data || res || {};

      // Enrich chi_tiet_xe with vehicle details
      if (rawData.chi_tiet_xe && rawData.chi_tiet_xe.length > 0) {
        const enrichedXe = await Promise.all(
          rawData.chi_tiet_xe.map(async (item) => {
            try {
              const xeDetail = await xeAPI.getDetail(item.xe_key);
              const xeData = xeDetail?.data || xeDetail || {};
              return {
                ...item,
                ten_loai_xe: xeData.ten_loai || xeData.ten_loai_xe,
                ten_mau: xeData.ten_mau,
                so_khung: xeData.so_khung,
              };
            } catch (err) {
              console.error(`Error fetching detail for ${item.xe_key}`, err);
              return item; // Return original if fetch fails
            }
          })
        );
        rawData.chi_tiet_xe = enrichedXe;
      }

      // Enrich chi_tiet_pt with part details
      if (rawData.chi_tiet_pt && rawData.chi_tiet_pt.length > 0) {
        const enrichedPt = await Promise.all(
          rawData.chi_tiet_pt.map(async (item) => {
            try {
              const ptDetail = await phuTungAPI.getDetail(item.ma_pt);
              const ptData = ptDetail?.data || ptDetail || {};
              return {
                ...item,
                ten_pt: ptData.ten_phu_tung || ptData.ten_pt,
                don_vi_tinh: ptData.don_vi_tinh,
              };
            } catch (err) {
              console.error(`Error fetching detail for ${item.ma_pt}`, err);
              return item; // Return original if fetch fails
            }
          })
        );
        rawData.chi_tiet_pt = enrichedPt;
      }

      setData(rawData);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    if (!data?.ma_kho_xuat) return;
    try {
      // Fetch vehicles from the warehouse specified in the order
      const res = await xeAPI.getTonKho(data.ma_kho_xuat, {
        trang_thai: "TON_KHO",
      });
      setAvailableVehicles(res.data || res || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách xe");
    }
  };

  const fetchAvailableParts = async () => {
    try {
      const res = await phuTungAPI.getAll();
      setAvailableParts(res.data || res || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách phụ tùng");
    }
  };

  const handleAddVehicle = async (values) => {
    try {
      await hoaDonBanAPI.addXe(so_hd, {
        xe_key: values.xe_key,
        don_gia: values.don_gia,
      });
      notificationService.success("Thêm xe thành công");
      setVehicleModalVisible(false);
      vehicleForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi thêm xe"
      );
    }
  };

  const handleAddPart = async (values) => {
    try {
      await hoaDonBanAPI.addPhuTung(so_hd, {
        ma_pt: values.ma_pt,
        so_luong: values.so_luong,
        don_gia: values.don_gia,
      });
      notificationService.success("Thêm phụ tùng thành công");
      setPartModalVisible(false);
      partForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi thêm phụ tùng"
      );
    }
  };

  const handleDeleteDetail = async (stt) => {
    try {
      await hoaDonBanAPI.deleteDetail(so_hd, stt);
      notificationService.success("Xóa chi tiết thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi xóa chi tiết");
    }
  };

  const handleSendApproval = async () => {
    try {
      await hoaDonBanAPI.guiDuyet(so_hd);
      notificationService.success("Đã gửi duyệt");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi gửi duyệt");
    }
  };

  const handleApprove = async () => {
    try {
      await hoaDonBanAPI.pheDuyet(so_hd);
      notificationService.success("Đã phê duyệt (Kho đã được cập nhật)");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi phê duyệt");
    }
  };

  const handleReject = async () => {
    try {
      await hoaDonBanAPI.tuChoi(so_hd);
      notificationService.success("Đã từ chối");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi từ chối");
    }
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: "Hủy hóa đơn",
      content: "Bạn có chắc muốn hủy hóa đơn này?",
      onOk: async () => {
        try {
          await hoaDonBanAPI.huy(so_hd, "Hủy bởi người dùng");
          notificationService.success("Đã hủy hóa đơn");
          fetchData();
        } catch (error) {
          notificationService.error("Lỗi hủy hóa đơn");
        }
      },
    });
  };

  if (!data) return null;

  const {
    ngay_ban,
    ten_kh,
    ten_kho,
    tong_tien,
    chiet_khau,
    vat,
    thanh_toan,
    ghi_chu,
    trang_thai,
    chi_tiet_xe = [],
    chi_tiet_pt = [],
  } = data;

  const isEditable = trang_thai === "NHAP";
  const canApprove = trang_thai === "GUI_DUYET" && authService.canApprove();
  const hasItems = chi_tiet_xe.length > 0 || chi_tiet_pt.length > 0;

  const vehicleColumns = [
    { title: "Xe Key", dataIndex: "xe_key" },
    { title: "Loại xe", dataIndex: "ten_loai_xe" },
    { title: "Màu sắc", dataIndex: "ten_mau" },
    { title: "VIN", dataIndex: "so_khung" },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      align: "right",
      render: (v) => formatService.formatCurrency(Number(v)),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      align: "right",
      render: (v) => formatService.formatCurrency(Number(v)),
    },
    {
      title: "",
      key: "action",
      render: (_, record) =>
        isEditable && (
          <Popconfirm
            title="Xóa xe này?"
            onConfirm={() => handleDeleteDetail(record.stt)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
    },
  ];

  const partColumns = [
    { title: "Mã PT", dataIndex: "ma_pt" },
    { title: "Tên phụ tùng", dataIndex: "ten_pt" },
    { title: "ĐVT", dataIndex: "don_vi_tinh" },
    { title: "Số lượng", dataIndex: "so_luong" },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      align: "right",
      render: (v) => formatService.formatCurrency(Number(v)),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      align: "right",
      render: (v) => formatService.formatCurrency(Number(v)),
    },
    {
      title: "",
      key: "action",
      render: (_, record) =>
        isEditable && (
          <Popconfirm
            title="Xóa phụ tùng này?"
            onConfirm={() => handleDeleteDetail(record.stt)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
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
            <span>Bán hàng: {so_hd}</span>
            <Tag color={TRANG_THAI_COLORS[trang_thai]} style={{ margin: 0 }}>
              {trang_thai}
            </Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {isEditable && hasItems && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendApproval}
              >
                Gửi duyệt
              </Button>
            )}
            {canApprove && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleReject}
                >
                  Từ chối
                </Button>
              </>
            )}
            {(trang_thai === "NHAP" || trang_thai === "GUI_DUYET") && (
              <Button danger onClick={handleCancel}>
                Hủy
              </Button>
            )}
          </Space>
        }
        size="small"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Ngày bán">
            {formatService.formatDate(ngay_ban)}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng">
            {ten_kh || data.ma_kh}
          </Descriptions.Item>
          <Descriptions.Item label="Kho xuất">
            {ten_kho || data.ma_kho_xuat}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {ghi_chu || "-"}
          </Descriptions.Item>
        </Descriptions>

        {/* Summary Box */}
        <Card
          style={{ marginTop: 16, backgroundColor: "#f5f5f5" }}
          size="small"
        >
          <Row gutter={[16, 8]} justify="end">
            <Col xs={12} sm={8} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>Tổng tiền:</span>
              <br />
              <b style={{ fontSize: 16 }}>
                {formatService.formatCurrency(Number(tong_tien || 0))}
              </b>
            </Col>
            <Col xs={12} sm={8} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>Chiết khấu:</span>
              <br />
              <b style={{ fontSize: 16 }}>
                {formatService.formatCurrency(Number(chiet_khau || 0))}
              </b>
            </Col>
            <Col xs={12} sm={4} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>VAT:</span>
              <br />
              <b style={{ fontSize: 16 }}>{vat || 0}%</b>
            </Col>
            <Col
              xs={24}
              style={{
                marginTop: 8,
                borderTop: "1px solid #d9d9d9",
                paddingTop: 8,
                textAlign: "right",
              }}
            >
              <span style={{ marginRight: 16, fontWeight: "bold" }}>
                Thanh toán:
              </span>
              <span
                style={{ fontSize: 20, fontWeight: "bold", color: "#1890ff" }}
              >
                {formatService.formatCurrency(Number(thanh_toan || 0))}
              </span>
            </Col>
          </Row>
        </Card>

        <Tabs
          style={{ marginTop: 16 }}
          size="small"
          items={[
            {
              key: "vehicles",
              label: "Xe",
              children: (
                <>
                  {isEditable && (
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        fetchAvailableVehicles();
                        setVehicleModalVisible(true);
                      }}
                      style={{ marginBottom: 16 }}
                      block
                    >
                      Thêm xe
                    </Button>
                  )}
                  <Table
                    dataSource={chi_tiet_xe}
                    columns={vehicleColumns}
                    rowKey="stt"
                    pagination={false}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                </>
              ),
            },
            {
              key: "parts",
              label: "Phụ tùng",
              children: (
                <>
                  {isEditable && (
                    <Button
                      type="dashed"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        fetchAvailableParts();
                        setPartModalVisible(true);
                      }}
                      style={{ marginBottom: 16 }}
                      block
                    >
                      Thêm phụ tùng
                    </Button>
                  )}
                  <Table
                    dataSource={chi_tiet_pt}
                    columns={partColumns}
                    rowKey="stt"
                    pagination={false}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Add Vehicle Modal */}
      <Modal
        title="Thêm xe vào hóa đơn"
        open={vehicleModalVisible}
        onCancel={() => setVehicleModalVisible(false)}
        footer={null}
      >
        <Form form={vehicleForm} layout="vertical" onFinish={handleAddVehicle}>
          <Form.Item
            name="xe_key"
            label="Chọn xe"
            rules={[{ required: true, message: "Vui lòng chọn xe" }]}
          >
            <Select
              placeholder="Chọn xe"
              showSearch
              optionFilterProp="children"
            >
              {availableVehicles.map((v) => (
                <Option key={v.xe_key} value={v.xe_key}>
                  {v.xe_key} -{v.ten_loai} - {v.ten_mau} ({v.so_khung})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="don_gia"
            label="Đơn giá"
            rules={[{ required: true, message: "Nhập đơn giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setVehicleModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Add Part Modal */}
      <Modal
        title="Thêm phụ tùng vào hóa đơn"
        open={partModalVisible}
        onCancel={() => setPartModalVisible(false)}
        footer={null}
      >
        <Form form={partForm} layout="vertical" onFinish={handleAddPart}>
          <Form.Item
            name="ma_pt"
            label="Chọn phụ tùng"
            rules={[{ required: true, message: "Vui lòng chọn phụ tùng" }]}
          >
            <Select
              placeholder="Chọn phụ tùng"
              showSearch
              optionFilterProp="children"
            >
              {availableParts.map((p) => (
                <Option key={p.ma_pt} value={p.ma_pt}>
                  {p.ten_phu_tung} ({p.ma_pt})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="so_luong"
            label="Số lượng"
            rules={[{ required: true, message: "Nhập số lượng" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
          <Form.Item
            name="don_gia"
            label="Đơn giá"
            rules={[{ required: true, message: "Nhập đơn giá" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>
          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => setPartModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Thêm
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesOrderDetail;
