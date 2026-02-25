// src/components/common/QrScanner/QrScannerModal.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Modal,
  Button,
  Alert,
  Space,
  Typography,
  Divider,
  Input,
  Tabs,
} from "antd";
import {
  QrcodeOutlined,
  CameraOutlined,
  StopOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import "./QrScannerModal.css";

const { Text, Title } = Typography;

/**
 * QrScannerModal - Quét mã QR/Barcode từ camera hoặc nhập tay
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onScan: (value: string) => void  — gọi khi quét thành công
 *  - title?: string
 *  - hint?: string   — gợi ý cho người dùng (VD: "Quét số khung xe")
 */
const QrScannerModal = ({
  open,
  onClose,
  onScan,
  title = "Quét mã QR / Barcode",
  hint = "Đặt camera vào vùng mã để quét tự động",
}) => {
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [manualCode, setManualCode] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [cameras, setCameras] = useState([]);
  const [activeTab, setActiveTab] = useState("camera");

  const stopScanner = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current.clear();
      } catch (e) {
        // Ignore errors on stop
      }
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    setLastResult(null);

    try {
      // Dynamic import để tránh SSR và giảm bundle size
      const { Html5Qrcode } = await import("html5-qrcode");

      if (!scannerRef.current) return;

      // Liệt kê camera có sẵn
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);

      if (devices.length === 0) {
        setError(
          "Không tìm thấy camera. Vui lòng kiểm tra quyền truy cập camera.",
        );
        return;
      }

      const scanner = new Html5Qrcode("qr-reader-container");
      html5QrRef.current = scanner;

      // Ưu tiên camera sau (back camera) cho điện thoại
      const cameraId =
        devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment"),
        )?.id || devices[devices.length - 1].id;

      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        (decodedText) => {
          // Thành công!
          setLastResult(decodedText);
          // Vibrate nếu thiết bị hỗ trợ
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          // Auto-stop và callback
          stopScanner().then(() => {
            onScan(decodedText);
          });
        },
        () => {
          // Đang quét, chưa tìm thấy — bỏ qua
        },
      );

      setScanning(true);
    } catch (err) {
      console.error("QR Scanner error:", err);
      if (err?.message?.includes("Permission")) {
        setError(
          "Bị từ chối quyền camera. Vui lòng cấp quyền trong trình duyệt và thử lại.",
        );
      } else if (err?.message?.includes("NotFound")) {
        setError("Không tìm thấy camera trên thiết bị.");
      } else {
        setError(`Lỗi khởi động camera: ${err?.message || "Không xác định"}`);
      }
    }
  }, [onScan, stopScanner]);

  // Dọn dẹp khi đóng modal
  useEffect(() => {
    if (!open) {
      stopScanner();
      setManualCode("");
      setError(null);
      setLastResult(null);
    }
  }, [open, stopScanner]);

  // Auto start khi switch tab về camera
  useEffect(() => {
    if (open && activeTab === "camera") {
      // Đợi DOM render xong
      const timer = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [open, activeTab]); // eslint-disable-line

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const cameraTab = (
    <div className="scanner-camera-tab">
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Button
              size="small"
              onClick={startScanner}
              icon={<ReloadOutlined />}
            >
              Thử lại
            </Button>
          }
        />
      )}

      <div className="scanner-viewport">
        <div id="qr-reader-container" className="qr-reader-container" />

        {!scanning && !error && (
          <div className="scanner-placeholder">
            <QrcodeOutlined style={{ fontSize: 64, color: "#4096ff" }} />
            <Text type="secondary" style={{ marginTop: 12 }}>
              Đang khởi động camera...
            </Text>
          </div>
        )}

        {scanning && (
          <div className="scanner-overlay">
            <div className="scan-line" />
            <div className="scan-corners">
              <span className="corner tl" />
              <span className="corner tr" />
              <span className="corner bl" />
              <span className="corner br" />
            </div>
          </div>
        )}
      </div>

      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center", marginTop: 8 }}
      >
        <CameraOutlined /> {hint}
      </Text>

      {scanning && (
        <Button
          danger
          icon={<StopOutlined />}
          onClick={stopScanner}
          style={{ width: "100%", marginTop: 12 }}
        >
          Dừng quét
        </Button>
      )}

      {!scanning && !error && (
        <Button
          type="primary"
          icon={<CameraOutlined />}
          onClick={startScanner}
          style={{ width: "100%", marginTop: 12 }}
        >
          Bật camera quét mã
        </Button>
      )}
    </div>
  );

  const manualTab = (
    <div className="scanner-manual-tab">
      <Title level={5} style={{ marginBottom: 16 }}>
        <EditOutlined /> Nhập mã thủ công
      </Title>
      <Space.Compact style={{ width: "100%" }}>
        <Input
          placeholder="Nhập số khung / số máy / mã phụ tùng..."
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onPressEnter={handleManualSubmit}
          size="large"
          allowClear
          autoFocus
        />
        <Button
          type="primary"
          onClick={handleManualSubmit}
          disabled={!manualCode.trim()}
          size="large"
        >
          Áp dụng
        </Button>
      </Space.Compact>
      <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
        Dùng khi camera không hoạt động hoặc mã bị mờ
      </Text>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <Space>
          <QrcodeOutlined style={{ color: "#4096ff" }} />
          {title}
        </Space>
      }
      footer={null}
      width={420}
      destroyOnClose
      centered
      className="qr-scanner-modal"
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          stopScanner();
          setActiveTab(key);
        }}
        items={[
          {
            key: "camera",
            label: (
              <span>
                <CameraOutlined /> Camera
              </span>
            ),
            children: cameraTab,
          },
          {
            key: "manual",
            label: (
              <span>
                <EditOutlined /> Nhập tay
              </span>
            ),
            children: manualTab,
          },
        ]}
      />
    </Modal>
  );
};

export default QrScannerModal;
