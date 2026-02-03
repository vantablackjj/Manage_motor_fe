import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  InputNumber,
  message,
  Form,
  Tag,
  Space,
  Typography,
  Button,
} from "antd";
import { donHangAPI } from "../../../../api";

const { Text } = Typography;

const PartReceiveModal = ({ visible, onCancel, orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && orderId) {
      fetchOrderDetails();
    } else {
      setItems([]);
      form.resetFields();
    }
  }, [visible, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await donHangAPI.getById(orderId);
      const data = res.data?.data || res.data || {};

      const detailItems = data.chi_tiet || data.details || [];

      const processedItems = detailItems.map((item) => {
        const ordered = Number(item.so_luong || 0);
        const delivered = Number(item.so_luong_da_giao || 0);
        const remaining = Math.max(0, ordered - delivered);

        return {
          ...item,
          // Ensure we have a valid ID for the payload
          id: item.id || item.tm_don_hang_chi_tiet_id,
          key: item.id || item.tm_don_hang_chi_tiet_id,
          so_luong_dat: ordered,
          so_luong_da_giao: delivered,
          so_luong_con_lai: remaining,
        };
      });

      setItems(processedItems);

      // Default to 0 for partial receiving safety
      const initialValues = {};
      processedItems.forEach((item) => {
        initialValues[`qty_${item.key}`] = 0;
      });
      form.setFieldsValue(initialValues);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAll = () => {
    const values = {};
    items.forEach((item) => {
      values[`qty_${item.key}`] = item.so_luong_con_lai;
    });
    form.setFieldsValue(values);
  };

  const handleClearAll = () => {
    const values = {};
    items.forEach((item) => {
      values[`qty_${item.key}`] = 0;
    });
    form.setFieldsValue(values);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payloadItems = [];

      items.forEach((item) => {
        const qty = values[`qty_${item.key}`] || 0;

        if (qty > 0) {
          payloadItems.push({
            id: item.id,
            so_luong_nhap: qty,
            don_gia: item.don_gia,
          });
        }
      });

      if (payloadItems.length === 0) {
        message.warning("Vui lòng nhập số lượng cho ít nhất 1 dòng hàng");
        return;
      }

      setLoading(true);
      const payload = {
        danh_sach_hang: payloadItems,
      };

      await donHangAPI.nhapKho(orderId, payload);

      message.success("Nhập kho thành công!");
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error(error);
      message.error(
        "Lỗi nhập kho: " + (error?.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã phụ tùng",
      dataIndex: "ma_hang_hoa",
      width: 120,
      render: (text, record) => <b>{text || record.ma_pt}</b>,
    },
    {
      title: "Tên phụ tùng",
      dataIndex: "ten_pt",
      width: 200,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small>{record.don_vi_tinh}</small>
        </div>
      ),
    },
    {
      title: "SL Đặt",
      dataIndex: "so_luong_dat",
      align: "center",
      width: 80,
    },
    {
      title: "Đã giao",
      dataIndex: "so_luong_da_giao",
      align: "center",
      width: 80,
      render: (val) => <span style={{ color: "blue" }}>{val}</span>,
    },
    {
      title: "Còn lại",
      dataIndex: "so_luong_con_lai",
      align: "center",
      width: 80,
      render: (val) => <b style={{ color: "red" }}>{val}</b>,
    },
    {
      title: "SL Nhập lần này",
      key: "input_qty",
      width: 140,
      render: (_, record) => (
        <Form.Item
          name={`qty_${record.key}`}
          rules={[
            { required: true, message: "Nhập SL" },
            {
              type: "number",
              min: 0,
              max: record.so_luong_con_lai,
              message: `Max ${record.so_luong_con_lai}`,
            },
          ]}
          style={{ margin: 0 }}
        >
          <InputNumber
            min={0}
            max={record.so_luong_con_lai}
            style={{ width: "100%" }}
            disabled={record.so_luong_con_lai <= 0}
            placeholder="0"
          />
        </Form.Item>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <span>Nhập kho Phụ tùng - Đơn {orderId}</span>
          {items.length > 0 && <Tag color="blue">{items.length} mặt hàng</Tag>}
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={900}
      confirmLoading={loading}
      okText="Xác nhận nhập kho"
    >
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Space>
          <Button size="small" onClick={handleClearAll}>
            Reset (0)
          </Button>
          <Button type="primary" ghost size="small" onClick={handleFillAll}>
            Nhập tất cả còn lại
          </Button>
        </Space>
      </div>
      <Form form={form}>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </Form>
    </Modal>
  );
};

export default PartReceiveModal;
