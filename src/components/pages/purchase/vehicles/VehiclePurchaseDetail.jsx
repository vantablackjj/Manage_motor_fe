import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ImportOutlined,
} from "@ant-design/icons";
import { donHangMuaXeAPI, xeAPI } from "../../../../api"; // Assuming xeAPI exists for inbound
import {
  formatService,
  notificationService,
  authService,
} from "../../../../services";
import {
  TRANG_THAI_COLORS,
  TRANG_THAI_LABELS,
} from "../../../../utils/constant";

const VehiclePurchaseDetail = () => {
  const { ma_phieu } = useParams(); // ma_phieu (so_phieu)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { header, items }

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptItems, setReceiptItems] = useState([]); // List of individual vehicles to enter VIN/Engine

  useEffect(() => {
    fetchData();
  }, [ma_phieu]);

  // Master Data
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, [ma_phieu]);

  const fetchMasterData = async () => {
    try {
      const api = await import("../../../../api");
      const [typeRes, colorRes] = await Promise.all([
        api.danhMucAPI.modelCar.getAll(),
        api.danhMucAPI.color.getAll(),
      ]);
      setVehicleTypes(typeRes || []);
      setColors(colorRes || []);
    } catch (error) {
      console.error("Lỗi tải danh mục", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await donHangMuaXeAPI.getById(ma_phieu);
      console.log("Fetched Order Detail:", res.data);
      if (res.data?.chi_tiet) {
        console.log("Detail Lines:", res.data.chi_tiet);
      }
      setData(res.data);
    } catch (error) {
      notificationService.error("Lỗi tải chi tiết đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleSendApproval = async () => {
    try {
      await donHangMuaXeAPI.guiDuyet(ma_phieu);
      notificationService.success("Đã gửi duyệt");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi gửi duyệt");
    }
  };

  const handleApprove = async () => {
    try {
      await donHangMuaXeAPI.pheDuyet(ma_phieu);
      notificationService.success("Đã phê duyệt");
      fetchData();
    } catch (error) {
      notificationService.error("Lỗi phê duyệt");
    }
  };

  // ----- RECEIPT LOGIC -----
  const handleOpenReceipt = () => {
    const detailItems = data?.chi_tiet || data?.items || [];

    // [SAFEGUARD] Check for Legacy Orders (Qty > 1)
    // The new backend requires 1 Detail Row = 1 Vehicle.
    // Old orders with Qty > 1 will cause duplicate IDs in the payload, failing validation.
    const isLegacyOrder = detailItems.some((i) => i.so_luong > 1);
    if (isLegacyOrder) {
      notificationService.error(
        "Đơn hàng này thuộc phiên bản cũ (Số lượng > 1/dòng). Vui lòng tạo đơn hàng mới để nhập kho."
      );
      return;
    }

    // Expand items based on Quantity. E.g. Qty 2 -> 2 rows
    const expanded = [];
    detailItems.forEach((item) => {
      // Find name from master data if API doesn't return it
      const typeName =
        item.ten_loai_xe ||
        vehicleTypes.find((t) => t.ma_loai === item.ma_loai_xe)?.ten_loai ||
        item.ma_loai_xe;

      for (let i = 0; i < item.so_luong; i++) {
        expanded.push({
          key: `${item.id}_${i}`,
          detailId: item.id, // KEEP DETAIL ID
          ma_loai_xe: item.ma_loai_xe,
          ten_loai_xe: typeName,
          mau_sac: item.mau_sac || item.ma_mau, // Handle different casing if any
          so_khung: "",
          so_may: "",
        });
      }
    });
    setReceiptItems(expanded);
    setShowReceiptModal(true);
  };

  const handleReceiptUpdate = (key, field, val) => {
    const newItems = receiptItems.map((item) =>
      item.key === key ? { ...item, [field]: val } : item
    );
    setReceiptItems(newItems);
  };

  const handleSubmitReceipt = async () => {
    // Validate
    for (let item of receiptItems) {
      if (!item.so_khung || !item.so_may) {
        notificationService.error(
          "Vui lòng nhập đủ Số khung & Số máy cho tất cả xe"
        );
        return;
      }
    }

    try {
      // Call API to create actual vehicles
      const res = await donHangMuaXeAPI.nhapKho(ma_phieu, {
        vehicles: receiptItems.map((item) => ({
          id: item.detailId, // REQUIRED by Backend
          so_khung: item.so_khung,
          so_may: item.so_may,
          ma_loai_xe: item.ma_loai_xe, // ID
          // Map Color Name to Color ID if needed.
          // The table shows Name (mau_sac), but backend needs ID (ma_mau) for FK.
          // Try to find ID from colors list if available, or use existing ID.
          ma_mau:
            colors.find((c) => c.ten_mau === item.mau_sac)?.ma_mau ||
            item.mau_sac ||
            null,
        })),
      });

      const { success, errors } = res.data;

      if (errors && errors.length > 0) {
        const errorMsg = errors
          .map((e) => `Xe (ID: ${e.id}): ${e.message}`)
          .join("\n");
        notificationService.warning({
          message: "Nhập kho hoàn tất với một số lỗi",
          description: errorMsg,
          duration: 10,
        });

        // Optional: Remove successful items from receiptItems or refresh
        // For now, refresh entire data
        fetchData();
        if (success.length > 0) {
          // Close modal if at least some succeeded, or keep open?
          // Usually keep open if errors so user can fix.
          // But here we'll close and let user see updated status on reload.
          // Better: Keep modal open if 100% failure, close if partial?
          // Let's stick to simple behavior: close and refresh.
          setShowReceiptModal(false);
        }
      } else {
        notificationService.success(
          `Nhập kho thành công ${success.length} xe!`
        );
        setShowReceiptModal(false);
        fetchData();
      }
    } catch (error) {
      notificationService.error(
        "Lỗi nhập kho: " + (error?.response?.data?.message || "")
      );
    }
  };
  // -------------------------

  if (!data) return null;
  if (!data) return null;
  const header = data;
  const items = data.chi_tiet || data.items || [];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/purchase/vehicles")}
            />
            <span>Chi tiết đơn hàng: {header.so_phieu}</span>
            <Tag color={TRANG_THAI_COLORS[header.trang_thai]}>
              {header.trang_thai}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            {header.trang_thai === "NHAP" && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendApproval}
              >
                Gửi duyệt
              </Button>
            )}
            {header.trang_thai === "GUI_DUYET" && authService.canApprove() && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApprove}
              >
                Phê duyệt
              </Button>
            )}
            {/* Show Receipt Button if Approved */}
            {header.trang_thai === "DA_DUYET" && (
              <Button
                type="primary"
                icon={<ImportOutlined />}
                onClick={handleOpenReceipt}
              >
                Nhập kho (Thực tế)
              </Button>
            )}
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Ngày đặt">
            {formatService.formatDate(header.ngay_dat_hang)}
          </Descriptions.Item>
          <Descriptions.Item label="Nhà cung cấp">
            {header.ten_ncc || header.ma_ncc}
          </Descriptions.Item>
          <Descriptions.Item label="Kho nhập">
            {header.ten_kho_nhap || header.ma_kho_nhap}
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">
            {formatService.formatCurrency(Number(header.tong_tien))}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú" span={2}>
            {header.dien_giai || header.ghi_chu}
          </Descriptions.Item>
        </Descriptions>

        <Table
          style={{ marginTop: 24 }}
          dataSource={items}
          rowKey="id" // item ID
          pagination={false}
          columns={[
            {
              title: "Loại xe",
              key: "ten_loai_xe",
              render: (_, record) =>
                record.ten_loai_xe ||
                vehicleTypes.find((t) => t.ma_loai === record.ma_loai_xe)
                  ?.ten_loai ||
                record.ma_loai_xe,
            },
            {
              title: "Màu sắc",
              dataIndex: "ma_mau",
              render: (text) => text,
            },
            { title: "Số lượng", dataIndex: "so_luong" },
            {
              title: "Đơn giá",
              dataIndex: "don_gia",
              render: (v) => formatService.formatCurrency(Number(v)),
            },
            {
              title: "Thành tiền",
              dataIndex: "thanh_tien",
              render: (v) => formatService.formatCurrency(Number(v)),
            },
          ]}
        />
      </Card>

      {/* RECEIPT MODAL */}
      <Modal
        title="Nhập kho xe thực tế"
        open={showReceiptModal}
        onCancel={() => setShowReceiptModal(false)}
        onOk={handleSubmitReceipt}
        width={800}
        okText="Xác nhận nhập kho"
      >
        <p>Vui lòng nhập Số khung và Số máy cho từng xe trong đơn hàng.</p>
        <Table
          dataSource={receiptItems}
          rowKey="key"
          pagination={false}
          scroll={{ y: 400 }}
          columns={[
            { title: "Loại xe", dataIndex: "ten_loai_xe" },
            { title: "Màu", dataIndex: "mau_sac", width: 80 },
            {
              title: "Số khung",
              key: "so_khung",
              render: (_, record) => (
                <Input
                  value={record.so_khung}
                  onChange={(e) =>
                    handleReceiptUpdate(record.key, "so_khung", e.target.value)
                  }
                />
              ),
            },
            {
              title: "Số máy",
              key: "so_may",
              render: (_, record) => (
                <Input
                  value={record.so_may}
                  onChange={(e) =>
                    handleReceiptUpdate(record.key, "so_may", e.target.value)
                  }
                />
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default VehiclePurchaseDetail;
