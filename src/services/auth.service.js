// src/services/auth.service.js
import { STORAGE_KEYS, USER_ROLES } from "../utils/constant";
import { getPermissionsForRole } from "../utils/rolePermissions";

class AuthService {
  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      if (!userStr) return null;
      const user = JSON.parse(userStr);

      // Robustly set vai_tro if missing but roles array exists
      if (!user.vai_tro && user.roles && user.roles.length > 0) {
        user.vai_tro = user.roles[0].ma_quyen;
      }
      return user;
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
    const userRole = (user.vai_tro || "").toUpperCase();
    
    // ADMIN luôn có tất cả quyền
    if (userRole === "ADMIN") return true;

    // Hardcoded security block: Deny approve permission for BAN_HANG, NHAN_VIEN, KHO, WAREHOUSE
    const restrictedRoles = ["BAN_HANG", "NHAN_VIEN", "SALE", "KHO", "WAREHOUSE", "STAFF"];
    if (
      restrictedRoles.includes(userRole) &&
        ((typeof moduleOrPermStr === "string" && moduleOrPermStr.includes(".approve")) || 
         action === "approve")
    ) {
      return false;
    }

    // Lấy permissions mặc định cho role
    const defaultPermissions = getPermissionsForRole(userRole);

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
    // Mapping of modern prefixes to their legacy counterparts
    const legacyMap = {
      sales_orders: "don_hang_ban_xe",
      purchase_orders: "don_hang_mua_xe",
      reports: "bao_cao",
      inventory: "ton_kho",
    };

    const checkModPerm = (mod, act) => {
      const modPerms = permissions[mod];
      if (typeof modPerms === "boolean") return modPerms;
      return !!(modPerms && modPerms[act]);
    };

    // Dạng gọi: hasPermission("products.view")
    if (
      (action === null || action === undefined) &&
      typeof moduleOrPermStr === "string" &&
      moduleOrPermStr.includes(".")
    ) {
      const [mod, act] = moduleOrPermStr.split(".");
      hasPerm = checkModPerm(mod, act);

      // Check legacy counterpart if not found
      if (!hasPerm && legacyMap[mod]) {
        hasPerm = checkModPerm(legacyMap[mod], act);
      }
      // Check reverse (if mod was legacy)
      if (!hasPerm) {
        const modernMod = Object.keys(legacyMap).find(
          (key) => legacyMap[key] === mod,
        );
        if (modernMod) {
          hasPerm = checkModPerm(modernMod, act);
        }
      }
    }
    // Dạng gọi: hasPermission("products", "view")
    else if (action !== null && action !== undefined) {
      hasPerm = checkModPerm(moduleOrPermStr, action);

      // Check legacy counterpart if not found
      if (!hasPerm && legacyMap[moduleOrPermStr]) {
        hasPerm = checkModPerm(legacyMap[moduleOrPermStr], action);
      }
      // Check reverse
      if (!hasPerm) {
        const modernMod = Object.keys(legacyMap).find(
          (key) => legacyMap[key] === moduleOrPermStr,
        );
        if (modernMod) {
          hasPerm = checkModPerm(modernMod, action);
        }
      }
    }

    // DEBUG LOGGING for the user to troubleshoot
    console.groupCollapsed(`[Permission Check] ${moduleOrPermStr}.${action || ""}`);
    console.log("User Role:", userRole);
    console.log("Result:", hasPerm);
    console.log("Full Permissions Object:", permissions);
    console.groupEnd();

    return hasPerm;
  }

  // ============================================================
  // SHORTCUT HELPERS
  // ============================================================

  /** Có thể phê duyệt đơn hàng không */
  canApprove() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const userRole = (user.vai_tro || "").toUpperCase();
    if (userRole === "ADMIN" || userRole === "QUAN_LY") return true;
    
    // Safety block for Sales and Warehouse roles
    const restrictedRoles = ["BAN_HANG", "NHAN_VIEN", "SALE", "KHO", "WAREHOUSE", "STAFF"];
    if (restrictedRoles.includes(userRole)) return false;

    // Kiểm tra xem có bất kỳ module nào có quyền "approve" không
    if (!user.permissions) return false;
    const permissions = user.permissions;
    return Object.keys(permissions).some((mod) => {
      const p = permissions[mod];
      return p === true || (p && typeof p === "object" && p.approve === true);
    });
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
