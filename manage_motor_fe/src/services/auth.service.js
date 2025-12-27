// src/services/auth.service.js
import { STORAGE_KEYS, USER_ROLES } from '../utils/constant';

class AuthService {
  // Get current user from localStorage
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Set user info
  setUser(user) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Set user error:', error);
      return false;
    }
  }

  // Set tokens
  setTokens(accessToken, refreshToken = null) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }
      return true;
    } catch (error) {
      console.error('Set tokens error:', error);
      return false;
    }
  }

  // Clear all auth data
  clearAuth() {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_KHO);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Check user role
  hasRole(role) {
  const user = this.getCurrentUser();
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.vai_tro);
  }

  return user.vai_tro === role;
}


  // Check if user is admin
  isAdmin() {
    return this.hasRole(USER_ROLES.ADMIN);
  }

  // Check if user is company manager
  isCompanyManager() {
    return this.hasRole(USER_ROLES.QUAN_LY_CTY);
  }

  // Check if user is branch manager
  isBranchManager() {
    return this.hasRole(USER_ROLES.QUAN_LY_CHI_NHANH);
  }

  // Check if user is employee
  isEmployee() {
    return this.hasRole(USER_ROLES.NHAN_VIEN);
  }

  // Check if user has permission for an action
  hasPermission(permission) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin has all permissions
    if (this.isAdmin()) return true;

    // Check specific permissions based on role
    if (this.isCompanyManager()) {
      // Company manager can do most things
      return true;
    }

    if (this.isBranchManager()) {
      // Branch manager has limited permissions
      const branchManagerPermissions = [
        'xe_view', 'xe_create',
        'phu_tung_view', 'phu_tung_create',
        'don_hang_view', 'don_hang_create',
        'hoa_don_view', 'hoa_don_create',
        'chuyen_kho_view', 'chuyen_kho_create'
      ];
      return branchManagerPermissions.includes(permission);
    }

    if (this.isEmployee()) {
      // Employee has basic permissions
      const employeePermissions = [
        'xe_view',
        'phu_tung_view',
        'don_hang_view',
        'hoa_don_view'
      ];
      return employeePermissions.includes(permission);
    }

    return false;
  }

  // Check if user can approve (phe duyet)
  canApprove() {
    return this.isAdmin() || this.isCompanyManager() || this.isBranchManager();
  }

  // Check if user can create
  canCreate() {
  return !!(
    this.isAdmin() ||
    this.isCompanyManager() ||
    this.isBranchManager()
  );
}


  // Check if user can edit
  canEdit() {
    return this.isAdmin() || this.isCompanyManager() || this.isBranchManager();
  }

  // Check if user can delete
  canDelete() {
    return this.isAdmin() || this.isCompanyManager();
  }

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
      // Decode JWT token (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= exp;
    } catch (error) {
      console.error('Token validation error:', error);
      return true;
    }
  }

  // Get user display name
  getUserDisplayName() {
    const user = this.getCurrentUser();
    return user?.ho_ten || user?.username || 'User';
  }

  // Get user avatar (if exists)
  getUserAvatar() {
    const user = this.getCurrentUser();
    return user?.avatar || null;
  }
}

export default new AuthService();