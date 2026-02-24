// src/hooks/usePermission.js
// Custom hook tái sử dụng để kiểm tra permissions trong components
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook tiện ích để kiểm tra quyền trong components
 *
 * Cách dùng:
 *   const { canCreateSales, canViewCostPrice, can } = usePermission();
 *
 *   {canCreateSales() && <Button onClick={handleCreate}>Tạo đơn bán</Button>}
 *   {canViewCostPrice() && <span>Giá nhập: {gia_nhap}</span>}
 *   {can('products', 'approve') && <Button>Phê duyệt</Button>}
 */
export const usePermission = () => {
  const { hasPermission, hasRole, user } = useAuth();

  return {
    // === USERS ===
    canViewUsers: () => hasPermission("users", "view"),
    canCreateUsers: () => hasPermission("users", "create"),
    canEditUsers: () => hasPermission("users", "edit"),
    canDeleteUsers: () => hasPermission("users", "delete"),

    // === WAREHOUSES ===
    canViewWarehouses: () => hasPermission("warehouses", "view"),
    canCreateWarehouses: () => hasPermission("warehouses", "create"),
    canEditWarehouses: () => hasPermission("warehouses", "edit"),

    // === PRODUCTS ===
    canViewProducts: () => hasPermission("products", "view"),
    canCreateProducts: () => hasPermission("products", "create"),
    canEditProducts: () => hasPermission("products", "edit"),
    canDeleteProducts: () => hasPermission("products", "delete"),
    canApproveProducts: () => hasPermission("products", "approve"),
    canViewCostPrice: () => hasPermission("products", "view_cost"),

    // === PARTNERS ===
    canViewPartners: () => hasPermission("partners", "view"),
    canCreatePartners: () => hasPermission("partners", "create"),
    canEditPartners: () => hasPermission("partners", "edit"),
    canDeletePartners: () => hasPermission("partners", "delete"),

    // === PURCHASE ORDERS ===
    canViewPurchase: () => hasPermission("purchase_orders", "view"),
    canCreatePurchase: () => hasPermission("purchase_orders", "create"),
    canEditPurchase: () => hasPermission("purchase_orders", "edit"),
    canDeletePurchase: () => hasPermission("purchase_orders", "delete"),
    canApprovePurchase: () => hasPermission("purchase_orders", "approve"),

    // === SALES ORDERS ===
    canViewSales: () => hasPermission("sales_orders", "view"),
    canCreateSales: () => hasPermission("sales_orders", "create"),
    canEditSales: () => hasPermission("sales_orders", "edit"),
    canDeleteSales: () => hasPermission("sales_orders", "delete"),
    canApproveSales: () => hasPermission("sales_orders", "approve"),

    // === INVOICES ===
    canViewInvoices: () => hasPermission("invoices", "view"),
    canCreateInvoices: () => hasPermission("invoices", "create"),
    canEditInvoices: () => hasPermission("invoices", "edit"),
    canDeleteInvoices: () => hasPermission("invoices", "delete"),

    // === INVENTORY ===
    canViewInventory: () => hasPermission("inventory", "view"),
    canImportInventory: () => hasPermission("inventory", "import"),
    canExportInventory: () => hasPermission("inventory", "export"),
    canTransferInventory: () => hasPermission("inventory", "transfer"),
    canAdjustInventory: () => hasPermission("inventory", "adjust"),

    // === DEBT ===
    canViewDebt: () => hasPermission("debt", "view"),
    canCreateDebt: () => hasPermission("debt", "create"),
    canEditDebt: () => hasPermission("debt", "edit"),
    canDeleteDebt: () => hasPermission("debt", "delete"),

    // === PAYMENTS ===
    canViewPayments: () => hasPermission("payments", "view"),
    canCreatePayments: () => hasPermission("payments", "create"),
    canEditPayments: () => hasPermission("payments", "edit"),
    canDeletePayments: () => hasPermission("payments", "delete"),
    canApprovePayments: () => hasPermission("payments", "approve"),

    // === REPORTS ===
    canViewReports: () => hasPermission("reports", "view"),
    canExportReports: () => hasPermission("reports", "export"),
    canViewFinancialReports: () => hasPermission("reports", "view_financial"),

    // === SETTINGS ===
    canViewSettings: () => hasPermission("settings", "view"),
    canEditSettings: () => hasPermission("settings", "edit"),

    // === TỔNG HỢP ===
    /** Phê duyệt bất kỳ đơn nào (ADMIN, QUAN_LY, KE_TOAN) */
    canApproveAnything: () => hasRole(["ADMIN", "QUAN_LY", "KE_TOAN"]),

    // === GENERIC ===
    /** Gọi trực tiếp: can('products', 'view') hoặc can('products.view') */
    can: (module, action) => hasPermission(module, action),

    // === Role info ===
    role: user?.vai_tro,
    user,
    isAdmin: () => hasRole("ADMIN"),
    isQuanLy: () => hasRole("QUAN_LY"),
    isKeToan: () => hasRole("KE_TOAN"),
    isKho: () => hasRole("KHO"),
    isBanHang: () => hasRole("BAN_HANG"),
  };
};

export default usePermission;
