# Hướng dẫn Sử dụng Workflow Phê duyệt Giao hàng - Frontend

## Tổng quan

Đã cập nhật frontend để hỗ trợ workflow phê duyệt giao hàng mới cho hóa đơn bán.

## Các thay đổi đã thực hiện

### 1. **Constants** (`src/utils/constant.js`)

Đã thêm các trạng thái mới:

```javascript
TRANG_THAI = {
  // ... existing statuses
  DA_XUAT: "DA_XUAT",
  CHO_DUYET_GIAO: "CHO_DUYET_GIAO",
  DA_DUYET_GIAO: "DA_DUYET_GIAO",
  DA_GIAO: "DA_GIAO",
  DA_THANH_TOAN: "DA_THANH_TOAN",
};
```

### 2. **API** (`src/api/hoaDon.api.js`)

Đã thêm 3 methods mới:

- `guiDuyetGiao(so_hd)` - Gửi duyệt giao hàng
- `pheDuyetGiao(so_hd, data)` - Phê duyệt giao hàng
- `xacNhanDaGiao(so_hd)` - Xác nhận đã giao hàng

### 3. **Components**

#### a. **HoaDonBanListPage** (`src/components/pages/hoaDon/HoaDonBanListPage.jsx`)

- Danh sách hóa đơn bán với filter cho các trạng thái mới
- Link đến trang chi tiết hóa đơn
- Route: `/sales/invoices`

#### b. **HoaDonBanDetail** (`src/components/pages/hoaDon/HoaDonBanDetail.jsx`)

- Hiển thị chi tiết hóa đơn bán
- Action buttons theo từng trạng thái
- Timeline phê duyệt giao hàng
- Modal phê duyệt với ghi chú
- Route: `/sales/invoices/:so_hd`

### 4. **Routes** (`src/routes/routeConfig.jsx`)

Đã thêm 2 routes mới:

```javascript
{
  path: "/sales/invoices",
  component: HoaDonBanListPage,
}
{
  path: "/sales/invoices/:so_hd",
  component: HoaDonBanDetail,
}
```

### 5. **Menu** (`src/components/layout/MainLayout/MainLayout.jsx`)

Đã cập nhật menu Bán hàng:

```
Bán hàng
├── Đơn hàng bán (/sales/orders)
└── Hóa đơn bán (/sales/invoices)
```

## Workflow UI

### Trạng thái: DA_XUAT

**Hiển thị:**

- Button: "Gửi duyệt giao hàng"

**Action:**

- Click button → Confirm modal → Gọi API `guiDuyetGiao()`
- Chuyển sang trạng thái `CHO_DUYET_GIAO`

---

### Trạng thái: CHO_DUYET_GIAO

**Hiển thị cho Nhân viên:**

- Tag: "Chờ duyệt giao hàng" (màu vàng)

**Hiển thị cho Quản lý:**

- Button: "Phê duyệt giao" (màu xanh)
- Button: "Từ chối" (màu đỏ)

**Action (Quản lý):**

- Click "Phê duyệt giao" → Modal nhập ghi chú → Gọi API `pheDuyetGiao()`
- Chuyển sang trạng thái `DA_DUYET_GIAO`

---

### Trạng thái: DA_DUYET_GIAO

**Hiển thị:**

- Button: "Xác nhận đã giao" (màu xanh)

**Action:**

- Click button → Confirm modal → Gọi API `xacNhanDaGiao()`
- Chuyển sang trạng thái `DA_GIAO`

---

### Trạng thái: DA_GIAO

**Hiển thị:**

- Tag: "Đã giao hàng" (màu xanh)
- Không có action button

---

### Trạng thái: DA_THANH_TOAN

**Hiển thị:**

- Tag: "Đã thanh toán" (màu xanh đậm)
- Không có action button

---

## Timeline Phê duyệt

Component `HoaDonBanDetail` hiển thị timeline bên phải với các bước:

1. **Đã xuất kho** (DA_XUAT)
2. **Gửi duyệt giao hàng** (CHO_DUYET_GIAO)
   - Người gửi + Thời gian
3. **Đã phê duyệt giao hàng** (DA_DUYET_GIAO)
   - Người duyệt + Thời gian
   - Ghi chú phê duyệt (nếu có)
4. **Đã giao hàng** (DA_GIAO)
5. **Đã thanh toán** (DA_THANH_TOAN)

## Quyền hạn

Component sử dụng `authService.isManager()` để kiểm tra quyền:

- **Nhân viên**: Gửi duyệt, Xác nhận đã giao
- **Quản lý**: Phê duyệt giao hàng

## Cách sử dụng

### 1. Truy cập danh sách hóa đơn

```
Menu → Bán hàng → Hóa đơn bán
hoặc
Navigate to: /sales/invoices
```

### 2. Xem chi tiết hóa đơn

Click button "Chi tiết" trên bất kỳ hóa đơn nào

### 3. Thực hiện workflow

**Bước 1: Gửi duyệt giao hàng** (Nhân viên)

- Ở trạng thái DA_XUAT
- Click "Gửi duyệt giao hàng"
- Xác nhận

**Bước 2: Phê duyệt giao hàng** (Quản lý)

- Ở trạng thái CHO_DUYET_GIAO
- Click "Phê duyệt giao"
- Nhập ghi chú (optional)
- Click "Phê duyệt"

**Bước 3: Xác nhận đã giao** (Nhân viên)

- Ở trạng thái DA_DUYET_GIAO
- Click "Xác nhận đã giao"
- Xác nhận

## Lưu ý

1. **Không thể bỏ qua bước**: Phải đi qua đầy đủ các trạng thái theo thứ tự
2. **Validation**: API sẽ kiểm tra trạng thái hiện tại trước khi cho phép chuyển trạng thái
3. **Error handling**: Tất cả API calls đều có try-catch và hiển thị notification
4. **Loading states**: Các action đều có loading indicator trong quá trình xử lý

## Testing

Để test workflow:

1. Tạo hóa đơn mới (hoặc sử dụng hóa đơn có sẵn ở trạng thái DA_XUAT)
2. Đăng nhập với tài khoản nhân viên → Gửi duyệt giao
3. Đăng nhập với tài khoản quản lý → Phê duyệt giao
4. Đăng nhập với tài khoản nhân viên → Xác nhận đã giao
5. Kiểm tra timeline và trạng thái sau mỗi bước

## Troubleshooting

### Không thấy button action

- Kiểm tra trạng thái hóa đơn
- Kiểm tra quyền của user (isManager)

### API error

- Kiểm tra console để xem error message
- Kiểm tra trạng thái hiện tại của hóa đơn
- Đảm bảo backend đã chạy migration

### Timeline không hiển thị đúng

- Refresh trang sau khi thực hiện action
- Kiểm tra response từ API có đầy đủ thông tin người duyệt không

## Files đã tạo/sửa

### Tạo mới:

- `src/components/pages/hoaDon/HoaDonBanDetail.jsx`
- `src/components/pages/hoaDon/HoaDonBanListPage.jsx`
- `FRONTEND_WORKFLOW_GUIDE.md` (file này)

### Cập nhật:

- `src/utils/constant.js`
- `src/api/hoaDon.api.js`
- `src/routes/routeConfig.jsx`
- `src/components/layout/MainLayout/MainLayout.jsx`

---

**Ngày cập nhật**: 2026-02-04
**Version**: 1.0
