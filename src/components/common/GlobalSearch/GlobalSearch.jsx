import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Input, List, Typography, Empty, Tag, Space } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  CarOutlined,
  ToolOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useResponsive } from "../../../hooks/useResponsive";
import { orderAPI, xeAPI, phuTungAPI, khachHangAPI } from "../../../api";
import "./GlobalSearch.css";

const { Text } = Typography;

const GlobalSearch = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchText("");
      setResults([]);
    }
  }, [visible]);

  const handleSearch = useCallback(async (val) => {
    if (!val || val.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Parallel search across different modules — dùng Promise.allSettled để không bị crash nếu 1 API lỗi
      const [orderRes, xeRes, ptRes, khRes] = await Promise.allSettled([
        orderAPI.getAll({ search: val, limit: 10 }),
        xeAPI.getAll({ search: val, limit: 10 }),
        phuTungAPI.getAll({ search: val, limit: 10 }),
        khachHangAPI.getAll({ search: val, limit: 10 }),
      ]);

      const formattedResults = [];

      if (orderRes.status === "fulfilled") {
        // axios interceptor trả về response.data trực tiếp
        // nên orderRes.value = { success: true, data: [...], pagination: {...} }
        const orderVal = orderRes.value;
        const orders = Array.isArray(orderVal?.data)
          ? orderVal.data
          : Array.isArray(orderVal)
            ? orderVal
            : [];
        orders.slice(0, 5).forEach((o) => {
          let link = `/sales/orders/${o.id}`;
          let subtitlePrefix = "Đơn bán hàng";
          let color = "#1890ff";

          // Cấu hình linh hoạt theo loại đơn hàng
          switch (o.loai_don_hang) {
            case "MUA_XE":
              link = `/purchase/vehicles/${o.so_don_hang}`;
              subtitlePrefix = "Đơn mua xe";
              color = "#52c41a";
              break;
            case "MUA_PT":
            case "MUA_PHU_TUNG":
              link = `/purchase/parts/${o.id}`;
              subtitlePrefix = "Đơn mua phụ tùng";
              color = "#faad14";
              break;
            case "CHUYEN_KHO":
              link = `/chuyen-kho/${o.so_don_hang}`;
              subtitlePrefix = "Phiếu chuyển kho";
              color = "#722ed1";
              break;
            case "BAN_HANG":
              link = `/sales/orders/${o.id}`;
              subtitlePrefix = "Đơn bán hàng";
              color = "#1890ff";
              break;
            default:
              break;
          }

          formattedResults.push({
            id: o.id || o.so_don_hang,
            title: o.so_don_hang,
            subtitle: `${subtitlePrefix} - ${o.ten_ben_nhap || o.ten_ben_xuat || ""}`,
            icon: <FileTextOutlined style={{ color }} />,
            type: "order",
            link,
          });
        });
      }

      if (xeRes.status === "fulfilled") {
        const xeVal = xeRes.value;
        const xes = Array.isArray(xeVal?.data)
          ? xeVal.data
          : Array.isArray(xeVal)
            ? xeVal
            : [];
        xes.slice(0, 3).forEach((x) => {
          formattedResults.push({
            id: x.xe_key || x.so_khung,
            title: x.xe_key || x.ten_xe,
            subtitle: `Xe - ${x.so_khung || ""}`,
            icon: <CarOutlined style={{ color: "#52c41a" }} />,
            type: "xe",
            link: `/xe/danh-sach?search=${x.xe_key}`,
          });
        });
      }

      if (ptRes.status === "fulfilled") {
        const ptVal = ptRes.value;
        const pts = Array.isArray(ptVal?.data)
          ? ptVal.data
          : Array.isArray(ptVal)
            ? ptVal
            : [];
        pts.slice(0, 3).forEach((p) => {
          formattedResults.push({
            id: p.ma_pt,
            title: p.ten_pt,
            subtitle: `Phụ tùng - ${p.ma_pt}`,
            icon: <ToolOutlined style={{ color: "#faad14" }} />,
            type: "part",
            link: `/phu-tung/danh-sach?search=${p.ma_pt}`,
          });
        });
      }

      if (khRes.status === "fulfilled") {
        const khVal = khRes.value;
        const khs = Array.isArray(khVal?.data)
          ? khVal.data
          : Array.isArray(khVal)
            ? khVal
            : [];
        khs.slice(0, 3).forEach((k) => {
          formattedResults.push({
            id: k.id || k.ma_kh,
            title: k.ho_ten || k.ten_khach_hang,
            subtitle: `Đối tác - ${k.so_dien_thoai || ""}`,
            icon: <TeamOutlined style={{ color: "#722ed1" }} />,
            type: "partner",
            link: k.la_nha_cung_cap
              ? "/danh-muc/nha-cung-cap"
              : "/danh-muc/khach-hang",
          });
        });
      }

      setResults(formattedResults);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchText);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, handleSearch]);

  const handleSelect = (item) => {
    navigate(item.link);
    onClose();
    setSearchText("");
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      closable={false}
      className="global-search-modal"
      width={isMobile ? "96%" : 600}
      style={{ top: isMobile ? 50 : 100 }}
    >
      <Input
        ref={inputRef}
        prefix={<SearchOutlined style={{ fontSize: 20, color: "#bfbfbf" }} />}
        placeholder="Tìm đơn hàng, xe, phụ tùng, khách hàng..."
        size="large"
        variant="borderless"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        suffix={
          <Space>
            {loading && <Text type="secondary">Đang tìm...</Text>}
            <Tag color="cyan">ESC để thoát</Tag>
          </Space>
        }
        className="search-input"
      />
      <div className="search-results-container">
        {searchText.length < 2 ? (
          <div className="search-hotkeys">
            <Text type="secondary">Nhập ít nhất 2 ký tự để tìm kiếm</Text>
          </div>
        ) : results.length > 0 ? (
          <List
            dataSource={results}
            renderItem={(item) => (
              <List.Item
                className="search-result-item"
                onClick={() => handleSelect(item)}
              >
                <div className="result-icon">{item.icon}</div>
                <div className="result-content">
                  <Text strong className="result-title">
                    {item.title}
                  </Text>
                  <br />
                  <Text type="secondary" className="result-subtitle">
                    {item.subtitle}
                  </Text>
                </div>
                <div className="result-action">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Enter ↵
                  </Text>
                </div>
              </List.Item>
            )}
          />
        ) : !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy kết quả"
          />
        ) : null}
      </div>
    </Modal>
  );
};

export default GlobalSearch;
