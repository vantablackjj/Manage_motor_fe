const permission = {
  read: ["ADMIN", "MANAGER", "STAFF"],
  create: ["ADMIN", "MANAGER"],
  update: ["ADMIN", "MANAGER"],
  delete: ["ADMIN"],
};

export const MASTER_DATA_CONFIG = {
  loaiHinh: {
    title: "Loại hình xe",
    resource: "loai-hinh",
    permission: permission,
    columns: [
      { key: "id", label: "id", required: true },
      { key: "ten_lh", label: "Tên loại hình", required: true },
      { key: "ma_lh", label: "Mã loại hình", required: true },
    ],
  },
  mau: {
    title: "Màu",
    resource: "color",
    exportModule: "color",
    permission: permission,
    columns: [
      { key: "ten_mau", label: "Tên màu", required: true },
      { key: "ma_mau", label: "Mã", required: true },
      { key: "gia_tri", label: "Mã Màu", required: true },
    ],
  },
  noiSX: {
    title: "Nơi sản xuất",
    resource: "noi-sx",
    exportModule: "origin",
    permission: permission,
    columns: [
      { key: "id", label: "id", required: true },
      { key: "ma", label: "Quốc gia", required: true },
      { key: "ten_noi_sx", label: "Nơi Sản Xuất", required: true },
    ],
  },
  nhanHieu: {
    title: "Nhãn hiệu xe",
    resource: "brand",
    exportModule: "brand",
    permission: permission,
    columns: [
      { key: "id", label: "id", required: true },
      { key: "ma_nh", label: "Mã Nhãn Hiệu", required: true },
      { key: "ten_nh", label: "Tên Nhãn Hiệu", required: true },
    ],
  },

  khachHang: {
    title: "Khách Hàng",
    resource: "khach-hang",
    exportModule: "customer",
    permission: permission,
    columns: [
      { key: "id", label: "id", required: true },
      { key: "ma_kh", label: "Mã Khách Hàng", required: true },
      { key: "ho_ten", label: "Khách Hàng", required: true },
      { key: "dai_dien", label: "Đại Diện", required: true },
      { key: "dia_chi", label: "Địa Chỉ", required: true },
      { key: "dien_thoai", label: "Điện Thoại", required: true },
      { key: "email", label: "Email", required: true },
      { key: "ngay_sinh", label: "Ngày Sinh", required: true },
      { key: "ma_so_thue", label: "Mã Số Thuế" },
      { key: "so_cmnd", label: "Số CMND", required: true },
      {
        key: "bang_lai",
        label: "Bằng Lái",
        required: true,
        type: "select",
        options: [
          { label: "true", value: "true" },
          { label: "false", value: "false" },
        ],
      },
    ],
  },
  users: {
    title: "Nhân Viên",
    resource: "users",
    permission: permission,
    columns: [
      { key: "id", label: "id", required: true },
      { key: "username", label: "Nhân Viên", required: true },
      { key: "ho_ten", label: "Họ Tên", required: true },
      { key: "vai_tro", label: "Vai Trò", required: true },
      { key: "ma_kho", label: "Mã Kho", required: true },
      { key: "ten_kho", label: "Tên Kho", required: true },

      { key: "dien_thoai", label: "Điện Thoại", required: true },
    ],
  },
  kho: {
    title: "Kho",
    resource: "kho",
    exportModule: "warehouse",
    permission: permission,
    columns: [
      { key: "ma_kho", label: "Mã Kho", required: true },
      { key: "ten_kho", label: "Kho", required: true },
      { key: "dia_chi", label: "Địa Chỉ", required: true },
      { key: "dien_thoai", label: "Điện Thoại", required: true },

      { key: "ngay_cap_nhat", label: "Ngày Cập Nhật", required: true },
      {
        key: "loai_kho",
        label: "Loại kho",
        required: true,
        type: "select",
        render: (_, record) => {
          if (record.chinh) return "Kho chính";
          if (record.daily) return "Kho phụ";
          return "-";
        },
        options: [
          { label: "Kho chính", value: "CHINH" },
          { label: "Kho phụ", value: "DAILY" },
        ],
      },
    ],
  },
};
