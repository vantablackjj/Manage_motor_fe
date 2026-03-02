import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Row,
  Col,
  Select,
  Button,
  Space,
  DatePicker,
  Typography,
  Statistic,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { reportAPI } from "../../../api";
import { formatService, notificationService } from "../../../services";
import dayjs from "dayjs";
import PartnerThanhToanModal from "./PartnerThanhToanModal";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const PartnerDebtList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [payModalVisible, setPayModalVisible] = useState(false);
  const [params, setParams] = useState({
    ma_kho: null,
    tu_ngay: dayjs().startOf("month"),
    den_ngay: dayjs(),
    loai_cong_no: null,
    search: "",
  });

  useEffect(() => {
    fetchData();
  }, [params.loai_cong_no, params.tu_ngay, params.den_ngay]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiParams = {
        ...params,
        tu_ngay: params.tu_ngay?.format("YYYY-MM-DD"),
        den_ngay: params.den_ngay?.format("YYYY-MM-DD"),
      };
      const res = await reportAPI.debt.getCustomer(apiParams);

      if (res?.data && res?.summary) {
        setData(res.data || []);
        setSummary(res.summary);
      } else {
        const rawData = res?.data !== undefined ? res.data : res;
        setData(Array.isArray(rawData) ? rawData : []);
        setSummary(null);
      }
    } catch (error) {
      notificationService.error("Không thể tải dữ liệu công nợ đối tác");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "loai_cong_no",
      key: "loai_cong_no",
      width: 120,
      render: (loai) => (
        <Tag
          color={loai === "PHAI_THU" ? "green" : "orange"}
          icon={loai === "PHAI_THU" ? <RiseOutlined /> : <FallOutlined />}
        >
          {loai === "PHAI_THU" ? "Phải thu" : "Phải trả"}
        </Tag>
      ),
    },
    {
      title: "Đối tác",
      dataIndex: "ho_ten",
      key: "ho_ten",
      render: (text, record) => (
        <div>
          <b>{text}</b>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.loai_doi_tac === "KHACH_HANG"
              ? "Khách hàng"
              : record.loai_doi_tac === "NHA_CUNG_CAP"
                ? "Nhà cung cấp"
                : "Cả hai"}{" "}
            ({record.ma_kh || record.ma_doi_tac})
          </Text>
        </div>
      ),
    },
    {
      title: "Tổng nợ",
      dataIndex: "tong_no",
      key: "tong_no",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Đã trả",
      dataIndex: "da_tra",
      key: "da_tra",
      align: "right",
      render: (val) => formatService.formatCurrency(val),
    },
    {
      title: "Còn lại",
      dataIndex: "con_lai",
      key: "con_lai",
      align: "right",
      render: (val, record) => (
        <strong
          style={{
            color: record.loai_cong_no === "PHAI_THU" ? "#52c41a" : "#ff4d4f",
          }}
        >
          {formatService.formatCurrency(val)}
        </strong>
      ),
    },
    {
      title: "Cập nhật cuối",
      dataIndex: "ngay_cap_nhat",
      key: "ngay_cap_nhat",
      render: (date) => formatService.formatDate(date),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<DollarOutlined />}
          onClick={() => {
            setSelectedPartner(record);
            setPayModalVisible(true);
          }}
        >
          Thanh toán
        </Button>
      ),
    },
  ];

  return (
    <div>
      {summary && (
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12}>
            <div
              style={{
                background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
                borderRadius: 16,
                padding: "24px",
                border: "1px solid #b7eb8f",
                boxShadow: "0 4px 12px rgba(82, 196, 26, 0.08)",
              }}
            >
              <Text
                type="secondary"
                style={{ fontSize: 13, display: "block", marginBottom: 8 }}
              >
                <RiseOutlined /> Tổng khách nợ (Phải thu)
              </Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#52c41a" }}>
                {formatService.formatCurrency(summary.tong_phai_thu || 0)}
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div
              style={{
                background: "linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)",
                borderRadius: 16,
                padding: "24px",
                border: "1px solid #ffd591",
                boxShadow: "0 4px 12px rgba(255, 122, 69, 0.08)",
              }}
            >
              <Text
                type="secondary"
                style={{ fontSize: 13, display: "block", marginBottom: 8 }}
              >
                <FallOutlined /> Tổng nợ nhà cung cấp (Phải trả)
              </Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#ff7a45" }}>
                {formatService.formatCurrency(summary.tong_phai_tra || 0)}
              </div>
            </div>
          </Col>
        </Row>
      )}

      <Card size="small" style={{ marginBottom: 24, borderRadius: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={10}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 4, fontSize: 12 }}
            >
              Khoảng thời gian
            </Text>
            <RangePicker
              style={{ width: "100%" }}
              value={[params.tu_ngay, params.den_ngay]}
              onChange={(dates) =>
                dates &&
                setParams({ ...params, tu_ngay: dates[0], den_ngay: dates[1] })
              }
              format="DD/MM/YYYY"
            />
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", marginBottom: 4, fontSize: 12 }}
            >
              Loại đối tác
            </Text>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn loại đối tác"
              allowClear
              value={params.loai_cong_no}
              onChange={(val) => setParams({ ...params, loai_cong_no: val })}
            >
              <Option value="PHAI_THU">Phải thu (Khách nợ)</Option>
              <Option value="PHAI_TRA">Phải trả (Nợ NCC)</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ paddingTop: 20 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                block
                type="primary"
                ghost
              >
                Làm mới
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        title="Danh sách công nợ chi tiết"
        size="small"
        style={{ borderRadius: 16 }}
      >
        <Table
          size="middle"
          dataSource={data}
          columns={columns}
          loading={loading}
          rowKey={(record) =>
            `${record.ma_kh || record.ma_doi_tac}_${record.loai_cong_no}`
          }
          pagination={{ pageSize: 15, size: "small" }}
          scroll={{ x: 800 }}
        />
      </Card>

      <PartnerThanhToanModal
        visible={payModalVisible}
        onCancel={() => setPayModalVisible(false)}
        onSuccess={() => {
          setPayModalVisible(false);
          fetchData();
        }}
        initData={selectedPartner}
      />
    </div>
  );
};

export default PartnerDebtList;
