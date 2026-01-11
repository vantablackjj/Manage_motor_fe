// src/components/features/Export/ExportButton.jsx
import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { exportApi } from "../../../api/export.api";
import { downloadFile } from "../../../utils/helpers";
import { notificationService } from "../../../services";

/**
 * Reusable Export Button component
 * @param {string} module - Module name for export (customer, part, brand, etc.)
 * @param {string} title - Display title for tooltip and filename
 * @param {object} params - Filter parameters to pass to API
 * @param {string} fileName - Custom filename (optional)
 */
const ExportButton = ({ module, title, params = {}, fileName, ...props }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // result is the Blob because the axios interceptor returns response.data
      const result = await exportApi.exportData(module, params);

      let blob = result;
      if (!(blob instanceof Blob)) {
        blob = new Blob([result]);
      }

      // If the server returns an error JSON instead of an Excel file,
      // axios with responseType: 'blob' will still wrap it in a Blob.
      if (blob.type === "application/json") {
        const text = await blob.text();
        try {
          const errorData = JSON.parse(text);
          notificationService.error(
            errorData.message || `Lỗi xuất file ${title || module}`
          );
          setExporting(false);
          return;
        } catch (e) {
          // Not valid JSON, proceed with download
        }
      }

      const defaultFileName = `Export_${
        title || module
      }_${new Date().getTime()}.xlsx`;
      const finalFileName = fileName || defaultFileName;

      downloadFile(blob, finalFileName);
      notificationService.success(`Xuất file ${title || module} thành công`);
    } catch (error) {
      console.error("Export error:", error);
      // interceptor already handles most status checks, but we add a fallback
      if (!error.response) {
        notificationService.error(
          `Không thể kết nối máy chủ để xuất file ${title || module}`
        );
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <Tooltip title={`Xuất Excel ${title || module}`}>
      <Button
        icon={<DownloadOutlined />}
        onClick={handleExport}
        loading={exporting}
        {...props}
      >
        Xuất Excel
      </Button>
    </Tooltip>
  );
};

export default ExportButton;
