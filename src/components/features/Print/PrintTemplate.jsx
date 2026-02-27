import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatService } from "../../../services";

const PrintTemplate = ({ data, type }) => {
  const renderHeader = () => (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, borderBottom: "2px solid #000", paddingBottom: 10 }}>
      <div>
        <h2 style={{ margin: 0 }}>CÔNG TY MOTOR MS</h2>
        <p style={{ margin: 0 }}>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
        <p style={{ margin: 0 }}>Hotline: 0123.456.789</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <QRCodeSVG value={data.ma_phieu || data.id || ""} size={80} />
        <p style={{ margin: "5px 0 0 0", fontSize: 10 }}>{data.ma_phieu || data.id}</p>
      </div>
    </div>
  );

  const renderTitle = () => {
    let title = "PHIẾU GIAO DỊCH";
    if (type === "ORDER") title = "ĐƠN HÀNG BÁN LẺ";
    if (type === "INVOICE") title = "HÓA ĐƠN BÁN HÀNG";
    if (type === "STOCK_CARD") title = "THẺ KHO / PHIẾU XUẤT KHO";
    
    return <h1 style={{ textAlign: "center", textDecoration: "underline" }}>{title}</h1>;
  };

  const renderInfo = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
      <div><strong>Khách hàng:</strong> {data.ten_khach_hang || data.ho_ten || "Khách vãng lai"}</div>
      <div><strong>Ngày lập:</strong> {formatService.formatDate(data.ngay_lap || data.createdAt)}</div>
      <div><strong>Số điện thoại:</strong> {data.dien_thoai || "-"}</div>
      <div><strong>Số phiếu:</strong> {data.ma_phieu || data.id}</div>
      <div style={{ gridColumn: "span 2" }}><strong>Địa chỉ:</strong> {data.dia_chi || "-"}</div>
    </div>
  );

  const renderTable = () => (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20 }}>
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          <th style={{ border: "1px solid #000", padding: 8 }}>STT</th>
          <th style={{ border: "1px solid #000", padding: 8 }}>Sản phẩm</th>
          <th style={{ border: "1px solid #000", padding: 8 }}>ĐVT</th>
          <th style={{ border: "1px solid #000", padding: 8 }}>SL</th>
          <th style={{ border: "1px solid #000", padding: 8 }}>Đơn giá</th>
          <th style={{ border: "1px solid #000", padding: 8 }}>Thành tiền</th>
        </tr>
      </thead>
      <tbody>
        {(data.chi_tiet || []).map((item, index) => (
          <tr key={index}>
            <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>{index + 1}</td>
            <td style={{ border: "1px solid #000", padding: 8 }}>{item.ten_hang || item.ten_pt || item.ten_xe}</td>
            <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>{item.don_vi_tinh || "Cái"}</td>
            <td style={{ border: "1px solid #000", padding: 8, textAlign: "center" }}>{item.so_luong || item.so_luong_dat}</td>
            <td style={{ border: "1px solid #000", padding: 8, textAlign: "right" }}>{formatService.formatNumber(item.don_gia)}</td>
            <td style={{ border: "1px solid #000", padding: 8, textAlign: "right" }}>{formatService.formatNumber(item.thanh_tien || (item.so_luong * item.don_gia))}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={5} style={{ border: "1px solid #000", padding: 8, textAlign: "right" }}><strong>Tổng cộng:</strong></td>
          <td style={{ border: "1px solid #000", padding: 8, textAlign: "right" }}><strong>{formatService.formatCurrency(data.tong_tien || data.thanh_toan)}</strong></td>
        </tr>
      </tfoot>
    </table>
  );

  const renderFooter = () => (
    <div style={{ display: "flex", justifyContent: "space-around", marginTop: 40 }}>
      <div style={{ textAlign: "center" }}>
        <strong>Người lập phiếu</strong>
        <p style={{ marginTop: 60 }}>(Ký, họ tên)</p>
      </div>
      <div style={{ textAlign: "center" }}>
        <strong>Khách hàng</strong>
        <p style={{ marginTop: 60 }}>(Ký, họ tên)</p>
      </div>
    </div>
  );

  return (
    <div id="print-content" style={{ padding: "40px", backgroundColor: "#fff", color: "#000", fontFamily: "serif", fontSize: "14px" }}>
      {renderHeader()}
      {renderTitle()}
      {renderInfo()}
      {renderTable()}
      {renderFooter()}
    </div>
  );
};

export default PrintTemplate;
