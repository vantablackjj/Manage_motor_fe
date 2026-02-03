// src/pages/xe/XeLoaiPage.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Select,
  Tooltip,
  Row,
  Col,
} from "antd";
import { useResponsive } from "../../../hooks/useResponsive";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  CarOutlined,
  StopOutlined,
  ImportOutlined,
  ExportOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";

import { danhMucAPI } from "../../../api";
import { notificationService, authService } from "../../../services";
import XeLoaiForm from "./XeLoaiForm";

const { Search } = Input;
const { Option } = Select;

const XeLoaiPage = () => {
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    ma_nh: null,
    ma_lh: null,
    search: "",
  });

  const [nhanHieuList, setNhanHieuList] = useState([]);
  const [loaiHinhList, setLoaiHinhList] = useState([]);
  const [noiSanXuatList, setNoiSanXuatList] = useState([]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    console.log(editing);
  }, [editing]);

  useEffect(() => {
    fetchFilterOptions();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleSoftDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận ngừng sử dụng",
      content: (
        <>
          <p>
            Bạn có chắc chắn muốn <strong>ngừng sử dụng</strong> loại xe:
          </p>
          <p>
            <strong>{record.ten_loai}</strong> ({record.ma_loai})
          </p>
        </>
      ),
      okText: "Ngừng sử dụng",
      okType: "danger",
      cancelText: "Hủy",
      async onOk() {
        try {
          await danhMucAPI.modelCar.delete(record.ma_loai);
          notificationService.success("Đã ngừng sử dụng loại xe");
          fetchData();
        } catch (error) {
          notificationService.error(
            error?.response?.data?.message || "Không thể ngừng sử dụng loại xe",
          );
        }
      },
    });
  };

  const handleRestore = async (record) => {
    try {
      // Backend requires full object or just status?
      // Based on previous experience, let's send full object + status: true key if needed, or just partial.
      // User prompt says: Body: { "status": true }.
      // But for safety based on recent error, maybe simpler payload first?
      // User prompt: `PUT /api/model-car/:ma_loai` with body `{ "status": true }`.
      await danhMucAPI.modelCar.update(record.ma_loai, { status: true });
      notificationService.success("Khôi phục thành công");
      fetchData();
    } catch (error) {
      notificationService.error("Không thể khôi phục loại xe");
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [nh, lh, nsx] = await Promise.all([
        danhMucAPI.brand.getAll(),
        danhMucAPI.loaiHinh.getAll(),
        danhMucAPI.noiSanXuat.getAll(),
      ]);

      setNhanHieuList(nh?.data || nh || []);
      setLoaiHinhList(lh?.data || lh || []);
      setNoiSanXuatList(nsx?.data || nsx || []);
    } catch {
      notificationService.error("Không thể tải dữ liệu danh mục");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await danhMucAPI.modelCar.getAll({
        ...filters,
        status: "all",
      });
      setData(res?.data || res || []);
    } catch {
      notificationService.error("Không thể tải danh sách loại xe");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã loại",
      dataIndex: "ma_loai",
      width: 120,
      render: (v) => <strong>{v}</strong>,
    },
    {
      title: "Tên loại xe",
      dataIndex: "ten_loai",
      width: 200,
    },
    {
      title: "Nhãn hiệu",
      dataIndex: "ten_nh",
      width: 150,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Loại hình",
      dataIndex: "ten_lh",
      key: "loai_hinh",
      width: 120,
    },
    {
      title: "Nơi SX",
      dataIndex: "ten_noi_sx",
      key: "noi_sx",
      width: 150,
    },

    {
      title: "Giá nhập",
      dataIndex: "gia_nhap",
      align: "right",
    },
    {
      title: "Giá bán",
      dataIndex: "gia_ban",
      align: "right",
    },
    {
      title: "VAT (%)",
      dataIndex: "vat",
      width: 90,
      align: "center",
    },
    {
      title: "Thao tác",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setEditing(record);
                setOpenModal(true);
              }}
            />
          </Tooltip>

          {authService.canEdit() && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  setEditing(record);
                  setOpenModal(true);
                }}
              />
            </Tooltip>
          )}

          {authService.canDelete() && record.status !== false && (
            <Tooltip title="Ngừng sử dụng">
              <Button
                type="link"
                danger
                icon={<StopOutlined />}
                onClick={() => handleSoftDelete(record)}
              />
            </Tooltip>
          )}

          {record.status === false && (
            <Tooltip title="Khôi phục">
              <Button
                type="link"
                icon={<RollbackOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => handleRestore(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: "center",
      render: (v) =>
        v === false ? (
          <Tag color="red">Ngừng sử dụng</Tag>
        ) : (
          <Tag color="green">Đang sử dụng</Tag>
        ),
    },
  ];
  console.log(authService.canCreate());
  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <CarOutlined /> Danh sách loại xe
          </h1>
          <p style={{ color: "#8c8c8c" }}>Quản lý các dòng xe trong hệ thống</p>
        </div>
        <Space wrap>
          <ImportButton
            module="model-car"
            title="Loại xe"
            onSuccess={fetchData}
          />
          <ExportButton
            module="vehicle-type"
            title="Loại xe"
            params={filters}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            Làm mới
          </Button>
          {authService.canCreate() && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditing(null);
                setOpenModal(true);
              }}
            >
              Thêm loại xe
            </Button>
          )}
        </Space>
      </div>

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap style={{ width: "100%" }}>
          <Select
            placeholder="Nhãn hiệu"
            allowClear
            size="small"
            style={{ width: isMobile ? "48%" : 160 }}
            onChange={(v) => setFilters({ ...filters, ma_nh: v })}
          >
            {nhanHieuList.map((nh) => (
              <Option key={nh.ma_nh} value={nh.ma_nh}>
                {nh.ten_nh}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Loại hình"
            allowClear
            size="small"
            style={{ width: isMobile ? "48%" : 160 }}
            onChange={(v) => setFilters({ ...filters, ma_lh: v })}
          >
            {loaiHinhList.map((lh) => (
              <Option key={lh.ma_lh} value={lh.ma_lh}>
                {lh.ten_lh}
              </Option>
            ))}
          </Select>

          <Search
            placeholder="Mã / tên loại..."
            allowClear
            size="small"
            style={{ width: "100%", maxWidth: isMobile ? "100%" : 250 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card size="small">
        <Table
          rowKey="ma_loai"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 800 }}
          size="small"
          pagination={{
            pageSize: 10,
            size: "small",
            showTotal: (t) => `Tổng: ${t}`,
          }}
          locale={{ emptyText: "Không có dữ liệu" }}
          rowClassName={(record) =>
            record.status === false ? "inactive-row" : ""
          }
        />
        <style>{`
          .inactive-row {
            background-color: #fafafa !important;
            color: #bfbfbf !important;
          }
          .inactive-row td {
            color: #bfbfbf !important;
          }
          .inactive-row .ant-tag {
            opacity: 0.6;
          }
        `}</style>
      </Card>

      {/* Modal */}
      <Modal
        open={openModal}
        title={editing ? "Sửa loại xe" : "Thêm loại xe"}
        footer={null}
        destroyOnClose
        onCancel={() => setOpenModal(false)}
        width={isMobile ? "100%" : 720}
        size="small"
      >
        <XeLoaiForm
          initialData={editing}
          nhanHieuList={nhanHieuList}
          loaiHinhList={loaiHinhList}
          noiSanXuatList={noiSanXuatList}
          onSuccess={() => {
            setOpenModal(false);
            fetchData();
          }}
        />
      </Modal>
    </div>
  );
};

export default XeLoaiPage;
