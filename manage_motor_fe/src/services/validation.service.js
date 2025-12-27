// src/services/validation.service.js
// Business validation logic

class ValidationService {
  // ===== XE VALIDATION =====
  
  validateXe(xeData) {
    const errors = {};

    // Required fields
    if (!xeData.xe_key) errors.xe_key = 'Mã xe là bắt buộc';
    if (!xeData.ma_loai_xe) errors.ma_loai_xe = 'Loại xe là bắt buộc';
    if (!xeData.ma_mau) errors.ma_mau = 'Màu xe là bắt buộc';
    if (!xeData.so_khung) errors.so_khung = 'Số khung là bắt buộc';
    if (!xeData.so_may) errors.so_may = 'Số máy là bắt buộc';
    if (!xeData.ma_kho_hien_tai) errors.ma_kho_hien_tai = 'Kho hiện tại là bắt buộc';

    // Format validation
    if (xeData.so_khung && !/^[A-Z0-9]{17}$/.test(xeData.so_khung)) {
      errors.so_khung = 'Số khung phải có 17 ký tự';
    }

    if (xeData.so_may && !/^[A-Z0-9]{6,17}$/.test(xeData.so_may)) {
      errors.so_may = 'Số máy không hợp lệ (6-17 ký tự)';
    }

    // Price validation
    if (xeData.gia_nhap && xeData.gia_nhap <= 0) {
      errors.gia_nhap = 'Giá nhập phải lớn hơn 0';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateSoKhung(soKhung) {
    if (!soKhung) return { isValid: false, message: 'Số khung là bắt buộc' };
    
    const cleaned = soKhung.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length !== 17) {
      return { isValid: false, message: 'Số khung phải có 17 ký tự' };
    }

    return { isValid: true };
  }

  validateSoMay(soMay) {
    if (!soMay) return { isValid: false, message: 'Số máy là bắt buộc' };
    
    const cleaned = soMay.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length < 6 || cleaned.length > 17) {
      return { isValid: false, message: 'Số máy phải có 6-17 ký tự' };
    }

    return { isValid: true };
  }

  // ===== PHU TUNG VALIDATION =====

