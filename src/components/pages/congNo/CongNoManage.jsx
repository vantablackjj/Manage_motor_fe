import React from "react";
import { Tabs } from "antd";
import CongNoListPage from "./CongNoListPage";

const { TabPane } = Tabs;

const CongNoManage = () => {
  return (
    <div
      style={{ padding: "16px 8px", background: "#f0f2f5", minHeight: "100vh" }}
    >
      <h2 style={{ marginBottom: 16, paddingLeft: 8 }}>Quản lý Công Nợ</h2>
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="Tổng hợp công nợ" key="1">
          <CongNoListPage />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default CongNoManage;
