import React, { useEffect, useState } from "react";
import { Modal, Button, Alert, Space } from "antd";
import { Html5QrcodeScanner } from "html5-qrcode";
import { ScanOutlined } from "@ant-design/icons";

const QRScannerModal = ({ visible, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    let scanner = null;
    if (visible) {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          scanner.clear();
        },
        (errorMessage) => {
          // ignore common errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => console.error("Failed to clear scanner", error));
      }
    };
  }, [visible]);

  return (
    <Modal
      title={
        <Space>
          <ScanOutlined />
          <span>Quét mã QR phiếu</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      destroyOnClose
    >
      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <div id="reader" style={{ width: "100%" }}></div>
      <p style={{ textAlign: "center", marginTop: 16, color: "#8c8c8c" }}>
        Vui lòng đưa mã QR vào khung hình để quét
      </p>
    </Modal>
  );
};

export default QRScannerModal;
