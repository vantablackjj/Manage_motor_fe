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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  CarOutlined,
  StopOutlined,
} from "@ant-design/icons";

import { danhMucAPI } from "../../../api";
import { notificationService, authService } from "../../../services";
import XeLoaiForm from "./XeLoaiForm";

const { Search } = Input;
const { Option } = Select;

const XeLoaiPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    ma_nh: null,
    loai_hinh: null,
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
          <p style={{ color: "#ff4d4f" }}>
            Loại xe này sẽ không thể chọn khi tạo dữ liệu mới.
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
            error?.response?.data?.message || "Không thể ngừng sử dụng loại xe"
          );
        }
      },
    });
  };

  const fetchFilterOptions = async () => {
    try {
      const [nh, lh, nsx] = await Promise.all([
        danhMucAPI.brand.getAll(),
        danhMucAPI.loaiHinh.getAll(),
        danhMucAPI.noiSanXuat.getAll(),
      ]);

      setNhanHieuList(nh || []);
      setLoaiHinhList(lh || []);
      setNoiSanXuatList(nsx || []);
    } catch {
      notificationService.error("Không thể tải dữ liệu danh mục");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await danhMucAPI.modelCar.getAll(filters);
      setData(res || []);
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
      width: 120,
    },
    {
      title: "Nơi SX",
      dataIndex: "ten_noi_sx",
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
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: "center",
      render: (v) =>
        v ? (
          <Tag color="green">Đang sử dụng</Tag>
        ) : (
          <Tag color="red">Ngừng sử dụng</Tag>
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
        <Space>
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
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Select
            placeholder="Nhãn hiệu"
            allowClear
            style={{ width: 200 }}
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
            style={{ width: 200 }}
            onChange={(v) => setFilters({ ...filters, loai_hinh: v })}
          >
            {loaiHinhList.map((lh) => (
              <Option key={lh.ma_lh} value={lh.ma_lh}>
                {lh.ten_lh}
              </Option>
            ))}
          </Select>

          <Search
            placeholder="Tìm mã / tên loại xe"
            allowClear
            style={{ width: 300 }}
            onSearch={(v) => setFilters({ ...filters, search: v })}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          rowKey="ma_loai"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 1200 }}
          locale={{ emptyText: "Không có dữ liệu" }}
        />
      </Card>

      {/* Modal */}
      <Modal
        open={openModal}
        title={editing ? "Cập nhật loại xe" : "Thêm loại xe"}
        footer={null}
        destroyOnClose
        onCancel={() => setOpenModal(false)}
        width={720}
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
