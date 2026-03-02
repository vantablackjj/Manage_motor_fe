import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatService } from "../../../services";

/* ─────────────────────────────────────────────
   PRINT CSS – injected once into the document
   ───────────────────────────────────────────── */
const PRINT_CSS = `
@media print {
  @page {
    size: A4 portrait;
    margin: 14mm 12mm 20mm 12mm;
  }

  /* Prevent awkward page breaks inside rows */
  table { page-break-inside: auto; }
  tr    { page-break-inside: avoid; page-break-after: auto; }
  thead { display: table-header-group; }
  tfoot { display: table-footer-group; }

  /* Running page footer */
  .print-page-footer {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    border-top: 1px solid #ccc;
    padding: 3px 14mm;
    font-size: 9px;
    color: #555;
    display: flex;
    justify-content: space-between;
    background: #fff;
  }
}

@media screen {
  .print-page-footer { display: none; }
}
`;

/* ─────────────────────────────────────────────
   SHARED STYLES
   ───────────────────────────────────────────── */
const S = {
  page: {
    padding: "24px 28px",
    backgroundColor: "#fff",
    color: "#111",
    fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
    fontSize: "12px",
    lineHeight: 1.5,
    maxWidth: "780px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2.5px solid #cc0000",
    paddingBottom: "10px",
    marginBottom: "12px",
  },
  companyBlock: { flex: 1 },
  companyName: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#cc0000",
    margin: "0 0 2px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  companyMeta: { margin: "1px 0", fontSize: "10.5px", color: "#444" },
  logoPlaceholder: {
    width: "90px",
    height: "48px",
    border: "1.5px dashed #cc0000",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    color: "#cc0000",
    fontWeight: 700,
    letterSpacing: "1px",
    flexShrink: 0,
    marginLeft: "16px",
  },
  docTitle: {
    textAlign: "center",
    fontSize: "17px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    margin: "10px 0 4px 0",
    color: "#111",
  },
  docSubtitle: {
    textAlign: "center",
    fontSize: "11px",
    color: "#555",
    marginBottom: "16px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3px 20px",
    marginBottom: "14px",
    padding: "8px 10px",
    background: "#f8f8f8",
    borderRadius: "4px",
    border: "1px solid #e8e8e8",
  },
  infoItem: { display: "flex", gap: "4px", fontSize: "11.5px" },
  infoLabel: { fontWeight: 700, whiteSpace: "nowrap", color: "#333" },
  infoValue: { color: "#111" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "14px",
    fontSize: "11.5px",
  },
  th: {
    background: "#cc0000",
    color: "#fff",
    padding: "6px 8px",
    border: "1px solid #b00000",
    fontWeight: 700,
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "5px 8px",
    border: "1px solid #ddd",
    verticalAlign: "top",
  },
  tdAlt: {
    padding: "5px 8px",
    border: "1px solid #ddd",
    background: "#fafafa",
    verticalAlign: "top",
  },
  totalRow: {
    padding: "6px 8px",
    border: "1px solid #ddd",
    fontWeight: 700,
    background: "#fff8f8",
  },
  totalLabel: { textAlign: "right", borderRight: "none" },
  totalValue: {
    padding: "6px 8px",
    border: "1px solid #ddd",
    fontWeight: 700,
    textAlign: "right",
    color: "#cc0000",
    fontSize: "13px",
    background: "#fff8f8",
  },
  signaturesRow: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "32px",
  },
  signBlock: { textAlign: "center", flex: 1 },
  signTitle: { fontWeight: 700, fontSize: "11.5px" },
  signNote: { fontSize: "10px", color: "#666", margin: "2px 0" },
  signLine: {
    marginTop: "56px",
    borderTop: "1px solid #999",
    paddingTop: "2px",
    fontSize: "10px",
    color: "#555",
  },
  notesBox: {
    padding: "8px 10px",
    border: "1px solid #e0e0e0",
    borderLeft: "3px solid #cc0000",
    borderRadius: "3px",
    marginBottom: "14px",
    fontSize: "11px",
    background: "#fffdf5",
  },
  sectionDivider: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "10px 0 8px 0",
    fontSize: "11.5px",
    fontWeight: 700,
    color: "#cc0000",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  dividerLine: { flex: 1, height: "1px", background: "#cc0000", opacity: 0.35 },
};

