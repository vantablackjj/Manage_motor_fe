import React from "react";
import { Card, Result, Button } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

const ReportPlaceholder = ({ title }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Result
          icon={<BarChartOutlined style={{ color: "#1890ff" }} />}
          title={`Báo cáo: ${title}`}
          subTitle="Tính năng báo cáo chi tiết đang được phát triển."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Quay lại
            </Button>
          }
        />
      </Card>
    </div>
  );
};

export default ReportPlaceholder;
