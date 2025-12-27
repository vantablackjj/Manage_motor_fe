// src/utils/validators.js
// Validation rules for forms

export const validators = {
  // Required field
  required: (message = 'Trường này là bắt buộc') => ({
    required: true,
    message
  }),

  // Email validation
  email: (message = 'Email không hợp lệ') => ({
    type: 'email',
    message
  }),

  // Phone number validation (Vietnamese)
  phone: (message = 'Số điện thoại không hợp lệ') => ({
    pattern: /^(0|\+84)[0-9]{9}$/,
    message
  }),

  // CMND/CCCD validation
  cmnd: (message = 'Số CMND/CCCD không hợp lệ') => ({
    pattern: /^[0-9]{9,12}$/,
    message
  }),

  // Min length
  minLength: (min, message) => ({
    min,
    message: message || `Tối thiểu ${min} ký tự`
  }),

  // Max length
  maxLength: (max, message) => ({
    max,
    message: message || `Tối đa ${max} ký tự`
  }),

  // Min value
  minValue: (min, message) => ({
    type: 'number',
    min,
    message: message || `Giá trị tối thiểu là ${min}`
  }),

  // Max value
  maxValue: (max, message) => ({
    type: 'number',
    max,
    message: message || `Giá trị tối đa là ${max}`
  }),

  // Number only
  number: (message = 'Chỉ được nhập số') => ({
    pattern: /^[0-9]+$/,
    message
  }),

  // Positive number
  positiveNumber: (message = 'Phải là số dương') => ({
    validator: (_, value) => {
      if (!value || parseFloat(value) > 0) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  // URL validation
  url: (message = 'URL không hợp lệ') => ({
    type: 'url',
    message
  }),

  // Password validation
  password: (message = 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số') => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    message
  }),

  // Confirm password
  confirmPassword: (getFieldValue, message = 'Mật khẩu xác nhận không khớp') => ({
    validator: (_, value) => {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  // Username validation
  username: (message = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới') => ({
    pattern: /^[a-zA-Z0-9_]{4,20}$/,
    message
  }),

  // Vehicle frame number (so khung)
  soKhung: (message = 'Số khung không hợp lệ') => ({
    pattern: /^[A-Z0-9]{17}$/,
    message
  }),

  // Vehicle engine number (so may)
  soMay: (message = 'Số máy không hợp lệ') => ({
    pattern: /^[A-Z0-9]{6,17}$/,
    message
  }),

  // License plate (bien so)
  bienSo: (message = 'Biển số xe không hợp lệ') => ({
    pattern: /^[0-9]{2}[A-Z]{1,2}[-\s]?[0-9]{4,5}$/,
    message
  }),

  // Date validation
  date: (message = 'Ngày không hợp lệ') => ({
    type: 'date',
    message
  }),

  // Date range validation
  dateRange: (message = 'Khoảng thời gian không hợp lệ') => ({
    validator: (_, value) => {
      if (!value || (value[0] && value[1] && value[0].isBefore(value[1]))) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  // Future date validation
  futureDate: (message = 'Ngày phải trong tương lai') => ({
    validator: (_, value) => {
      if (!value || value.isAfter(new Date())) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  // Past date validation
  pastDate: (message = 'Ngày phải trong quá khứ') => ({
    validator: (_, value) => {
      if (!value || value.isBefore(new Date())) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(message));
    }
  }),

  // File size validation
  fileSize: (maxSize, message) => ({
    validator: (_, value) => {
      if (!value || !value.size || value.size <= maxSize) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error(message || `Kích thước file không được vượt quá ${maxSize / 1024 / 1024}MB`)
      );
    }
  }),

  // File type validation
  fileType: (allowedTypes, message) => ({
    validator: (_, value) => {
      if (!value || !value.type || allowedTypes.includes(value.type)) {
        return Promise.resolve();
      }
      return Promise.reject(
        new Error(message || `Chỉ chấp nhận file: ${allowedTypes.join(', ')}`)
      );
    }
  }),

  // Whitespace validation
  noWhitespace: (message = 'Không được chứa khoảng trắng') => ({
    whitespace: true,
    message
  }),

  // Alphanumeric validation
  alphanumeric: (message = 'Chỉ được chứa chữ cái và số') => ({
    pattern: /^[a-zA-Z0-9]+$/,
    message
  }),

  // Vietnamese text validation
  vietnamese: (message = 'Chỉ được nhập tiếng Việt') => ({
    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
    message
  }),

  // Custom validator
  custom: (validatorFn, message) => ({
    validator: validatorFn,
    message
  })
};

// Common validation rules for forms
export const formRules = {
  // Login
  login: {
    username: [
      validators.required('Vui lòng nhập tên đăng nhập'),
      validators.minLength(4, 'Tên đăng nhập phải có ít nhất 4 ký tự')
    ],
    password: [
      validators.required('Vui lòng nhập mật khẩu'),
      validators.minLength(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    ]
  },

  // User
  user: {
    username: [
      validators.required('Vui lòng nhập tên đăng nhập'),
      validators.username()
    ],
    password: [
      validators.required('Vui lòng nhập mật khẩu'),
      validators.password()
    ],
    ho_ten: [
      validators.required('Vui lòng nhập họ tên'),
      validators.minLength(2, 'Họ tên phải có ít nhất 2 ký tự')
    ],
    email: [
      validators.email()
    ],
    vai_tro: [
      validators.required('Vui lòng chọn vai trò')
    ]
  },

  // Xe
  xe: {
    xe_key: [
      validators.required('Vui lòng nhập mã xe'),
      validators.alphanumeric()
    ],
    ma_loai_xe: [
      validators.required('Vui lòng chọn loại xe')
    ],
    ma_mau: [
      validators.required('Vui lòng chọn màu')
    ],
    so_khung: [
      validators.required('Vui lòng nhập số khung'),
      validators.soKhung()
    ],
    so_may: [
      validators.required('Vui lòng nhập số máy'),
      validators.soMay()
    ],
    gia_nhap: [
      validators.required('Vui lòng nhập giá nhập'),
      validators.positiveNumber()
    ]
  },

  // Phu tung
  phuTung: {
    ma_pt: [
      validators.required('Vui lòng nhập mã phụ tùng'),
      validators.alphanumeric()
    ],
    ten_pt: [
      validators.required('Vui lòng nhập tên phụ tùng'),
      validators.minLength(2)
    ],
    don_vi_tinh: [
      validators.required('Vui lòng nhập đơn vị tính')
    ],
    gia_nhap: [
      validators.required('Vui lòng nhập giá nhập'),
      validators.positiveNumber()
    ],
    gia_ban: [
      validators.required('Vui lòng nhập giá bán'),
      validators.positiveNumber()
    ]
  },

  // Khach hang
  khachHang: {
    ma_kh: [
      validators.required('Vui lòng nhập mã khách hàng'),
      validators.alphanumeric()
    ],
    ho_ten: [
      validators.required('Vui lòng nhập họ tên'),
      validators.minLength(2)
    ],
    dien_thoai: [
      validators.phone()
    ],
    email: [
      validators.email()
    ],
    so_cmnd: [
      validators.cmnd()
    ]
  },

  // Kho
  kho: {
    ma_kho: [
      validators.required('Vui lòng nhập mã kho'),
      validators.alphanumeric()
    ],
    ten_kho: [
      validators.required('Vui lòng nhập tên kho'),
      validators.minLength(2)
    ],
    dia_chi: [
      validators.required('Vui lòng nhập địa chỉ')
    ],
    dien_thoai: [
      validators.phone()
    ]
  },

  // Don hang / Hoa don
  donHang: {
    ma_kho_nhap: [
      validators.required('Vui lòng chọn kho nhập')
    ],
    ma_ncc: [
      validators.required('Vui lòng chọn nhà cung cấp')
    ],
    ngay_dat_hang: [
      validators.required('Vui lòng chọn ngày đặt hàng'),
      validators.date()
    ]
  },

  hoaDon: {
    ma_kho_xuat: [
      validators.required('Vui lòng chọn kho xuất')
    ],
    ma_kh: [
      validators.required('Vui lòng chọn khách hàng')
    ],
    ngay_ban: [
      validators.required('Vui lòng chọn ngày bán'),
      validators.date()
    ]
  },

  // Chuyen kho
  chuyenKho: {
    ma_kho_xuat: [
      validators.required('Vui lòng chọn kho xuất')
    ],
    ma_kho_nhap: [
      validators.required('Vui lòng chọn kho nhập')
    ],
    ngay_chuyen_kho: [
      validators.required('Vui lòng chọn ngày chuyển'),
      validators.date()
    ]
  },

  // Thu chi
  thuChi: {
    loai: [
      validators.required('Vui lòng chọn loại thu/chi')
    ],
    ma_kho: [
      validators.required('Vui lòng chọn kho')
    ],
    so_tien: [
      validators.required('Vui lòng nhập số tiền'),
      validators.positiveNumber()
    ],
    ngay_giao_dich: [
      validators.required('Vui lòng chọn ngày giao dịch'),
      validators.date()
    ]
  }
};