# Báo Cáo Công Nợ - Cập Nhật Frontend

## Tổng Quan

Frontend đã được cập nhật để hỗ trợ API báo cáo công nợ mới, hiển thị **cả công nợ khách hàng (phải thu) VÀ công nợ nhà cung cấp (phải trả)** trong một báo cáo tổng hợp.

## Các Thay Đổi Chính

### 1. Giao Diện Người Dùng

#### **Summary Cards (Thẻ Tổng Hợp)**

Khi không có bộ lọc `loai_cong_no`, hệ thống hiển thị 4 thẻ thống kê:

- **Tổng phải thu** (màu xanh lá) - Tổng số tiền khách hàng còn nợ
- **Tổng phải trả** (màu đỏ) - Tổng số tiền công ty còn nợ nhà cung cấp
- **Số khách hàng còn nợ** (màu xanh dương)
- **Số nhà cung cấp còn nợ** (màu vàng)

#### **Bộ Lọc Mới**

- **Loại công nợ**:
  - "Phải thu (Khách hàng)" - Chỉ hiển thị công nợ khách hàng
  - "Phải trả (Nhà cung cấp)" - Chỉ hiển thị công nợ nhà cung cấp
  - Để trống - Hiển thị cả hai loại

#### **Cột Bảng Mới**

1. **Loại** - Tag màu sắc phân biệt:
   - 🟢 "Phải thu" (màu xanh) cho khách hàng
   - 🟠 "Phải trả" (màu cam) cho nhà cung cấp

2. **Đối tác** - Hiển thị:
   - Tên đối tác (in đậm)
   - Loại đối tác (Khách hàng / Nhà cung cấp) - màu xám nhạt

3. **Mã đối tác** - Mã khách hàng hoặc nhà cung cấp

4. **Tổng phải trả** - Tổng số tiền giao dịch

5. **Đã trả** - Số tiền đã thanh toán

