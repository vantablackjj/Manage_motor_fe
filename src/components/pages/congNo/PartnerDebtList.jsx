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

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;

const PartnerDebtList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
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
              : "Nhà cung cấp"}{" "}
            ({record.ma_doi_tac})
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
  ];

  return (
    <div>
      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng khách nợ (Phải thu)"
                value={summary.tong_phai_thu || 0}
                precision={0}
                valueStyle={{ color: "#52c41a" }}
                prefix={<RiseOutlined />}
                suffix="₫"
                formatter={(val) => formatService.formatCurrency(val)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="Tổng nợ nhà cung cấp"
                value={summary.tong_phai_tra || 0}
                precision={0}
                valueStyle={{ color: "#ff4d4f" }}
                prefix={<FallOutlined />}
                suffix="₫"
                formatter={(val) => formatService.formatCurrency(val)}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
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
          <Col xs={24} sm={6} md={6}>
            <Select
              style={{ width: "100%" }}
              placeholder="Loại đối tác"
              allowClear
              value={params.loai_cong_no}
              onChange={(val) => setParams({ ...params, loai_cong_no: val })}
            >
              <Option value="PHAI_THU">Phải thu (Khách nợ)</Option>
              <Option value="PHAI_TRA">Phải trả (Nợ nhà cung cấp)</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6} md={4}>
            <Button icon={<ReloadOutlined />} onClick={fetchData} block>
              {" "}
              Làm mới{" "}
            </Button>
          </Col>
        </Row>
      </Card>

      <Table
        size="small"
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="ma_doi_tac"
        pagination={{ pageSize: 15 }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default PartnerDebtList;
