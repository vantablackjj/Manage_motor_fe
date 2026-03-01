import React from "react";
import { Typography, Tabs, Space } from "antd";
import {
  ReconciliationOutlined,
  TeamOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import CongNoListPage from "./CongNoListPage";
import PartnerDebtList from "./PartnerDebtList";

const { Title } = Typography;

const CongNoManage = () => {
  return (
    <div style={{ padding: "0 8px" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Space size="middle">
          <div
            style={{
              background: "#ff7a45",
              borderRadius: 8,
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarCircleOutlined style={{ color: "white", fontSize: 20 }} />
          </div>
          <Title level={4} style={{ margin: 0 }}>
            Quản lý Công Nợ
          </Title>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="1"
        className="premium-tabs"
        items={[
          {
            key: "1",
            label: (
              <span>
                <ReconciliationOutlined /> Công nợ nội bộ
              </span>
            ),
            children: <CongNoListPage />,
          },
          {
            key: "2",
            label: (
              <span>
                <TeamOutlined /> Công nợ Khách hàng & NCC
              </span>
            ),
            children: <PartnerDebtList />,
          },
        ]}
      />
    </div>
  );
};

export default CongNoManage;