/* ─────────────────────────────────────────────
   HEADER (shared)
   ───────────────────────────────────────────── */
const Header = ({ data }) => (
  <div style={S.headerRow}>
    <div style={S.companyBlock}>
      <h2 style={S.companyName}>Motor MS</h2>
      <p style={S.companyMeta}>🏠 Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
      <p style={S.companyMeta}>
        📞 Hotline: 0123.456.789 &nbsp;|&nbsp; 📧 info@motorms.vn
      </p>
      <p style={S.companyMeta}>
        🌐 www.motorms.vn &nbsp;|&nbsp; MST: 0123456789
      </p>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <div style={S.logoPlaceholder}>LOGO</div>
      {(data?.ma_phieu || data?.id) && (
        <>
          <QRCodeSVG value={String(data.ma_phieu || data.id)} size={60} />
          <span style={{ fontSize: "8px", color: "#666" }}>
            {data.ma_phieu || data.id}
          </span>
        </>
      )}
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   SECTION DIVIDER
   ───────────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <div style={S.sectionDivider}>
    <span>{children}</span>
    <div style={S.dividerLine} />
  </div>
);

/* ─────────────────────────────────────────────
   MAINTENANCE TEMPLATE  (Honda-style)
   ───────────────────────────────────────────── */
const MaintenanceTemplate = ({ data }) => {
  const items = data?.chi_tiet || data?.items || [];
  const tongTien = items.reduce((s, i) => s + Number(i.thanh_tien || 0), 0);
  const tienPT = items
    .filter((i) => i.loai_hang_muc === "PHU_TUNG")
    .reduce((s, i) => s + Number(i.thanh_tien || 0), 0);
  const tienCong = items
    .filter((i) => i.loai_hang_muc !== "PHU_TUNG")
    .reduce((s, i) => s + Number(i.thanh_tien || 0), 0);

  return (
    <div id="print-content" style={S.page}>
      <style>{PRINT_CSS}</style>
      <Header data={data} />

      <div style={S.docTitle}>Phiếu Dịch Vụ / Sửa Chữa</div>
      <div style={S.docSubtitle}>
        Số phiếu: <strong>{data.ma_phieu}</strong> &nbsp;|&nbsp; Ngày:{" "}
        <strong>{formatService.formatDate(data.ngay_bao_tri)}</strong>
      </div>

      {/* Info Grid – Vehicle */}
      <SectionTitle>Thông tin xe &amp; khách hàng</SectionTitle>
      <div style={S.infoGrid}>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>Khách hàng:</span>
          <span style={S.infoValue}>{data.ten_khach_hang || "—"}</span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>SĐT:</span>
          <span style={S.infoValue}>{data.dien_thoai || "—"}</span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>Loại xe:</span>
          <span style={S.infoValue}>{data.ten_loai_xe || "—"}</span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>Số khung:</span>
          <span style={S.infoValue}>{data.so_khung || "—"}</span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>Số KM:</span>
          <span style={S.infoValue}>
            {formatService.formatNumber(data.so_km_hien_tai) || "—"}
          </span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>KTV:</span>
          <span style={S.infoValue}>
            {data.ten_ktv || data.ktv_chinh || "—"}
          </span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>Loại bảo trì:</span>
          <span style={S.infoValue}>{data.loai_bao_tri || "—"}</span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>Kho:</span>
          <span style={S.infoValue}>{data.ten_kho || data.ma_kho || "—"}</span>
        </div>
        {data.ghi_chu && (
          <div style={{ ...S.infoItem, gridColumn: "span 2" }}>
            <span style={S.infoLabel}>Ghi chú:</span>
            <span style={S.infoValue}>{data.ghi_chu}</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <SectionTitle>Danh sách hạng mục</SectionTitle>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 36 }}>STT</th>
            <th style={{ ...S.th, width: 70 }}>Loại</th>
            <th style={S.th}>Tên hạng mục / Phụ tùng</th>
            <th style={{ ...S.th, width: 60 }}>ĐVT</th>
            <th style={{ ...S.th, width: 50 }}>SL</th>
            <th style={{ ...S.th, width: 90 }}>Đơn giá</th>
            <th style={{ ...S.th, width: 100 }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td style={{ ...S.td, textAlign: "center" }}>{idx + 1}</td>
              <td style={{ ...S.td, textAlign: "center" }}>
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: 3,
                    fontSize: 10,
                    background:
                      item.loai_hang_muc === "PHU_TUNG" ? "#e6f7ff" : "#f6ffed",
                    color:
                      item.loai_hang_muc === "PHU_TUNG" ? "#1890ff" : "#52c41a",
                    border: `1px solid ${item.loai_hang_muc === "PHU_TUNG" ? "#91d5ff" : "#b7eb8f"}`,
                  }}
                >
                  {item.loai_hang_muc === "PHU_TUNG" ? "PT" : "DV"}
                </span>
              </td>
              <td style={idx % 2 === 0 ? S.td : S.tdAlt}>
                {item.ten_hang_muc}
                {item.ma_hang_hoa && (
                  <div style={{ fontSize: 10, color: "#888" }}>
                    Mã: {item.ma_hang_hoa}
                  </div>
                )}
              </td>
              <td style={{ ...S.td, textAlign: "center" }}>
                {item.don_vi_tinh || "Cái"}
              </td>
              <td style={{ ...S.td, textAlign: "center" }}>
                {formatService.formatNumber(item.so_luong)}
              </td>
              <td style={{ ...S.td, textAlign: "right" }}>
                {formatService.formatNumber(item.don_gia)}
              </td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
                {formatService.formatCurrency(item.thanh_tien)}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={7}
                style={{
                  ...S.td,
                  textAlign: "center",
                  color: "#999",
                  padding: "16px",
                }}
              >
                Không có hạng mục
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={6} style={{ ...S.totalRow, ...S.totalLabel }}>
              Tiền phụ tùng:
            </td>
            <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
              {formatService.formatCurrency(tienPT)}
            </td>
          </tr>
          <tr>
            <td colSpan={6} style={{ ...S.totalRow, ...S.totalLabel }}>
              Tiền công:
            </td>
            <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
              {formatService.formatCurrency(tienCong)}
            </td>
          </tr>
          <tr>
            <td
              colSpan={6}
              style={{ ...S.totalRow, ...S.totalLabel, fontSize: "12.5px" }}
            >
              TỔNG THANH TOÁN:
            </td>
            <td style={S.totalValue}>
              {formatService.formatCurrency(tongTien)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Notes */}
      <div style={S.notesBox}>
        ⚡ <strong>Lưu ý:</strong> Phụ tùng đã thay không hoàn trả. Bảo hành
        theo chính sách của cửa hàng. Vui lòng kiểm tra xe trước khi rời khỏi
        xưởng.
      </div>

      {/* Signatures */}
      <div style={S.signaturesRow}>
        <div style={S.signBlock}>
          <div style={S.signTitle}>Kỹ thuật viên</div>
          <div style={S.signNote}>(Ký và ghi rõ họ tên)</div>
          <div style={S.signLine}>{data.ten_ktv || ""}</div>
        </div>
        <div style={S.signBlock}>
          <div style={S.signTitle}>Thu ngân</div>
          <div style={S.signNote}>(Ký và ghi rõ họ tên)</div>
          <div style={S.signLine}></div>
        </div>
        <div style={S.signBlock}>
          <div style={S.signTitle}>Khách hàng</div>
          <div style={S.signNote}>(Đã nhận xe, ký tên)</div>
          <div style={S.signLine}>{data.ten_khach_hang || ""}</div>
        </div>
      </div>

      {/* Running footer */}
      <div className="print-page-footer">
        <span>Motor MS | ĐT: 0123.456.789</span>
        <span>
          Phiếu: {data.ma_phieu} – In lúc: {new Date().toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   PURCHASE / INVOICE / ORDER TEMPLATE
   ───────────────────────────────────────────── */
const PurchaseTemplate = ({ data, type }) => {
  const items = data?.chi_tiet || data?.items || [];
  const tongTien = Number(
    data.tong_tien || data.thanh_toan || data.thanh_tien || 0,
  );

  const typeLabel =
    {
      PURCHASE: "Đơn Đặt Hàng Nhập",
      INVOICE: "Hóa Đơn Bán Hàng",
      ORDER: "Phiếu Bán Lẻ",
      STOCK_CARD: "Phiếu Xuất Kho",
    }[type] || "Phiếu Giao Dịch";

  const isPurchase = type === "PURCHASE";
  const partnerLabel = isPurchase ? "Nhà cung cấp:" : "Khách hàng:";
  const partnerName =
    data.ten_ncc ||
    data.ten_khach_hang ||
    data.ho_ten ||
    data.khach_hang?.ho_ten ||
    "—";

  return (
    <div id="print-content" style={S.page}>
      <style>{PRINT_CSS}</style>
      <Header data={data} />

      <div style={S.docTitle}>{typeLabel}</div>
      <div style={S.docSubtitle}>
        Số:{" "}
        <strong>
          {data.ma_phieu || data.so_phieu || data.so_hd || data.id}
        </strong>
        &nbsp;|&nbsp; Ngày:{" "}
        <strong>
          {formatService.formatDate(
            data.ngay_lap || data.ngay_dat_hang || data.createdAt,
          )}
        </strong>
      </div>

      <SectionTitle>Thông tin đơn hàng</SectionTitle>
      <div style={S.infoGrid}>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>{partnerLabel}</span>
          <span style={S.infoValue}>{partnerName}</span>
        </div>
        <div style={S.infoItem}>
          <span style={S.infoLabel}>SĐT:</span>
          <span style={S.infoValue}>
            {data.dien_thoai ||
              data.sdt_ncc ||
              data.khach_hang?.dien_thoai ||
              "—"}
          </span>
        </div>
        {(data.dia_chi || data.khach_hang?.dia_chi || data.dia_chi_ncc) && (
          <div style={{ ...S.infoItem, gridColumn: "span 2" }}>
            <span style={S.infoLabel}>Địa chỉ:</span>
            <span style={S.infoValue}>
              {data.dia_chi || data.khach_hang?.dia_chi || data.dia_chi_ncc}
            </span>
          </div>
        )}
        {data.ten_kho && (
          <div style={S.infoItem}>
            <span style={S.infoLabel}>Kho:</span>
            <span style={S.infoValue}>{data.ten_kho || data.ma_kho_nhap}</span>
          </div>
        )}
        {data.nguoi_tao && (
          <div style={S.infoItem}>
            <span style={S.infoLabel}>Người lập:</span>
            <span style={S.infoValue}>
              {data.ten_nguoi_tao || data.nguoi_tao}
            </span>
          </div>
        )}
        {data.ghi_chu && (
          <div style={{ ...S.infoItem, gridColumn: "span 2" }}>
            <span style={S.infoLabel}>Ghi chú:</span>
            <span style={S.infoValue}>{data.ghi_chu}</span>
          </div>
        )}
      </div>

      <SectionTitle>Chi tiết hàng hóa</SectionTitle>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 36 }}>STT</th>
            <th style={S.th}>Tên hàng hóa / Dịch vụ</th>
            <th style={{ ...S.th, width: 60 }}>ĐVT</th>
            <th style={{ ...S.th, width: 50 }}>SL</th>
            <th style={{ ...S.th, width: 100 }}>Đơn giá</th>
            <th style={{ ...S.th, width: 110 }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const qty = Number(item.so_luong || item.so_luong_dat || 1);
            const price = Number(item.don_gia || item.gia_ban || 0);
            const total = Number(item.thanh_tien || qty * price || 0);
            return (
              <tr key={idx}>
                <td style={{ ...S.td, textAlign: "center" }}>{idx + 1}</td>
                <td style={idx % 2 === 0 ? S.td : S.tdAlt}>
                  {item.ten_hang ||
                    item.ten_pt ||
                    item.ten_xe ||
                    item.ten_hang_muc ||
                    "—"}
                  {item.ma_hang_hoa && (
                    <div style={{ fontSize: 10, color: "#888" }}>
                      Mã: {item.ma_hang_hoa}
                    </div>
                  )}
                  {item.so_khung && (
                    <div style={{ fontSize: 10, color: "#888" }}>
                      Số khung: {item.so_khung}
                    </div>
                  )}
                </td>
                <td style={{ ...S.td, textAlign: "center" }}>
                  {item.don_vi_tinh || "Cái"}
                </td>
                <td style={{ ...S.td, textAlign: "center" }}>{qty}</td>
                <td style={{ ...S.td, textAlign: "right" }}>
                  {formatService.formatNumber(price)}
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
                  {formatService.formatCurrency(total)}
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{
                  ...S.td,
                  textAlign: "center",
                  color: "#999",
                  padding: "16px",
                }}
              >
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          {data.chiet_khau > 0 && (
            <tr>
              <td colSpan={5} style={{ ...S.totalRow, textAlign: "right" }}>
                Chiết khấu:
              </td>
              <td style={{ ...S.td, textAlign: "right" }}>
                {formatService.formatCurrency(data.chiet_khau)}
              </td>
            </tr>
          )}
          {data.vat_percentage > 0 && (
            <tr>
              <td colSpan={5} style={{ ...S.totalRow, textAlign: "right" }}>
                VAT ({data.vat_percentage}%):
              </td>
              <td style={{ ...S.td, textAlign: "right" }}>
                {formatService.formatCurrency(
                  (tongTien * data.vat_percentage) / 100,
                )}
              </td>
            </tr>
          )}
          <tr>
            <td
              colSpan={5}
              style={{ ...S.totalRow, textAlign: "right", fontSize: "12.5px" }}
            >
              TỔNG THANH TOÁN:
            </td>
            <td style={S.totalValue}>
              {formatService.formatCurrency(tongTien)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signatures */}
      <div style={S.signaturesRow}>
        <div style={S.signBlock}>
          <div style={S.signTitle}>Người lập phiếu</div>
          <div style={S.signNote}>(Ký và ghi rõ họ tên)</div>
          <div style={S.signLine}>{data.ten_nguoi_tao || ""}</div>
        </div>
        <div style={S.signBlock}>
          <div style={S.signTitle}>Thủ kho</div>
          <div style={S.signNote}>(Ký và ghi rõ họ tên)</div>
          <div style={S.signLine}></div>
        </div>
        <div style={S.signBlock}>
          <div style={S.signTitle}>
            {isPurchase ? "Nhà cung cấp" : "Khách hàng"}
          </div>
          <div style={S.signNote}>(Xác nhận nhận hàng)</div>
          <div style={S.signLine}>{partnerName}</div>
        </div>
      </div>

      {/* Running footer */}
      <div className="print-page-footer">
        <span>Motor MS | ĐT: 0123.456.789</span>
        <span>
          Phiếu: {data.ma_phieu || data.so_phieu} – In lúc:{" "}
          {new Date().toLocaleString("vi-VN")}
        </span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN export – routes to the right template
   ───────────────────────────────────────────── */
const PrintTemplate = ({ data, type }) => {
  if (!data) return null;
  if (type === "MAINTENANCE") return <MaintenanceTemplate data={data} />;
  return <PurchaseTemplate data={data} type={type} />;
};

export default PrintTemplate;
