# Hướng dẫn sử dụng LOAI_DON_HANG vs LOAI_GIAO_DICH

## Vấn đề đã được sửa

Trước đây, hệ thống frontend đã nhầm lẫn giữa **Loại đơn hàng** (Order Types) và **Loại giao dịch kho** (Warehouse Transaction Types), dẫn đến lỗi khi gọi API.

## Phân biệt rõ ràng

### 1. LOAI_DON_HANG (Order Types) - Dùng cho API `/api/orders`

**Giá trị hợp lệ (phải khớp với backend enum):**

- `MUA_HANG` - Đơn mua hàng (Purchase Order)
- `BAN_HANG` - Đơn bán hàng (Sales Order)
- `CHUYEN_KHO` - Đơn chuyển kho (Transfer Order)

**Ví dụ sử dụng:**

```javascript
import { LOAI_DON_HANG } from '../utils/constant';

// ✅ ĐÚNG: Lấy danh sách đơn bán hàng
const params = {
  loai_don_hang: LOAI_DON_HANG.BAN_HANG, // Giá trị: "BAN_HANG"
};
const response = await orderAPI.getAll(params);

// ✅ ĐÚNG: Tạo đơn mua hàng
const orderData = {
  loai_don_hang: LOAI_DON_HANG.MUA_HANG, // Giá trị: "MUA_HANG"
  ...
};
```

### 2. LOAI_GIAO_DICH (Warehouse Transaction Types) - Dùng cho API `/api/warehouse/transactions`

**Giá trị hợp lệ:**

- `NHAP_KHO` - Giao dịch nhập kho
- `XUAT_KHO` - Giao dịch xuất kho
- `CHUYEN_KHO` - Giao dịch chuyển kho
- `TRA_HANG` - Trả hàng
- `KIEM_KE` - Kiểm kê

**Ví dụ sử dụng:**

```javascript
import { LOAI_GIAO_DICH } from "../utils/constant";

// ✅ ĐÚNG: Lấy lịch sử xuất kho
const params = {
  loai_giao_dich: LOAI_GIAO_DICH.XUAT_KHO, // Giá trị: "XUAT_KHO"
};
const response = await warehouseAPI.getTransactions(params);
```

## Lỗi thường gặp

### ❌ SAI: Dùng XUAT_KHO cho loai_don_hang

```javascript
// SAI - Backend sẽ trả về lỗi validation
const params = {
  loai_don_hang: "XUAT_KHO", // ❌ Không hợp lệ!
};
```

**Lỗi backend:**

```json
{
  "success": false,
  "message": "Invalid loai_don_hang value: \"XUAT_KHO\". Valid values are: MUA_HANG, BAN_HANG, CHUYEN_KHO"
}
```

### ✅ ĐÚNG: Dùng BAN_HANG cho đơn bán hàng

```javascript
const params = {
  loai_don_hang: LOAI_DON_HANG.BAN_HANG, // ✅ Đúng
};
```

## Mối quan hệ giữa Order và Transaction

```
Đơn Mua Hàng (MUA_HANG)
    ↓ (khi nhập kho)
Giao dịch Nhập Kho (NHAP_KHO)

Đơn Bán Hàng (BAN_HANG)
    ↓ (khi giao hàng)
Giao dịch Xuất Kho (XUAT_KHO)

Đơn Chuyển Kho (CHUYEN_KHO)
    ↓ (khi thực hiện)
Giao dịch Chuyển Kho (CHUYEN_KHO)
```

## Checklist khi làm việc với Orders

- [ ] Sử dụng `LOAI_DON_HANG` constants từ `utils/constant.js`
- [ ] Không hardcode string như `"XUAT_KHO"` hoặc `"NHAP_KHO"`
- [ ] Kiểm tra API endpoint đang gọi (`/api/orders` hay `/api/warehouse/transactions`)
- [ ] Đọc error message từ backend nếu có lỗi validation

## Labels hiển thị vs Giá trị API

**Quan trọng:** Labels hiển thị cho người dùng có thể khác với giá trị gửi lên API!

```javascript
// Giá trị API (gửi lên backend)
LOAI_DON_HANG.BAN_HANG; // "BAN_HANG"

// Label hiển thị (cho người dùng thấy)
("Xuất Kho (Bán)"); // Hoặc "Đơn bán hàng"
```

Điều này giúp:

- Backend giữ nguyên enum chuẩn
- Frontend có thể tùy chỉnh cách hiển thị cho phù hợp với UX
- Tránh breaking changes khi đổi terminology

## Tham khảo thêm

- Backend enum: `enum_loai_don_hang` trong database
- Backend constants: `server/src/utils/constants.js`
- Frontend constants: `src/utils/constant.js`
