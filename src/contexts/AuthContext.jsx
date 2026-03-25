import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeWarehouse, setActiveWarehouse] = useState(
    () => localStorage.getItem("activeWarehouse") || null,
  );

  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const currentStatus =
          currentUser.status !== undefined
            ? currentUser.status
            : currentUser.trang_thai;
        // Kiểm tra nếu tài khoản bị khóa (false, 0, "0", "inactive")
        const isLocked =
          currentStatus === false ||
          currentStatus === 0 ||
          currentStatus === "0" ||
          String(currentStatus).toLowerCase() === "false" ||
          String(currentStatus).toLowerCase() === "inactive";

        if (isLocked) {
          authService.clearAuth();
          setUser(null);
        } else {
          setUser(currentUser);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, access_token) => {
    const currentStatus =
      userData.status !== undefined ? userData.status : userData.trang_thai;
    const isLocked =
      currentStatus === false ||
      currentStatus === 0 ||
      currentStatus === "0" ||
      String(currentStatus).toLowerCase() === "false" ||
      String(currentStatus).toLowerCase() === "inactive";

    // Kiểm tra trạng thái ngay khi login
    if (isLocked) {
      throw new Error(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      );
    }

    authService.setTokens(access_token);
    // userData phải chứa: { id, username, vai_tro, permissions?: {...}, role_id }
    authService.setUser(userData);
    setUser(userData);
    return userData;
  };

  const changeWarehouse = (ma_kho) => {
    if (ma_kho) {
      localStorage.setItem("activeWarehouse", ma_kho);
    } else {
      localStorage.removeItem("activeWarehouse");
    }
    setActiveWarehouse(ma_kho);
  };

  const logout = () => {
    authService.clearAuth();
    setUser(null);
    localStorage.removeItem("activeWarehouse");
    setActiveWarehouse(null);
  };

  const value = {
    user,
    loading,
    activeWarehouse,
    changeWarehouse,
    isAuthenticated: authService.isAuthenticated(),
    login,
    logout,

    // Permission check - hỗ trợ cả 2 dạng:
    //   hasPermission("products.view")
    //   hasPermission("products", "view")
    hasPermission: (module, action) =>
      authService.hasPermission(module, action),

    // Role check
    hasRole: (roles) => authService.hasRole(roles),

    // Shortcut helpers
    isAdmin: () => authService.isAdmin(),
    isBanHang: () => authService.isBanHang(),
    isKho: () => authService.isKho(),
    isKeToan: () => authService.isKeToan(),
    isQuanLy: () => authService.isQuanLy(),
    canManageAllWarehouses: () => authService.canManageAllWarehouses(),
    canApprove: () => authService.canApprove(),
    canViewFinancial: () => authService.canViewFinancial(),
    canViewCost: () => authService.canViewCost(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