6. **Còn lại** - Số tiền còn nợ:
   - Màu xanh lá (#52c41a) cho phải thu
   - Màu đỏ (#ff4d4f) cho phải trả

7. **Ngày cập nhật** - Ngày cập nhật cuối cùng

### 2. Xử Lý Dữ Liệu

#### **Tương Thích Ngược**

Frontend hỗ trợ cả 2 định dạng response:

**Định dạng cũ (Array):**

```javascript
{
  data: [
    { ho_ten: "...", con_lai: 100000, ... }
  ]
}
```

**Định dạng mới (Object với Summary):**

```javascript
{
  data: [
    {
      ho_ten: "...",
      loai_cong_no: "PHAI_THU",
      loai_doi_tac: "KHACH_HANG",
      con_lai: 100000,
      ...
    }
  ],
  summary: {
    tong_phai_thu: 500000,
    tong_phai_tra: 300000,
    so_khach_hang_no: 5,
    so_nha_cung_cap_no: 3
  }
}
```

#### **Logic Xử Lý**

```javascript
if (res?.data && res?.summary) {
  // Định dạng mới - hiển thị summary cards
  setData(res.data || []);
  setSummary(res.summary);
} else {
  // Định dạng cũ - không hiển thị summary
  const rawData = res?.data !== undefined ? res.data : res;
  const list = Array.isArray(rawData) ? rawData : rawData ? [rawData] : [];
  setData(list);
  setSummary(null);
}
```

### 3. State Management

**State mới:**

```javascript
const [summary, setSummary] = useState(null);
```

**Params cập nhật:**

```javascript
const [params, setParams] = useState({
  ma_kho: null,
  tu_ngay: dayjs().startOf("month"),
  den_ngay: dayjs(),
  loai_cong_no: null, // Thay thế loai_doi_tac
  ma_kh: null, // Mới
  ma_ncc: null, // Mới
});
```

**Dependencies cập nhật:**

```javascript
useEffect(() => {
  fetchData();
}, [
  activeTab,
  params.ma_kho,
  params.tu_ngay,
  params.den_ngay,
  params.loai_cong_no, // Thay thế loai_doi_tac
  params.ma_kh,
  params.ma_ncc,
]);
```

## Cách Sử Dụng

### 1. Xem Tất Cả Công Nợ

1. Vào **Báo cáo** → **Báo cáo tài chính & Công nợ**
2. Chọn tab **"Công nợ Khách hàng"**
3. Chọn khoảng thời gian
4. **Không chọn** "Loại công nợ"
5. Hệ thống hiển thị:
   - 4 thẻ tổng hợp ở trên
   - Bảng chi tiết với cả khách hàng và nhà cung cấp

### 2. Xem Chỉ Công Nợ Khách Hàng (Phải Thu)

1. Chọn **"Loại công nợ"** = **"Phải thu (Khách hàng)"**
2. Hệ thống chỉ hiển thị các khoản phải thu từ khách hàng
3. Summary cards không hiển thị (do đã lọc)

### 3. Xem Chỉ Công Nợ Nhà Cung Cấp (Phải Trả)

1. Chọn **"Loại công nợ"** = **"Phải trả (Nhà cung cấp)"**
2. Hệ thống chỉ hiển thị các khoản phải trả cho nhà cung cấp
3. Summary cards không hiển thị (do đã lọc)

## API Integration

### Endpoint

```
GET /api/bao-cao/cong-no/khach-hang
```

### Query Parameters

```javascript
{
  loai_cong_no: "PHAI_THU" | "PHAI_TRA" | null,
  ma_kh: string | null,
  ma_ncc: string | null,
  tu_ngay: "YYYY-MM-DD",
  den_ngay: "YYYY-MM-DD"
}
```

### Response Format

**Khi không có `loai_cong_no` (tất cả):**

```json
{
  "success": true,
  "data": [
    {
      "ho_ten": "Nguyễn Văn A",
      "ma_doi_tac": "KH001",
      "loai_doi_tac": "KHACH_HANG",
      "loai_cong_no": "PHAI_THU",
      "tong_phai_tra": 50000000,
      "da_tra": 20000000,
      "con_lai": 30000000,
      "ngay_cap_nhat": "2026-02-10T06:00:00.000Z"
    },
    {
      "ho_ten": "Công ty ABC",
      "ma_doi_tac": "NCC001",
      "loai_doi_tac": "NHA_CUNG_CAP",
      "loai_cong_no": "PHAI_TRA",
      "tong_phai_tra": 100000000,
      "da_tra": 50000000,
      "con_lai": 50000000,
      "ngay_cap_nhat": "2026-02-09T06:00:00.000Z"
    }
  ],
  "summary": {
    "tong_phai_thu": 30000000,
    "tong_phai_tra": 50000000,
    "so_khach_hang_no": 1,
    "so_nha_cung_cap_no": 1
  }
}
```

**Khi có `loai_cong_no` (lọc cụ thể):**

```json
{
  "success": true,
  "data": [
    {
      "ho_ten": "Nguyễn Văn A",
      "ma_doi_tac": "KH001",
      "loai_cong_no": "PHAI_THU",
      "tong_phai_tra": 50000000,
      "da_tra": 20000000,
      "con_lai": 30000000,
      "ngay_cap_nhat": "2026-02-10T06:00:00.000Z"
    }
  ]
}
```

## Các File Đã Thay Đổi

### 1. `src/components/pages/reports/FinancialReportPage.jsx`

- ✅ Thêm imports: `Statistic`, `Tag`, `RiseOutlined`, `FallOutlined`
- ✅ Thêm state `summary`
- ✅ Cập nhật params: `loai_cong_no`, `ma_kh`, `ma_ncc`
- ✅ Cập nhật `fetchData()` để xử lý cả 2 định dạng response
- ✅ Cập nhật `customerDebtColumns` với cột mới
- ✅ Thêm Summary Cards component
- ✅ Cập nhật bộ lọc từ "Đối tượng" sang "Loại công nợ"

## Lợi Ích

### 1. **Tổng Quan Toàn Diện**

- Xem được cả công nợ phải thu và phải trả trong một màn hình
- Dễ dàng so sánh và quản lý dòng tiền

### 2. **Linh Hoạt**

- Có thể lọc theo loại công nợ cụ thể
- Hỗ trợ lọc theo thời gian
- Tương thích ngược với API cũ

### 3. **Trực Quan**

- Tag màu sắc phân biệt rõ ràng
- Summary cards hiển thị thống kê tổng quan
- Màu sắc khác nhau cho phải thu (xanh) và phải trả (đỏ)

### 4. **Hiệu Quả**

- Giảm số lần chuyển trang
- Tất cả thông tin quan trọng ở một nơi
- Dễ dàng xuất báo cáo Excel/PDF

## Testing Checklist

- [ ] Kiểm tra hiển thị tất cả công nợ (không lọc)
- [ ] Kiểm tra summary cards hiển thị đúng
- [ ] Kiểm tra lọc "Phải thu" (chỉ khách hàng)
- [ ] Kiểm tra lọc "Phải trả" (chỉ nhà cung cấp)
- [ ] Kiểm tra lọc theo thời gian
- [ ] Kiểm tra màu sắc tag và số tiền còn lại
- [ ] Kiểm tra tương thích với API cũ (không có summary)
- [ ] Kiểm tra responsive trên mobile
- [ ] Kiểm tra xuất Excel
- [ ] Kiểm tra xuất PDF

## Lưu Ý Kỹ Thuật

1. **Tương thích ngược**: Frontend tự động phát hiện định dạng response và xử lý phù hợp
2. **Summary cards**: Chỉ hiển thị khi có `summary` trong response (tức là không có bộ lọc `loai_cong_no`)
3. **Màu sắc**: Sử dụng màu chuẩn Ant Design để đảm bảo nhất quán
4. **Performance**: Không ảnh hưởng đến hiệu suất do chỉ thêm logic xử lý đơn giản

## Hỗ Trợ

Nếu có vấn đề, kiểm tra:

1. Response từ API có đúng định dạng không
2. Console log để xem dữ liệu nhận được
3. Network tab để kiểm tra request/response
4. Đảm bảo backend đã cập nhật API mới
