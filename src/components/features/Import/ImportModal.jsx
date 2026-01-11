import React, { useState } from "react";
import {
  Modal,
  Upload,
  Radio,
  Button,
  Progress,
  Alert,
  Table,
  Typography,
  Space,
  message,
} from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { importApi } from "../../../api";

const { Dragger } = Upload;
const { Text, Link } = Typography;

const ImportModal = ({
  open,
  onCancel,
  module,
  title = "Import Dữ Liệu",
  onSuccess,
}) => {
  const [fileList, setFileList] = useState([]);
  const [mode, setMode] = useState("SAFE");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const resetState = () => {
    setFileList([]);
    setImporting(false);
    setProgress(0);
    setResult(null);
  };

  const handleCancel = () => {
    if (importing) return;
    resetState();
    onCancel();
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn file cần import");
      return;
    }

    setImporting(true);
    setProgress(30);

    try {
      const file = fileList[0].originFileObj || fileList[0];
      const res = await importApi.importData(module, file, mode);

      setProgress(100);
      setResult(res.data);
      message.success("Import hoàn tất");

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (error) {
      console.error("Import error:", error);
      const errorMsg = error.response?.data?.message || "Import thất bại";
      message.error(errorMsg);

      if (error.response?.data?.errors) {
        setResult({
          success: false,
          errors: error.response.data.errors,
          summary: {
            total: 0,
            success: 0,
            failed: error.response.data.errors.length,
          },
        });
      }
    } finally {
      setImporting(false);
    }
  };

  const columns = [
    {
      title: "Dòng",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Lỗi",
      dataIndex: "error",
      key: "error",
      render: (text) => <Text type="danger">{text}</Text>,
    },
  ];

  const uploadProps = {
    onRemove: () => setFileList([]),
    beforeUpload: (file) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".csv");

      if (!isExcel) {
        message.error("Chỉ chấp nhận file .xlsx, .xls hoặc .csv");
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1,
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={importing}>
          Đóng
        </Button>,
        <Button
          key="import"
          type="primary"
          onClick={handleImport}
          loading={importing}
          disabled={fileList.length === 0}
        >
          Bắt đầu Import
        </Button>,
      ]}
      width={700}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Dragger {...uploadProps} disabled={importing}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Nhấp hoặc kéo thả file vào đây để tải lên
          </p>
          <p className="ant-upload-hint">Hỗ trợ .xlsx, .xls, .csv</p>
        </Dragger>

        <div>
          <Text strong>Chế độ Import:</Text>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={importing}
            style={{ marginLeft: 16 }}
          >
            <Radio value="SAFE">SAFE (Kiểm tra từng dòng)</Radio>
            <Radio value="FAST">FAST (Tốc độ cao - CSV only)</Radio>
          </Radio.Group>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" size="small">
              {mode === "SAFE"
                ? "Thích hợp cho dữ liệu cần kiểm tra kỹ. Cho phép thành công một phần."
                : "Thích hợp cho dữ liệu lớn (>10k dòng). Thất bại tất cả nếu có 1 lỗi."}
            </Text>
          </div>
        </div>

        {importing && (
          <div>
            <Text>Đang xử lý...</Text>
            <Progress percent={progress} status="active" />
          </div>
        )}

        {result && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message="Kết quả Import"
              description={
                <Space direction="vertical">
                  <div>
                    Tổng số: <Text strong>{result.summary?.total || 0}</Text> |
                    Thành công:{" "}
                    <Text type="success" strong>
                      {result.summary?.success || 0}
                    </Text>{" "}
                    | Thất bại:{" "}
                    <Text type="danger" strong>
                      {result.summary?.failed || 0}
                    </Text>
                  </div>
                  {result.summary?.duration && (
                    <div>
                      Thời gian xử lý:{" "}
                      <Text strong>{result.summary.duration}s</Text>
                    </div>
                  )}
                </Space>
              }
              type={result.summary?.failed > 0 ? "warning" : "success"}
              showIcon
            />

            {result.errors && result.errors.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Chi tiết lỗi:</Text>
                <Table
                  dataSource={result.errors}
                  columns={columns}
                  size="small"
                  pagination={{ pageSize: 5 }}
                  rowKey={(record, index) => index}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default ImportModal;
