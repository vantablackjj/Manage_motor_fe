import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Alert,
  message,
  Form,
  Row,
  Col,
  Select,
  Button,
  Space,
} from "antd";
import { LockOutlined, SearchOutlined } from "@ant-design/icons";
import { phuTungKhoaAPI, khoAPI } from "../../../api";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;

const DanhSachKhoaTab = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [kho, setKho] = useState([]);
  const { isMobile } = useResponsive();

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchKho();
    fetchData({});
  }, []);

  // Fetch danh sách kho
  const fetchKho = async () => {
    try {
      const res = await khoAPI.getAll();
      setKho(res || []);
    } catch (err) {
      message.error("Không thể tải danh sách kho");
    }
  };

  // Fetch danh sách phụ tùng khóa
  const fetchData = async (params) => {
    setLoading(true);
    try {
      const res = await phuTungKhoaAPI.getAllByKho(params);
      if (res?.data?.success) {
        setData(res.data.data || []);
      } else {
        setData([]);
      }
    } catch (err) {
      message.error("Không thể tải danh sách phụ tùng khóa");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const onSearch = () => {
    const values = form.getFieldsValue();
    const params = {};
    if (values.ma_kho) params.ma_kho = values.ma_kho;
    fetchData(params);
  };

  // Xử lý reset
  const onReset = () => {
    form.resetFields();
    fetchData({});
  };

  // Columns cho Table
  const columns = [
    {
      title: "Mã PT",
      dataIndex: "ma_pt",
      width: 100,
      fixed: isMobile ? false : "left",
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "ten_pt",
      width: 200,
      ellipsis: true,
    },
    !isMobile && {
      title: "Kho",
      dataIndex: "ma_kho",
      width: 120,
      render: (ma_kho) => {
        const k = kho.find((k) => k.ma_kho === ma_kho);
        return k ? k.ten_kho : ma_kho;
      },
    },
    {
      title: "Số phiếu",
      dataIndex: "so_phieu",
      width: 120,
      render: (val) => <Tag color="red">{val}</Tag>,
    },
    !isMobile && {
      title: "Loại phiếu",
      dataIndex: "loai_phieu",
      width: 120,
    },
    {
      title: "SL khóa",
      dataIndex: "so_luong_khoa",
      width: 100,
      align: "right",
      render: (val) => <Tag color="orange">{val}</Tag>,
    },
    !isMobile && {
      title: "Ngày khóa",
      dataIndex: "ngay_khoa",
      width: 160,
      render: (val) => new Date(val).toLocaleString("vi-VN"),
    },
    !isMobile && {
      title: "Lý do",
      dataIndex: "ly_do",
      ellipsis: true,
    },
  ].filter(Boolean);

  return (
    <>
      <Alert
        message="Danh sách phụ tùng đang bị khóa"
        description="Tìm kiếm và theo dõi các phụ tùng đang bị khóa theo kho hoặc phụ tùng"
        type="warning"
        showIcon
        icon={<LockOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* SEARCH FORM */}
      <Form form={form} layout="vertical">
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Kho" name="ma_kho">
              <Select placeholder="Chọn kho" allowClear>
                {kho.map((k) => (
                  <Option key={k.ma_kho} value={k.ma_kho}>
                    {k.ten_kho} ({k.ma_kho})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col
            xs={24}
            sm={24}
            md={4}
            style={{
              display: "flex",
              alignItems: isMobile ? "stretch" : "flex-end",
            }}
          >
            <Space
              style={{ width: "100%" }}
              direction={isMobile ? "vertical" : "horizontal"}
              wrap
            >
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={onSearch}
                block={isMobile}
              >
                Tìm kiếm
              </Button>
              <Button onClick={onReset} block={isMobile}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* TABLE */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: "max-content" }}
        pagination={{
          pageSize: isMobile ? 8 : 10,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
      />
    </>
  );
};

export default DanhSachKhoaTab;