  validatePhuTung(ptData) {
    const errors = {};

    if (!ptData.ma_pt) errors.ma_pt = 'Mã phụ tùng là bắt buộc';
    if (!ptData.ten_pt) errors.ten_pt = 'Tên phụ tùng là bắt buộc';
    if (!ptData.don_vi_tinh) errors.don_vi_tinh = 'Đơn vị tính là bắt buộc';

    if (ptData.gia_nhap && ptData.gia_nhap <= 0) {
      errors.gia_nhap = 'Giá nhập phải lớn hơn 0';
    }

    if (ptData.gia_ban && ptData.gia_ban <= 0) {
      errors.gia_ban = 'Giá bán phải lớn hơn 0';
    }

    if (ptData.gia_nhap && ptData.gia_ban && ptData.gia_ban < ptData.gia_nhap) {
      errors.gia_ban = 'Giá bán không được thấp hơn giá nhập';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateSoLuong(soLuong, tonKho) {
    if (!soLuong || soLuong <= 0) {
      return { isValid: false, message: 'Số lượng phải lớn hơn 0' };
    }

    if (tonKho !== undefined && soLuong > tonKho) {
      return { 
        isValid: false, 
        message: `Số lượng không được vượt quá tồn kho (${tonKho})` 
      };
    }

    return { isValid: true };
  }

  // ===== DON HANG / HOA DON VALIDATION =====

  validateDonHang(donHangData) {
    const errors = {};

    if (!donHangData.ma_kho_nhap) errors.ma_kho_nhap = 'Kho nhập là bắt buộc';
    if (!donHangData.ma_ncc) errors.ma_ncc = 'Nhà cung cấp là bắt buộc';
    if (!donHangData.ngay_dat_hang) errors.ngay_dat_hang = 'Ngày đặt hàng là bắt buộc';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateHoaDon(hoaDonData) {
    const errors = {};

    if (!hoaDonData.ma_kho_xuat) errors.ma_kho_xuat = 'Kho xuất là bắt buộc';
    if (!hoaDonData.ma_kh) errors.ma_kh = 'Khách hàng là bắt buộc';
    if (!hoaDonData.ngay_ban) errors.ngay_ban = 'Ngày bán là bắt buộc';

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  validateChiTiet(chiTietList) {
    if (!Array.isArray(chiTietList) || chiTietList.length === 0) {
      return { 
        isValid: false, 
        message: 'Phải có ít nhất 1 sản phẩm trong đơn hàng' 
      };
    }

    const errors = [];
    chiTietList.forEach((item, index) => {
      if (!item.ma_pt && !item.xe_key) {
        errors.push(`Dòng ${index + 1}: Chưa chọn sản phẩm`);
      }
      if (!item.so_luong || item.so_luong <= 0) {
        errors.push(`Dòng ${index + 1}: Số lượng không hợp lệ`);
      }
      if (!item.don_gia || item.don_gia <= 0) {
        errors.push(`Dòng ${index + 1}: Đơn giá không hợp lệ`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ===== CHUYEN KHO VALIDATION =====

  validateChuyenKho(chuyenKhoData) {
    const errors = {};

    if (!chuyenKhoData.ma_kho_xuat) {
      errors.ma_kho_xuat = 'Kho xuất là bắt buộc';
    }
    if (!chuyenKhoData.ma_kho_nhap) {
      errors.ma_kho_nhap = 'Kho nhập là bắt buộc';
    }
    if (!chuyenKhoData.ngay_chuyen_kho) {
      errors.ngay_chuyen_kho = 'Ngày chuyển kho là bắt buộc';
    }

    if (chuyenKhoData.ma_kho_xuat === chuyenKhoData.ma_kho_nhap) {
      errors.ma_kho_nhap = 'Kho nhập phải khác kho xuất';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // ===== KHACH HANG VALIDATION =====

  validateKhachHang(khData) {
    const errors = {};

    if (!khData.ma_kh) errors.ma_kh = 'Mã khách hàng là bắt buộc';
    if (!khData.ho_ten) errors.ho_ten = 'Họ tên là bắt buộc';

    // Phone validation
    if (khData.dien_thoai && !/^(0|\+84)[0-9]{9}$/.test(khData.dien_thoai)) {
      errors.dien_thoai = 'Số điện thoại không hợp lệ';
    }

    // Email validation
    if (khData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(khData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    // CMND validation
    if (khData.so_cmnd && !/^[0-9]{9,12}$/.test(khData.so_cmnd)) {
      errors.so_cmnd = 'Số CMND/CCCD không hợp lệ';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // ===== KHO VALIDATION =====

  validateKho(khoData) {
    const errors = {};

    if (!khoData.ma_kho) errors.ma_kho = 'Mã kho là bắt buộc';
    if (!khoData.ten_kho) errors.ten_kho = 'Tên kho là bắt buộc';
    if (!khoData.dia_chi) errors.dia_chi = 'Địa chỉ là bắt buộc';

    if (khoData.dien_thoai && !/^(0|\+84)[0-9]{9}$/.test(khoData.dien_thoai)) {
      errors.dien_thoai = 'Số điện thoại không hợp lệ';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // ===== THU CHI VALIDATION =====

  validateThuChi(thuChiData) {
    const errors = {};

    if (!thuChiData.loai) errors.loai = 'Loại thu/chi là bắt buộc';
    if (!thuChiData.ma_kho) errors.ma_kho = 'Kho là bắt buộc';
    if (!thuChiData.so_tien) errors.so_tien = 'Số tiền là bắt buộc';
    if (thuChiData.so_tien && thuChiData.so_tien <= 0) {
      errors.so_tien = 'Số tiền phải lớn hơn 0';
    }
    if (!thuChiData.ngay_giao_dich) {
      errors.ngay_giao_dich = 'Ngày giao dịch là bắt buộc';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // ===== DATE VALIDATION =====

  validateDateRange(startDate, endDate) {
    if (!startDate || !endDate) {
      return { isValid: false, message: 'Vui lòng chọn khoảng thời gian' };
    }

    if (new Date(startDate) > new Date(endDate)) {
      return { 
        isValid: false, 
        message: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc' 
      };
    }

    return { isValid: true };
  }

  validateFutureDate(date) {
    if (!date) return { isValid: false, message: 'Ngày không hợp lệ' };
    
    if (new Date(date) <= new Date()) {
      return { isValid: false, message: 'Ngày phải trong tương lai' };
    }

    return { isValid: true };
  }

  validatePastDate(date) {
    if (!date) return { isValid: false, message: 'Ngày không hợp lệ' };
    
    if (new Date(date) >= new Date()) {
      return { isValid: false, message: 'Ngày phải trong quá khứ' };
    }

    return { isValid: true };
  }

  // ===== PRICE VALIDATION =====

  validatePriceRange(giaNhap, giaBan) {
    if (giaNhap && giaBan && giaBan < giaNhap) {
      return { 
        isValid: false, 
        message: 'Giá bán không được thấp hơn giá nhập' 
      };
    }

    return { isValid: true };
  }

  validateDiscount(discount, total) {
    if (discount < 0) {
      return { isValid: false, message: 'Chiết khấu không được âm' };
    }

    if (discount > total) {
      return { 
        isValid: false, 
        message: 'Chiết khấu không được lớn hơn tổng tiền' 
      };
    }

    return { isValid: true };
  }

  // ===== WORKFLOW VALIDATION =====

  canSendForApproval(trangThai) {
    return trangThai === 'NHAP';
  }

  canApprove(trangThai) {
    return trangThai === 'GUI_DUYET';
  }

  canEdit(trangThai) {
    return trangThai === 'NHAP' || trangThai === 'TU_CHOI';
  }

  canDelete(trangThai) {
    return trangThai === 'NHAP' || trangThai === 'TU_CHOI';
  }

  canCancel(trangThai) {
    return trangThai !== 'DA_DUYET' && trangThai !== 'DA_HUY';
  }
}

export default new ValidationService();