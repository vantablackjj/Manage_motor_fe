// src/services/format.service.js
// Data formatting service for display

import dayjs from "dayjs";
import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  TRANG_THAI_LABELS,
  XE_TRANG_THAI_LABELS,
  USER_ROLE_LABELS,
  LOAI_GIAO_DICH_LABELS,
  LOAI_THU_CHI_LABELS,
  HINH_THUC_THANH_TOAN_LABELS,
} from "../utils/constant";

class FormatService {
  // ===== DATE & TIME FORMATTING =====

  formatDate(date, format = DATE_FORMAT) {
    if (!date) return "-";
    return dayjs(date).format(format);
  }

  formatDateTime(date, format = DATETIME_FORMAT) {
    if (!date) return "-";
    return dayjs(date).format(format);
  }

  formatTime(date) {
    if (!date) return "-";
    return dayjs(date).format("HH:mm:ss");
  }

  formatRelativeTime(date) {
    if (!date) return "-";
    const now = dayjs();
    const target = dayjs(date);
    const diff = now.diff(target, "minute");

    if (diff < 1) return "Vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
    if (diff < 43200) return `${Math.floor(diff / 1440)} ngày trước`;

    return this.formatDate(date);
  }

  formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return "-";
    return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
  }

  // ===== CURRENCY & NUMBER FORMATTING =====

  formatCurrency(amount) {
    if (amount === null || amount === undefined) return "0 ₫";
    const numericAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  }

  formatNumber(number, decimals = 0) {
    if (number === null || number === undefined) return "0";
    const numericNumber =
      typeof number === "string" ? parseFloat(number) : number;

    return new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numericNumber);
  }

  formatPercentage(value, total) {
    if (!total || total === 0) return "0%";
    const percentage = ((value / total) * 100).toFixed(1);
    return `${percentage}%`;
  }

  formatCompactNumber(number) {
    if (!number) return "0";

    if (number >= 1000000000) {
      return `${(number / 1000000000).toFixed(1)}B`;
    }
    if (number >= 1000000) {
      return `${(number / 1000000).toFixed(1)}M`;
    }
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
  }

  // ===== STATUS FORMATTING =====

  formatTrangThai(trangThai) {
    return TRANG_THAI_LABELS[trangThai] || trangThai;
  }

  formatXeTrangThai(trangThai) {
    return XE_TRANG_THAI_LABELS[trangThai] || trangThai;
  }

  formatUserRole(role) {
    return USER_ROLE_LABELS[role] || role;
  }

  formatLoaiGiaoDich(loai) {
    return LOAI_GIAO_DICH_LABELS[loai] || loai;
  }

  formatLoaiThuChi(loai) {
    return LOAI_THU_CHI_LABELS[loai] || loai;
  }

  formatHinhThucThanhToan(hinhThuc) {
    return HINH_THUC_THANH_TOAN_LABELS[hinhThuc] || hinhThuc;
  }

  // ===== STRING FORMATTING =====

  formatPhoneNumber(phone) {
    if (!phone) return "-";

    // Format: 0xxx xxx xxx
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/);

    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }

    return phone;
  }

  formatCMND(cmnd) {
    if (!cmnd) return "-";

    // Format: xxx xxx xxx
    const cleaned = cmnd.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})$/);

    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }

    return cmnd;
  }

  formatAddress(address) {
    if (!address) return "-";
    return address.trim();
  }

  capitalizeFirst(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  capitalizeWords(str) {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => this.capitalizeFirst(word))
      .join(" ");
  }

  truncate(str, maxLength = 50) {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength) + "...";
  }

  // ===== VEHICLE FORMATTING =====

  formatSoKhung(soKhung) {
    if (!soKhung) return "-";
    // Format: XXXXX XXXX XXXX XX
    return soKhung
      .toUpperCase()
      .replace(/(.{5})(.{4})(.{4})(.{4})/, "$1 $2 $3 $4");
  }

  formatSoMay(soMay) {
    if (!soMay) return "-";
    return soMay.toUpperCase();
  }

  formatBienSo(bienSo) {
    if (!bienSo) return "-";
    // Format: 59A-12345
    return bienSo.toUpperCase().replace(/\s+/g, "");
  }

  formatXeInfo(xe) {
    if (!xe) return "-";

    const parts = [];
    if (xe.ten_loai) parts.push(xe.ten_loai);
    if (xe.ten_mau) parts.push(xe.ten_mau);
    if (xe.so_khung) parts.push(`(${this.formatSoKhung(xe.so_khung)})`);

    return parts.join(" - ");
  }

  // ===== PARTS FORMATTING =====

  formatPhuTungInfo(pt) {
    if (!pt) return "-";

    const parts = [];
    if (pt.ma_pt) parts.push(pt.ma_pt);
    if (pt.ten_pt) parts.push(pt.ten_pt);
    if (pt.don_vi_tinh) parts.push(`(${pt.don_vi_tinh})`);

    return parts.join(" - ");
  }

  // ===== WAREHOUSE FORMATTING =====

  formatKhoInfo(kho) {
    if (!kho) return "-";
    return `${kho.ma_kho} - ${kho.ten_kho}`;
  }

  // ===== CUSTOMER FORMATTING =====

  formatKhachHangInfo(kh) {
    if (!kh) return "-";

    const parts = [];
    if (kh.ma_kh) parts.push(kh.ma_kh);
    if (kh.ho_ten) parts.push(kh.ho_ten);
    if (kh.dien_thoai) parts.push(`(${this.formatPhoneNumber(kh.dien_thoai)})`);

    return parts.join(" - ");
  }

  // ===== FILE SIZE FORMATTING =====

  formatFileSize(bytes) {
    if (!bytes || bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  // ===== TRANSACTION FORMATTING =====

  formatSoPhieu(prefix, number) {
    if (!number) return "-";
    return `${prefix}-${String(number).padStart(6, "0")}`;
  }

  formatDonHangMaPhieu(maPhieu) {
    return this.formatSoPhieu("DH", maPhieu);
  }

  formatHoaDonMaPhieu(maHD) {
    return this.formatSoPhieu("HD", maHD);
  }

  formatChuyenKhoMaPhieu(maPhieu) {
    return this.formatSoPhieu("CK", maPhieu);
  }

  formatThuChiSoPhieu(soPhieu) {
    return soPhieu || "-";
  }

  // ===== INVENTORY FORMATTING =====

  formatTonKho(soLuongTon, soLuongKhoa = 0) {
    if (soLuongTon === null || soLuongTon === undefined) return "-";

    if (soLuongKhoa > 0) {
      return `${this.formatNumber(soLuongTon)} (Khóa: ${this.formatNumber(soLuongKhoa)})`;
    }

    return this.formatNumber(soLuongTon);
  }

  formatTonKhoStatus(soLuongTon, soLuongToiThieu) {
    if (soLuongTon === null || soLuongTon === undefined) return "normal";

    if (soLuongTon === 0) return "empty";
    if (soLuongTon <= soLuongToiThieu) return "low";
    return "normal";
  }

  // ===== DEBT FORMATTING =====

  formatCongNo(tongNo, daTra) {
    const conLai = tongNo - daTra;
    return {
      tongNo: this.formatCurrency(tongNo),
      daTra: this.formatCurrency(daTra),
      conLai: this.formatCurrency(conLai),
      percentage: this.formatPercentage(daTra, tongNo),
    };
  }

  // ===== ARRAY FORMATTING =====

  formatList(items, key, separator = ", ") {
    if (!Array.isArray(items) || items.length === 0) return "-";
    return items.map((item) => item[key]).join(separator);
  }

  formatOptions(items, labelKey = "label", valueKey = "value") {
    if (!Array.isArray(items)) return [];

    return items.map((item) => ({
      label: item[labelKey],
      value: item[valueKey],
    }));
  }

  // ===== TABLE FORMATTING =====

  formatTableIndex(index, page, pageSize) {
    return (page - 1) * pageSize + index + 1;
  }

  formatRowKey(item, keyField = "id") {
    return item[keyField] || `row-${Math.random()}`;
  }

  // ===== EXPORT FORMATTING =====

  formatExportFilename(prefix, extension = "xlsx") {
    const timestamp = dayjs().format("YYYYMMDD_HHmmss");
    return `${prefix}_${timestamp}.${extension}`;
  }

  // ===== SEARCH/FILTER FORMATTING =====

  formatSearchQuery(query) {
    if (!query) return "";
    return query.trim().toLowerCase();
  }

  // ===== ERROR FORMATTING =====

  formatErrorMessage(error) {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return "Đã xảy ra lỗi, vui lòng thử lại";
  }

  // ===== SUCCESS FORMATTING =====

  formatSuccessMessage(action) {
    const messages = {
      create: "Tạo mới thành công",
      update: "Cập nhật thành công",
      delete: "Xóa thành công",
      approve: "Phê duyệt thành công",
      reject: "Từ chối thành công",
      cancel: "Hủy thành công",
    };

    return messages[action] || "Thao tác thành công";
  }
}

export default new FormatService();
