// src/services/auth.service.js
import { STORAGE_KEYS, USER_ROLES } from "../utils/constant";
import { getPermissionsForRole } from "../utils/rolePermissions";

class AuthService {
  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Get refresh token
  getRefreshToken() {
    // Refresh token is now handled via HTTP-only cookies
    return null;
  }

  // Set user info
  setUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Set user error:", error);
      return false;
    }
  }

  // Set tokens
  setTokens(accessToken, refreshToken = null) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      // refreshToken is now handled via HTTP-only cookies from the server
      return true;
    } catch (error) {
      console.error("Set tokens error:", error);
      return false;
    }
  }

  // Clear all auth data
  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_KHO);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // ============================================================
  // ROLE CHECKS
  // ============================================================

  /**
   * Kiểm tra user có role(s) chỉ định không
   * @param {string|string[]} roles - role name hoặc mảng role names
   */
  hasRole(roles) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Normalize user role
    const roleMap = {
      QUAN_LY_CTY: "QUAN_LY",
      QUAN_LY_CHI_NHANH: "QUAN_LY",
      STAFF: "NHAN_VIEN",
      NHAN_VIEN: "NHAN_VIEN",
      MANAGER: "QUAN_LY",
      WAREHOUSE: "KHO",
      KHO: "KHO",
      KE_TOAN: "KE_TOAN",
      ACCOUNTANT: "KE_TOAN",
      ADMIN: "ADMIN",
    };
    const userRole = (user.vai_tro || "").toUpperCase();
    const normalizedUserRole = roleMap[userRole] || userRole;

    if (Array.isArray(roles)) {
      return roles.some((role) => {
        const r = (role || "").toUpperCase();
        const normalizedRole = roleMap[r] || r;
        return normalizedUserRole === normalizedRole;
      });
    }

    const targetRole = (roles || "").toUpperCase();
    const normalizedTargetRole = roleMap[targetRole] || targetRole;
    return normalizedUserRole === normalizedTargetRole;
  }

  isAdmin() {
    return this.hasRole("ADMIN");
  }
  isBanHang() {
    return this.hasRole("BAN_HANG");
  }
  isKho() {
    return this.hasRole("KHO");
  }
  isKeToan() {
    return this.hasRole("KE_TOAN");
  }
  isQuanLy() {
    return this.hasRole("QUAN_LY");
  }

  // Legacy aliases (backward compat)
  isCompanyManager() {
    return this.isQuanLy();
  }
  isBranchManager() {
    return this.isQuanLy();
  }
  isEmployee() {
    return this.isBanHang();
  }

  // ============================================================
  // PERMISSION CHECKS (JSONB-based)
  // ============================================================

  /**
   * Kiểm tra permission dạng "module.action" hoặc (module, action)
   *
   * Cách dùng:
   *   hasPermission("products.view")          → true/false
   *   hasPermission("products", "view")       → true/false
   *
   * Ưu tiên lấy permissions từ user object (server trả về),
   * fallback về map cứng trong rolePermissions.js
   *
   * @param {string} moduleOrPermStr - tên module hoặc chuỗi "module.action"
   * @param {string|null} action     - tên action (nếu không encode trong param 1)
   */
  hasPermission(moduleOrPermStr, action = null) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Normalize user role mapping
    const roleAliasMap = {
      QUAN_LY_CTY: "QUAN_LY",
      QUAN_LY_CHI_NHANH: "QUAN_LY",
      STAFF: "NHAN_VIEN",
      NHAN_VIEN: "NHAN_VIEN",
      MANAGER: "QUAN_LY",
      WAREHOUSE: "KHO",
      KHO: "KHO",
      KE_TOAN: "KE_TOAN",
      ACCOUNTANT: "KE_TOAN",
      BAN_HANG: "BAN_HANG",
      ADMIN: "ADMIN",
    };
    const rawRole = (user.vai_tro || "").toUpperCase();
    const userRole = roleAliasMap[rawRole] || rawRole;

    // ADMIN luôn có tất cả quyền
    if (userRole === "ADMIN") return true;

    // Hardcoded safety block for sensitive modules
    const sensitiveActions = ["create", "edit", "delete", "approve"];
    if (
      (userRole === "KHO" ||
        userRole === "BAN_HANG" ||
        userRole === "NHAN_VIEN") &&
      moduleOrPermStr.includes("warehouses") &&
      sensitiveActions.some(
        (act) =>
          action === act ||
          (typeof moduleOrPermStr === "string" &&
            moduleOrPermStr.endsWith("." + act)),
      )
    ) {
      return false; // Explicitly block warehouse modifications for these roles
    }

    // Special Case: Allow sales_orders.create for all staff roles regardless of granular permission object
    // This is a safety measure to ensure the "Create Slip" functionality is always available to authorized staff.
    if (
      moduleOrPermStr === "sales_orders.create" ||
      (moduleOrPermStr === "sales_orders" && action === "create")
    ) {
      if (this.hasRole(["ADMIN", "QUAN_LY", "BAN_HANG", "KHO", "NHAN_VIEN"])) {
        return true;
      }
    }

    // Lấy permissions mặc định cho role
    const defaultPermissions = getPermissionsForRole(userRole);

    // Merge default permissions with user permissions
    // Cần merge sâu ít nhất 1 cấp để không làm mất các action khi module bị ghi đè
    const permissions = { ...defaultPermissions };

    if (user.permissions && typeof user.permissions === "object") {
      Object.keys(user.permissions).forEach((modKey) => {
        if (
          permissions[modKey] &&
          typeof user.permissions[modKey] === "object" &&
          user.permissions[modKey] !== null
        ) {
          permissions[modKey] = {
            ...permissions[modKey],
            ...user.permissions[modKey],
          };
        } else {
          permissions[modKey] = user.permissions[modKey];
        }
      });
    }

    let hasPerm = false;
    // Dạng gọi: hasPermission("products.view")
    if (
      (action === null || action === undefined) &&
      typeof moduleOrPermStr === "string" &&
      moduleOrPermStr.includes(".")
    ) {
      const [mod, act] = moduleOrPermStr.split(".");
      const modPerms = permissions[mod];
      if (typeof modPerms === "boolean") {
        hasPerm = modPerms;
      } else {
        hasPerm = !!(modPerms && modPerms[act]);
      }
    }
    // Dạng gọi: hasPermission("products", "view")
    else if (action !== null && action !== undefined) {
      const modPerms = permissions[moduleOrPermStr];
      if (typeof modPerms === "boolean") {
        hasPerm = modPerms;
      } else {
        hasPerm = !!(modPerms && modPerms[action]);
      }
    }

    if (!hasPerm && import.meta.env.DEV) {
      console.warn(
        `[Permission Check] Access to "${moduleOrPermStr}${action ? "." + action : ""}" denied for role: ${user.vai_tro}`,
      );
    }

    return hasPerm;
  }

  // ============================================================
  // SHORTCUT HELPERS
  // ============================================================

  /** Có thể phê duyệt đơn hàng không */
  canApprove() {
    return this.hasRole(["ADMIN", "QUAN_LY", "KE_TOAN"]);
  }

  /** Có thể xem báo cáo tài chính không */
  canViewFinancial() {
    return this.hasPermission("reports", "view_financial");
  }

  /** Có thể xem giá nhập (giá vốn) không */
  canViewCost() {
    return this.hasPermission("products", "view_cost");
  }

  /** Có thể tạo mới không (legacy, dùng hasPermission thay thế) */
  canCreate() {
    return this.hasRole(["ADMIN", "QUAN_LY"]);
  }

  /** Có thể chỉnh sửa không (legacy) */
  canEdit() {
    return this.hasRole(["ADMIN", "QUAN_LY"]);
  }

  /** Có thể xóa không (legacy) */
  canDelete() {
    return this.hasRole(["ADMIN", "QUAN_LY"]);
  }

  // ============================================================
  // UTILITY
  // ============================================================

  // Get user's default warehouse
  getDefaultWarehouse() {
    const user = this.getCurrentUser();
    return user?.ma_kho || localStorage.getItem(STORAGE_KEYS.CURRENT_KHO);
  }

  // Set current warehouse
  setCurrentWarehouse(ma_kho) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_KHO, ma_kho);
  }

  // Validate token expiry
  isTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp;
    } catch (error) {
      console.error("Token validation error:", error);
      return true;
    }
  }

  // Get user display name
  getUserDisplayName() {
    const user = this.getCurrentUser();
    return user?.ho_ten || user?.username || "User";
  }

  // Get user avatar (if exists)
  getUserAvatar() {
    const user = this.getCurrentUser();
    return user?.avatar || null;
  }
}

export default new AuthService();
