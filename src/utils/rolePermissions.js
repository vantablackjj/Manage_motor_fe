// src/utils/rolePermissions.js
// Ma trận phân quyền cứng (hardcoded) cho từng role
// Dùng khi backend chưa trả về permissions trong user response
// Khi backend có sẵn permissions, authService sẽ ưu tiên lấy từ server

export const ROLE_PERMISSIONS = {
  ADMIN: {
    users: { view: true, create: true, edit: true, delete: true },
    roles: { view: true, create: true, edit: true, delete: true },
    warehouses: { view: true, create: true, edit: true, delete: true },
    products: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
      view_cost: true,
    },
    partners: { view: true, create: true, edit: true, delete: true },
    purchase_orders: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
    },
    sales_orders: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
    },
    invoices: { view: true, create: true, edit: true, delete: true },
    inventory: {
      view: true,
      import: true,
      export: true,
      transfer: true,
      adjust: true,
    },
    debt: { view: true, create: true, edit: true, delete: true },
    payments: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
    },
    reports: { view: true, export: true, view_financial: true },
    settings: { view: true, edit: true },
  },

  BAN_HANG: {
    users: { view: true },
    roles: { view: false },
    warehouses: { view: true },
    products: {
      view: true,
      create: false,
      edit: false,
      view_cost: false,
    },
    partners: { view: true, create: true, edit: true },
    purchase_orders: {
      view: true,
      create: true,
      edit: true,
    },
    sales_orders: {
      view: true,
      create: true,
      edit: true,
      approve: true, // Thêm quyền approve để tránh lỗi khi xem chi tiết
    },
    invoices: { view: true, create: true, edit: true },
    inventory: {
      view: true,
      import: true,
      export: true,
      transfer: true,
    },
    debt: { view: true, create: true },
    payments: {
      view: true,
      create: true,
    },
    reports: { view: true, export: true, view_financial: false },
    settings: { view: false },
  },

  NHAN_VIEN: {
    // Copy permissions from BAN_HANG to ensure matching regardless of normalization
    users: { view: true },
    roles: { view: false },
    warehouses: { view: true },
    products: {
      view: true,
      create: false,
      edit: false,
      view_cost: false,
    },
    partners: { view: true, create: true, edit: true },
    purchase_orders: {
      view: true,
      create: true,
      edit: true,
    },
    sales_orders: {
      view: true,
      create: true,
      edit: true,
      approve: true,
    },
    invoices: { view: true, create: true, edit: true },
    inventory: {
      view: true,
      import: true,
      export: true,
      transfer: true,
    },
    debt: { view: true, create: true },
    payments: {
      view: true,
      create: true,
    },
    reports: { view: true, export: true, view_financial: false },
    settings: { view: false },
  },

  KHO: {
    users: { view: false },
    roles: { view: false },
    warehouses: { view: true, create: true, edit: true },
    products: {
      view: true,
      create: true,
      edit: true,
      view_cost: true,
    },
    partners: { view: true, create: true, edit: true },
    purchase_orders: {
      view: true,
      create: true,
      edit: true,
    },
    sales_orders: {
      view: true,
      create: true,
      edit: true,
    },
    invoices: { view: true, create: true },
    inventory: {
      view: true,
      import: true,
      export: true,
      transfer: true,
      adjust: true,
    },
    debt: { view: false },
    payments: { view: false },
    reports: { view: true, export: true, view_financial: false },
    settings: { view: false },
  },

  KE_TOAN: {
    users: { view: true },
    roles: { view: false },
    warehouses: { view: true },
    products: { view: true, edit: true, view_cost: true },
    partners: { view: true, create: true, edit: true },
    purchase_orders: { view: true, create: true, edit: true, approve: true },
    sales_orders: { view: true, edit: true, approve: true },
    invoices: { view: true, create: true, edit: true },
    inventory: { view: true, import: true, export: true },
    debt: { view: true, create: true, edit: true, delete: true },
    payments: {
      view: true,
      create: true,
      edit: true,
      delete: true,
      approve: true,
    },
    reports: { view: true, export: true, view_financial: true },
    settings: { view: true },
  },

  QUAN_LY: {
    users: { view: true, create: true, edit: true },
    roles: { view: true },
    warehouses: { view: true, create: true, edit: true },
    products: {
      view: true,
      create: true,
      edit: true,
      approve: true,
      view_cost: true,
    },
    partners: { view: true, create: true, edit: true, delete: true },
    purchase_orders: {
      view: true,
      create: true,
      edit: true,
      approve: true,
    },
    sales_orders: {
      view: true,
      create: true,
      edit: true,
      approve: true,
    },
    invoices: { view: true, create: true, edit: true },
    inventory: {
      view: true,
      import: true,
      export: true,
      transfer: true,
      adjust: true,
    },
    debt: { view: true, create: true, edit: true },
    payments: {
      view: true,
      create: true,
      edit: true,
      approve: true,
    },
    reports: { view: true, export: true, view_financial: true },
    settings: { view: true, edit: true },
  },
};

/**
 * Lấy permissions cho một role cụ thể
 * @param {string} vai_tro - Role name (ADMIN, BAN_HANG, KHO, KE_TOAN, QUAN_LY)
 * @returns {Object} permissions object
 */
export const getPermissionsForRole = (vai_tro) => {
  // Normalize legacy role names
  const roleMap = {
    QUAN_LY_CTY: "QUAN_LY",
    QUAN_LY_CHI_NHANH: "QUAN_LY",
    NHAN_VIEN: "BAN_HANG",
  };
  const normalizedRole = roleMap[vai_tro] || vai_tro;
  return ROLE_PERMISSIONS[normalizedRole] || {};
};

export default ROLE_PERMISSIONS;
