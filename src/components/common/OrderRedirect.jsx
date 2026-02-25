import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";

const OrderRedirect = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    // Identify and redirect based on ID pattern
    // SO prefix -> Sales Order (Đơn hàng bán)
    if (id.startsWith("SO")) {
      navigate(`/sales/orders/${id}`, { replace: true });
    }
    // IV or HD or SO_HD -> Invoice (Hóa đơn bán)
    else if (
      id.startsWith("IV") ||
      id.startsWith("HD") ||
      id.includes("SO_HD")
    ) {
      navigate(`/sales/invoices/${id}`, { replace: true });
    }
    // PO or ma_phieu with prefix and usually related to Purchase
    else if (id.startsWith("PO") || id.startsWith("VN")) {
      navigate(`/purchase/vehicles/${id}`, { replace: true });
    }
    // PN -> Phieu Nhap (usually Parts)
    else if (id.startsWith("PN")) {
      navigate(`/purchase/parts/${id}`, { replace: true });
    }
    // Fallback: try Sales Order as it's the most frequent request
    else {
      navigate(`/sales/orders/${id}`, { replace: true });
    }
  }, [id, navigate]);

  return (
    <div
      style={{
        height: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Spin size="large" />
      <div style={{ color: "#8c8c8c" }}>Đang tìm kiếm đơn hàng {id}...</div>
    </div>
  );
};

export default OrderRedirect;
