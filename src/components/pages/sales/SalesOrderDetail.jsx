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
  Input,
  Typography,
  Skeleton,
  Empty,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import PrintTemplate from "../../features/Print/PrintTemplate";
import {
  orderAPI,
  xeAPI,
  phuTungAPI,
  khachHangAPI,
  khoAPI,
} from "../../../api";
import {
  formatService,
  notificationService,
  authService,
} from "../../../services";
import usePermission from "../../../hooks/usePermission";
import { TRANG_THAI_COLORS } from "../../../utils/constant";

const { Option } = Select;
const { Text } = Typography;

const SalesOrderDetail = () => {
  const { id } = useParams(); // URL param changed from so_hd to id
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [khoList, setKhoList] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  // Modal states
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [partModalVisible, setPartModalVisible] = useState(false);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);

  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [printType, setPrintType] = useState("ORDER");
  const [headerModalVisible, setHeaderModalVisible] = useState(false);

  const { canApproveSales, canApprovePurchase, canApproveAnything } =
    usePermission();
  const hasApprovePermission = canApproveSales() || canApproveAnything();

  const handlePrint = (type) => {
    setPrintType(type);
    setPrintModalVisible(true);
    setTimeout(() => {
      const printContent = document.getElementById("print-content");
      if (printContent) {
        const originalContents = document.body.innerHTML;
        const printContents = printContent.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore React state
      }
    }, 500);
  };

  const [vehicleForm] = Form.useForm();
  const [partForm] = Form.useForm();
  const [deliveryForm] = Form.useForm();
  const [headerForm] = Form.useForm();

  useEffect(() => {
    fetchMasterData();
    fetchData();
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [khoRes, khRes] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll(),
      ]);
      setKhoList(khoRes || []);
      setCustomerList(khRes.data || khRes || []);
    } catch (error) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getById(id);
      const rawOrder = res?.data || res || {};

      // Unified items
      const details = rawOrder.items || rawOrder.details || [];
      // Phân loại Xe và Phụ tùng dựa trên loai_hang hoặc ma_serial_du_kien
      rawOrder.chi_tiet_xe = details
        .filter(
          (d) => d.loai_hang === "XE" || d.yeu_cau_dac_biet?.ma_serial_du_kien,
        )
        .map((d) => ({ ...d, loai_hang: "XE" }));
      rawOrder.chi_tiet_pt = details
        .filter(
          (d) =>
            d.loai_hang === "PHU_TUNG" ||
            (!d.yeu_cau_dac_biet?.ma_serial_du_kien && d.loai_hang !== "XE"),
        )
        .map((d) => ({ ...d, loai_hang: "PHU_TUNG" }));

      // Enrich chi_tiet_xe với thông tin spec (Số khung, số máy)
      if (rawOrder.chi_tiet_xe.length > 0) {
        const enrichedXe = await Promise.all(
          rawOrder.chi_tiet_xe.map(async (item) => {
            const serial = item.yeu_cau_dac_biet?.ma_serial_du_kien;
            if (!serial) return item;
            try {
              const xeDetail = await xeAPI.getDetail(serial);
              const xeData = xeDetail?.data || xeDetail || {};
              return {
                ...item,
                ten_loai_xe:
                  item.ten_hang_hoa || xeData.ten_loai || xeData.ten_loai_xe,
                ten_mau: xeData.ten_mau,
                so_khung: xeData.so_khung,
                so_may: xeData.so_may,
              };
            } catch (err) {
              return item;
            }
          }),
        );
        rawOrder.chi_tiet_xe = enrichedXe;
      }

      setData(rawOrder);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    if (!data?.ma_ben_xuat) return;
    try {
      const res = await xeAPI.getTonKho(data.ma_ben_xuat, {
        trang_thai: "TON_KHO",
      });
      setAvailableVehicles(res.data || res || []);
    } catch (error) {
      notificationService.error("Lỗi tải danh sách xe");
    }
  };

  const fetchAvailableParts = async () => {
    try {
      const [tonKhoRes, allPartsRes] = await Promise.all([
        data?.ma_ben_xuat
          ? phuTungAPI.getTonKho(data.ma_ben_xuat)
          : Promise.resolve({ data: [] }),
        phuTungAPI.getAll(),
      ]);

      const tonKhoData = tonKhoRes.data || tonKhoRes || [];
      const allPartsData = allPartsRes.data || allPartsRes || [];

      const enrichedParts = tonKhoData.map((item) => {
        const partDetail = allPartsData.find((p) => p.ma_pt === item.ma_pt);
        return {
          ...item,
          ten_phu_tung: partDetail?.ten_phu_tung || partDetail?.ten_pt,
          ten_pt: partDetail?.ten_phu_tung || partDetail?.ten_pt,
          don_vi_tinh: partDetail?.don_vi_tinh,
          don_gia: partDetail?.gia_ban,
          gia_ban: partDetail?.gia_ban,
        };
      });

      setAvailableParts(enrichedParts);
    } catch (error) {
      console.error(error);
      notificationService.error("Lỗi tải danh sách phụ tùng");
    }
  };

  const handleAddVehicle = async (values) => {
    try {
      const vehicle = availableVehicles.find((v) => v.xe_key === values.xe_key);
      if (!vehicle) {
        notificationService.error("Không tìm thấy thông tin xe");
        return;
      }

      await orderAPI.addDetail(id, {
        ma_hang_hoa: vehicle.ma_loai || vehicle.ma_loai_xe || vehicle.xe_key,
        don_gia: values.don_gia,
        so_luong_dat: 1,
        loai_hang: "XE",
        yeu_cau_dac_biet: {
          ma_serial_du_kien: values.xe_key,
        },
      });
      notificationService.success("Thêm xe thành công");
      setVehicleModalVisible(false);
      vehicleForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi thêm xe",
      );
    }
  };

  const handleAddPart = async (values) => {
    try {
      await orderAPI.addDetail(id, {
        ma_hang_hoa: values.ma_pt,
        so_luong_dat: values.so_luong,
        don_gia: values.don_gia,
        loai_hang: "PHU_TUNG",
        yeu_cau_dac_biet: {},
      });
      notificationService.success("Thêm phụ tùng thành công");
      setPartModalVisible(false);
      partForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi thêm phụ tùng",
      );
    }
  };

  const handleDeleteDetail = async (stt) => {
    try {
      await orderAPI.deleteDetail(id, stt);
      notificationService.success("Xóa chi tiết thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi xóa chi tiết");
    }
  };

  const handleUpdateStatus = async (newStatus, title, content) => {
    Modal.confirm({
      title: title || "Xác nhận cập nhật trạng thái",
      content:
        content ||
        `Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái ${newStatus}?`,
      onOk: async () => {
        try {
          await orderAPI.updateStatus(id, newStatus);
          notificationService.success("Cập nhật trạng thái thành công");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Lỗi cập nhật trạng thái",
          );
        }
      },
    });
  };

  const handleDeliver = async (values) => {
    try {
      const itemsToDeliver = data.chi_tiet_xe
        .concat(data.chi_tiet_pt)
        .map((item) => ({
          ma_hang_hoa: item.ma_hang_hoa,
          so_luong: values[`qty_${item.stt}`] || 0,
          don_gia: Number(item.don_gia),
          serials:
            item.loai_hang === "XE"
              ? [item.yeu_cau_dac_biet?.ma_serial_du_kien || item.ma_hang_hoa]
              : [],
        }))
        .filter((i) => i.so_luong > 0);

      if (itemsToDeliver.length === 0) {
        notificationService.warning(
          "Vui lòng chọn ít nhất một mặt hàng để giao",
        );
        return;
      }

      await orderAPI.deliver(id, {
        ghi_chu: values.ghi_chu_giao,
        items: itemsToDeliver,
      });

      notificationService.success("Giao hàng thành công");
      setDeliveryModalVisible(false);
      deliveryForm.resetFields();
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi giao hàng",
      );
    }
  };

  const handleUpdateHeader = async (values) => {
    try {
      await orderAPI.update(id, values);
      notificationService.success("Cập nhật đơn hàng thành công");
      setHeaderModalVisible(false);
      fetchData();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi cập nhật đơn hàng",
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    );
  }

  if (!data && !loading) {
    return (
      <div style={{ padding: "100px 0", textAlign: "center" }}>
        <Empty description="Không tìm thấy thông tin đơn hàng bán" />
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/sales/orders")}
          style={{ marginTop: 16 }}
        >
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const {
    so_don_hang,
    loai_don_hang,
    ngay_dat_hang,
    created_at,
    ma_ben_nhap,
    ma_ben_xuat,
    loai_ben_xuat,
    loai_ben_nhap,
    tong_gia_tri,
    chiet_khau,
    vat_percentage,
    thanh_tien,
    ghi_chu,
    trang_thai,
    ten_ben_xuat,
    ten_ben_nhap,
    ten_nguoi_tao,
    nguoi_duyet,
    ngay_duyet,
    nguoi_gui,
    ngay_gui,
    so_hoa_don_du_kien,
    so_hoa_don_da_xuat,
    chi_tiet_xe = [],
    chi_tiet_pt = [],
  } = data;

  const isEditable = trang_thai === "NHAP";
  const canDeliver = ["DA_DUYET", "DANG_GIAO"].includes(trang_thai);
  const hasItems = chi_tiet_xe.length > 0 || chi_tiet_pt.length > 0;

  const getCustomerName = (ma_kh) => {
    return (
      ten_ben_nhap ||
      customerList.find((c) => c.ma_kh === ma_kh)?.ho_ten ||
      ma_kh
    );
  };

  const getKhoName = (ma_kho) => {
    return (
      ten_ben_xuat ||
      khoList.find((item) => item.ma_kho === ma_kho)?.ten_kho ||
      ma_kho
    );
  };

  const vehicleColumns = [
    { title: "Mã xe/Serial", dataIndex: "ma_hang_hoa", width: 140 },
    { title: "Loại xe", dataIndex: "ten_loai_xe" },
    { title: "Màu sắc", dataIndex: "ten_mau", width: 100 },
    { title: "Số khung", dataIndex: "so_khung" },
    { title: "Số máy", dataIndex: "so_may" },
    {
      title: "Giao/Đặt",
      key: "progress",
      align: "center",
      render: (_, record) => (
        <Space>
          <b
            style={{
              color:
                (record.so_luong_da_giao || 0) >= (record.so_luong_dat || 1)
                  ? "green"
                  : "orange",
            }}
          >
            {record.so_luong_da_giao || 0}
          </b>
          / {record.so_luong_dat || 1}
        </Space>
      ),
    },
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
    { title: "STT", dataIndex: "stt", width: 50, align: "center" },
    { title: "Mã hàng", dataIndex: "ma_hang_hoa", width: 110 },
    { title: "Tên sản phẩm", dataIndex: "ten_hang_hoa" },
    { title: "ĐVT", dataIndex: "don_vi_tinh", width: 70, align: "center" },
    {
      title: "SL Đặt",
      dataIndex: "so_luong_dat",
      align: "center",
      width: 80,
      render: (val) => <b>{val}</b>,
    },
    {
      title: "Đã giao",
      dataIndex: "so_luong_da_giao",
      align: "center",
      width: 80,
      render: (val) => (
        <Text type={val > 0 ? "success" : "secondary"}>{val || 0}</Text>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "so_luong_con_lai",
      align: "center",
      width: 80,
      render: (val, record) => {
        const remaining = val ?? ((record.so_luong_dat || 0) - (record.so_luong_da_giao || 0));
        return (
          <Tag color={remaining > 0 ? "warning" : "success"}>
            {remaining}
          </Tag>
        );
      },
    },
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
            <span>Bán hàng: {data.so_don_hang || data.id}</span>
            <Tag color={TRANG_THAI_COLORS[trang_thai]} style={{ margin: 0 }}>
              {trang_thai}
            </Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {/* Print Buttons */}
            <Button
              icon={<PrinterOutlined />}
              onClick={() => handlePrint("ORDER")}
            >
              In Đơn hàng
            </Button>
            {["DA_DUYET", "DANG_GIAO", "HOAN_THANH"].includes(trang_thai) && (
              <Button
                icon={<PrinterOutlined />}
                onClick={() => handlePrint("STOCK_CARD")}
              >
                In Thẻ kho
              </Button>
            )}

            {/* Luồng Nháp (NHAP) */}
            {trang_thai === "NHAP" && (
              <>
                {hasItems && (
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() =>
                      handleUpdateStatus(
                        "GUI_DUYET",
                        "Gửi duyệt đơn hàng",
                        "Bạn có chắc muốn gửi duyệt đơn hàng này?",
                      )
                    }
                  >
                    Gửi duyệt
                  </Button>
                )}
                <Button
                  danger
                  onClick={() => handleUpdateStatus("HUY", "Hủy đơn hàng")}
                >
                  Hủy đơn
                </Button>
              </>
            )}

            {/* Luồng Chờ duyệt (GUI_DUYET) */}
            {trang_thai === "GUI_DUYET" && (
              <>
                {hasApprovePermission && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() =>
                        handleUpdateStatus(
                          "DA_DUYET",
                          "Duyệt đơn hàng",
                          "Đơn hàng sẽ chuyển sang trạng thái sẵn sàng giao.",
                        )
                      }
                    >
                      Phê duyệt
                    </Button>
                    <Button
                      danger
                      onClick={() =>
                        handleUpdateStatus("TU_CHOI", "Từ chối đơn hàng")
                      }
                    >
                      Từ chối
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus("NHAP", "Trả về soạn thảo")
                      }
                    >
                      Trả về
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Luồng Đã duyệt / Đang giao (DA_DUYET, DANG_GIAO) */}
            {canDeliver && (
              <>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => {
                    deliveryForm.setFieldsValue({
                      ghi_chu_giao: `Giao hàng cho đơn ${data.so_don_hang}`,
                    });
                    data.chi_tiet_xe
                      .concat(data.chi_tiet_pt)
                      .forEach((item) => {
                        const remaining =
                          (item.so_luong_dat || 1) -
                          (item.so_luong_da_giao || 0);
                        deliveryForm.setFieldValue(
                          `qty_${item.stt}`,
                          remaining > 0 ? remaining : 0,
                        );
                      });
                    setDeliveryModalVisible(true);
                  }}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Giao hàng (Deliver)
                </Button>
              </>
            )}
          </Space>
        }
        size="small"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Số đơn hàng">
            <b>{so_don_hang || data.id}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Loại đơn hàng">
            <Tag color="blue">{loai_don_hang || "—"}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày đặt hàng">
            {ngay_dat_hang ? formatService.formatDate(ngay_dat_hang) : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatService.formatDateTime(created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Kho xuất">
            {getKhoName(ma_ben_xuat)}{loai_ben_xuat ? <Tag style={{ marginLeft: 6 }}>{loai_ben_xuat}</Tag> : null}
          </Descriptions.Item>
          <Descriptions.Item label="Khách hàng (Bên nhận)">
            {getCustomerName(ma_ben_nhap)}{loai_ben_nhap ? <Tag style={{ marginLeft: 6 }}>{loai_ben_nhap}</Tag> : null}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {ten_nguoi_tao || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Người duyệt / Ngày duyệt">
            {nguoi_duyet ? (
              <span>{nguoi_duyet}{ngay_duyet ? <span style={{ color: "#8c8c8c", marginLeft: 8 }}>({formatService.formatDateTime(ngay_duyet)})</span> : null}</span>
            ) : "Chưa duyệt"}
          </Descriptions.Item>
          {(nguoi_gui || ngay_gui) && (
            <Descriptions.Item label="Người gửi / Ngày gửi">
              {nguoi_gui || "—"}{ngay_gui ? <span style={{ color: "#8c8c8c", marginLeft: 8 }}>({formatService.formatDateTime(ngay_gui)})</span> : null}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Số HĐ dự kiến / Đã xuất">
            <Space>
              <Tag color="default">Dự kiến: {so_hoa_don_du_kien ?? "—"}</Tag>
              <Tag color={so_hoa_don_da_xuat > 0 ? "success" : "default"}>
                Đã xuất: {so_hoa_don_da_xuat ?? 0}
              </Tag>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {ghi_chu || "—"}
          </Descriptions.Item>
        </Descriptions>

        {/* Summary Box */}
        <Card
          style={{ marginTop: 16, backgroundColor: "rgba(0,0,0,0.04)" }}
          size="small"
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Tổng hợp</span>
              {isEditable && (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => {
                    headerForm.setFieldsValue({
                      vat_percentage: data.vat_percentage,
                      chiet_khau: data.chiet_khau,
                      ghi_chu: data.ghi_chu,
                    });
                    setHeaderModalVisible(true);
                  }}
                >
                  Sửa
                </Button>
              )}
            </div>
          }
        >
          <Row gutter={[16, 8]} justify="end">
            <Col xs={12} sm={8} style={{ textAlign: "right" }}>
              <span style={{ color: "rgba(0,0,0,0.45)" }}>Tổng tiền:</span>
              <br />
              <b style={{ fontSize: 16 }}>
                {formatService.formatCurrency(Number(tong_gia_tri || 0))}
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
              <b style={{ fontSize: 16 }}>{vat_percentage || 0}%</b>
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
                {formatService.formatCurrency(Number(thanh_tien || 0))}
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
              filterOption={(input, option) => {
                const vehicle = availableVehicles.find(
                  (v) => v.xe_key === option.key,
                );
                if (!vehicle) return false;
                const searchStr =
                  `${vehicle.ten_loai} ${vehicle.ten_mau} ${vehicle.so_khung} ${vehicle.so_may}`.toLowerCase();
                return searchStr.includes(input.toLowerCase());
              }}
            >
              {availableVehicles.map((v) => (
                <Option key={v.xe_key} value={v.xe_key}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      <b>{v.ten_loai}</b> - {v.ten_mau}
                    </span>
                    <span style={{ color: "#8c8c8c", fontSize: "12px" }}>
                      SK: {v.so_khung} | SM: {v.so_may}
                    </span>
                  </div>
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
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      {p.ten_phu_tung} ({p.ma_pt})
                    </span>
                    <span
                      style={{
                        color: p.so_luong_ton > 0 ? "#52c41a" : "#ff4d4f",
                      }}
                    >
                      Tồn: {p.so_luong_ton} {p.don_vi_tinh}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="so_luong"
            label="Số lượng"
            rules={[
              { required: true, message: "Nhập số lượng" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const ma_pt = getFieldValue("ma_pt");
                  const part = availableParts.find((p) => p.ma_pt === ma_pt);
                  if (part && value > part.so_luong_ton) {
                    return Promise.reject(
                      new Error(`Vượt quá tồn kho (${part.so_luong_ton})`),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Nhập số lượng bán"
            />
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

      {/* Delivery Modal */}
      <Modal
        title="Giao hàng (Lập hóa đơn)"
        open={deliveryModalVisible}
        onCancel={() => setDeliveryModalVisible(false)}
        width={700}
        footer={null}
      >
        <Form form={deliveryForm} layout="vertical" onFinish={handleDeliver}>
          <Form.Item name="ghi_chu_giao" label="Ghi chú giao hàng">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Table
            size="small"
            pagination={false}
            dataSource={(data.chi_tiet_xe || []).concat(data.chi_tiet_pt || [])}
            rowKey="stt"
            columns={[
              {
                title: "Sản phẩm",
                dataIndex: "ma_hang_hoa",
                render: (val, r) => (
                  <div>
                    <b>{val}</b>
                    <br />
                    <small>{r.ten_loai_xe || r.ten_pt}</small>
                  </div>
                ),
              },
              {
                title: "Đặt/Đã giao",
                key: "ordered",
                align: "center",
                render: (_, r) =>
                  `${r.so_luong_dat || 1}/${r.so_luong_da_giao || 0}`,
              },
              {
                title: "Giao đợt này",
                key: "deliver_qty",
                width: 150,
                render: (_, record) => {
                  const remaining =
                    (record.so_luong_dat || 1) - (record.so_luong_da_giao || 0);
                  if (remaining <= 0)
                    return <Tag color="success">Đã giao đủ</Tag>;
                  return (
                    <Form.Item name={`qty_${record.stt}`} style={{ margin: 0 }}>
                      <InputNumber
                        min={0}
                        max={remaining}
                        style={{ width: "100%" }}
                        placeholder="SL"
                      />
                    </Form.Item>
                  );
                },
              },
            ]}
          />

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => setDeliveryModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                Xác nhận giao hàng
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      {/* Edit Header Modal */}
      <Modal
        title="Cập nhật thông tin đơn hàng"
        open={headerModalVisible}
        onCancel={() => setHeaderModalVisible(false)}
        onOk={() => headerForm.submit()}
        okText="Cập nhật"
      >
        <Form form={headerForm} layout="vertical" onFinish={handleUpdateHeader}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vat_percentage" label="VAT (%)">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
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
          <Form.Item name="ghi_chu" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Print Modal (Hidden but used for printing) */}
      <Modal
        open={printModalVisible}
        onCancel={() => setPrintModalVisible(false)}
        footer={null}
        width={800}
        style={{ display: "none" }}
      >
        <PrintTemplate data={data} type={printType} />
      </Modal>
    </div>
  );
};

export default SalesOrderDetail;
