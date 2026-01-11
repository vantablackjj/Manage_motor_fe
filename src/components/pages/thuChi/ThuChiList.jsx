import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Row,
  Col,
  DatePicker,
  Statistic,
  Radio,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileExcelOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import ImportButton from "../../features/Import/ImportButton";
import ExportButton from "../../features/Export/ExportButton";
import { useNavigate } from "react-router-dom";
import { thuChiAPI, khoAPI, khachHangAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import { TRANG_THAI_COLORS, LOAI_THU_CHI } from "../../../utils/constant";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title } = Typography;

const ThuChiList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [khoList, setKhoList] = useState([]);
  const [partners, setPartners] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [summary, setSummary] = useState({
    tong_thu: 0,
    tong_chi: 0,
    chenh_lech: 0,
  });

  const [filters, setFilters] = useState({
    loai: null,
    trang_thai: null,
    ma_kho: null,
    ma_kh: null,
    tu_ngay: null,
    den_ngay: null,
    keyword: "",
  });

  useEffect(() => {
    fetchInitialData();
    fetchData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [khos, khs] = await Promise.all([
        khoAPI.getAll(),
        khachHangAPI.getAll(),
      ]);
      setKhoList(khos || []);
      setPartners(khs.data || khs || []);
    } catch (error) {
      console.error("Error fetching master data:", error);
    }
  };

  const fetchData = async (
    page = pagination.current,
    limit = pagination.pageSize,
    currentFilters = filters
  ) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        ...currentFilters,
      };

      if (params.tu_ngay) params.tu_ngay = params.tu_ngay.format("YYYY-MM-DD");
      if (params.den_ngay)
        params.den_ngay = params.den_ngay.format("YYYY-MM-DD");

      const res = await thuChiAPI.getAll(params);
      if (res.success) {
        setData(res.data.data || []);
        setPagination({
          ...pagination,
          current: page,
          total: res.data.pagination?.total || 0,
        });

        // In a real app, summary might come from API.
        // If not, we calculate from the current list (though it's only one page)
        // For now, let's assume we might need a separate API or calculate client-side if data is small
        if (res.data.summary) {
          setSummary(res.data.summary);
        } else {
          calculateLocalSummary(res.data.data || []);
        }
      }
    } catch (error) {
      notificationService.error("Lỗi tải danh sách thu chi");
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalSummary = (transactions) => {
    const tong_thu = transactions
      .filter((t) => t.loai === LOAI_THU_CHI.THU && t.trang_thai === "DA_DUYET")
      .reduce((sum, t) => sum + Number(t.so_tien), 0);
    const tong_chi = transactions
      .filter((t) => t.loai === LOAI_THU_CHI.CHI && t.trang_thai === "DA_DUYET")
      .reduce((sum, t) => sum + Number(t.so_tien), 0);
    setSummary({
      tong_thu,
      tong_chi,
      chenh_lech: tong_thu - tong_chi,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "so_phieu",
      key: "so_phieu",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai",
      render: (type) => (
        <Tag color={type === LOAI_THU_CHI.THU ? "green" : "red"}>
          {type === LOAI_THU_CHI.THU ? "↑ Thu" : "↓ Chi"}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "so_tien",
      key: "so_tien",
      align: "right",
      render: (val, record) => (
        <span
          style={{
            color: record.loai === LOAI_THU_CHI.THU ? "#52c41a" : "#ff4d4f",
            fontWeight: "bold",
          }}
        >
          {formatService.formatCurrency(Number(val))}
        </span>
      ),
    },
    {
      title: "Ngày giao dịch",
      dataIndex: "ngay_giao_dich",
      render: (val) => formatService.formatDate(val),
    },
    {
      title: "Kho",
      dataIndex: "ma_kho",
      key: "ma_kho",
    },
    {
      title: "Khách hàng/NCC",
      dataIndex: "ma_kh",
      key: "ma_kh",
      render: (val) => {
        const partner = partners.find((p) => p.ma_kh === val);
        return partner ? partner.ho_ten : val;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "trang_thai",
      align: "center",
      render: (status) => (
        <Tag color={TRANG_THAI_COLORS[status] || "default"}>
          {formatService.formatTrangThai(status)}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/thu-chi/${record.so_phieu}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "16px 8px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} size="small">
            <Statistic
              title="Tổng Thu"
              value={summary.tong_thu}
              precision={0}
              valueStyle={{ color: "#3f8600", fontSize: "18px" }}
              prefix={<ArrowUpOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} size="small">
            <Statistic
              title="Tổng Chi"
              value={summary.tong_chi}
              precision={0}
              valueStyle={{ color: "#cf1322", fontSize: "18px" }}
              prefix={<ArrowDownOutlined />}
              suffix="₫"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} size="small">
            <Statistic
              title="Chênh lệch"
              value={summary.chenh_lech}
              precision={0}
              valueStyle={{
                color: summary.chenh_lech >= 0 ? "#3f8600" : "#cf1322",
                fontSize: "18px",
              }}
              suffix="₫"
            />
          </Card>
        </Col>
      </Row>

      <Card size="small">
        <Row
          justify="space-between"
          align="middle"
          gutter={[8, 16]}
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} md={12}>
            <Title level={4} style={{ margin: 0 }}>
              <DollarOutlined /> Quản lý Thu Chi
            </Title>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Space wrap>
              <ImportButton
                module="thu-chi"
                title="Phiếu Thu Chi"
                onSuccess={fetchData}
              />
              <ExportButton
                module="thu-chi"
                title="Phiếu Thu Chi"
                params={filters}
              />
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
                onClick={() => navigate("/thu-chi/create?loai=THU")}
              >
                Thu
              </Button>
              <Button
                type="primary"
                danger
                icon={<PlusOutlined />}
                onClick={() => navigate("/thu-chi/create?loai=CHI")}
              >
                Chi
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={12} md={6}>
                <Radio.Group
                  value={filters.loai}
                  onChange={(e) => handleFilterChange("loai", e.target.value)}
                  buttonStyle="solid"
                  style={{ width: "100%", display: "flex" }}
                >
                  <Radio.Button
                    value={null}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Tất cả
                  </Radio.Button>
                  <Radio.Button
                    value={LOAI_THU_CHI.THU}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Thu
                  </Radio.Button>
                  <Radio.Button
                    value={LOAI_THU_CHI.CHI}
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    Chi
                  </Radio.Button>
                </Radio.Group>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("trang_thai", v)}
                >
                  <Option value="NHAP">Nháp</Option>
                  <Option value="GUI_DUYET">Chờ duyệt</Option>
                  <Option value="DA_DUYET">Đã duyệt</Option>
                  <Option value="DA_HUY">Đã hủy</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Chọn kho"
                  style={{ width: "100%" }}
                  allowClear
                  onChange={(v) => handleFilterChange("ma_kho", v)}
                >
                  {khoList.map((k) => (
                    <Option key={k.ma_kho} value={k.ma_kho}>
                      {k.ten_kho}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={(dates) => {
                    handleFilterChange("tu_ngay", dates ? dates[0] : null);
                    handleFilterChange("den_ngay", dates ? dates[1] : null);
                  }}
                />
              </Col>
            </Row>
            <Row gutter={[8, 8]}>
              <Col xs={18} sm={20} md={20}>
                <Input
                  placeholder="Số phiếu, diễn giải..."
                  prefix={<SearchOutlined />}
                  style={{ width: "100%" }}
                  onChange={(e) =>
                    handleFilterChange("keyword", e.target.value)
                  }
                  onPressEnter={() => fetchData()}
                />
              </Col>
              <Col xs={6} sm={4} md={4}>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => fetchData()}
                  block
                >
                  Tìm
                </Button>
              </Col>
            </Row>
          </Space>
        </div>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="so_phieu"
          loading={loading}
          size="small"
          scroll={{ x: 900 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100"],
            showTotal: (total) => `Tổng: ${total}`,
            size: "small",
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  );
};

export default ThuChiList;
