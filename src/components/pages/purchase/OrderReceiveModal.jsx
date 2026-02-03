import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Input,
  InputNumber,
  Button,
  Form,
  message,
  Alert,
  Space,
  Select,
  Checkbox,
  Row,
  Col,
} from "antd";
import { donHangMuaXeAPI, danhMucAPI } from "../../../api";

const OrderReceiveModal = ({ visible, onCancel, orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [form] = Form.useForm();
  const [colors, setColors] = useState([]);

  useEffect(() => {
    if (visible && orderId) {
      fetchMasterData();
      fetchOrderDetail();
    } else {
      setItems([]);
      form.resetFields();
    }
  }, [visible, orderId]);

  const fetchMasterData = async () => {
    try {
      const res = await danhMucAPI.color.getAll();
      setColors(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Lỗi tải danh mục màu:", error);
    }
  };

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await donHangMuaXeAPI.getById(orderId);
      const data = res.data;
      const detailItems = data.chi_tiet || data.items || [];

      // Logic: Only show items that still have quantity remaining
      // Backend should provide `so_luong_con_lai`. If not, calculate it (so_luong - so_luong_da_giao).
      const pendingItems = detailItems
        .map((item) => {
          const ordered = item.so_luong || 0;
          const delivered = item.so_luong_da_giao || 0;
          const remaining =
            item.so_luong_con_lai !== undefined
              ? item.so_luong_con_lai
              : ordered - delivered;

          return {
            ...item,
            key: item.id,
            so_luong: ordered,
            so_luong_da_giao: delivered,
            so_luong_con_lai: remaining,
            input_qty: 0,
          };
        })
        .filter((item) => item.so_luong_con_lai > 0);

      setItems(pendingItems);
      form.resetFields();
    } catch (error) {
      message.error("Không thể lấy thông tin đơn hàng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const vehiclesPayload = [];

      items.forEach((item) => {
        const inputQty = values[`items_${item.key}_qty`] || 0;
        if (inputQty <= 0) return;

        const serials = values[`items_${item.key}_serials`] || [];

        // Add each serial entry to payload
        for (let i = 0; i < inputQty; i++) {
          const entry = serials[i] || {};
          vehiclesPayload.push({
            id: item.id, // Repeats ID for each vehicle
            ma_loai_xe: item.ma_loai_xe,
            ma_mau: entry.ma_mau || item.ma_mau || item.kho_mau,
            so_khung: entry.so_khung,
            so_may: entry.so_may,
            don_gia: item.don_gia,
          });
        }
      });

      if (vehiclesPayload.length === 0) {
        message.warning("Vui lòng nhập số kiểm tra thông tin xe cần nhập");
        return;
      }

      setLoading(true);
      console.log("Submitting Payload:", { vehicles: vehiclesPayload });

      const res = await donHangMuaXeAPI.nhapKho(orderId, {
        vehicles: vehiclesPayload,
        payment_info: values.payment_info,
      });

      const { success, errors } = res.data || {};

      if (errors && errors.length > 0) {
        const errorMsg = errors
          .map((e) => `Xe (ID dòng: ${e.id}): ${e.message}`)
          .join(", ");
        message.warning(`Có lỗi: ${errorMsg}. Các xe hợp lệ đã được nhập.`);
        if (success && success.length > 0) {
          onSuccess?.();
          onCancel();
        }
      } else {
        message.success(`Nhập kho thành công ${vehiclesPayload.length} xe!`);
        onSuccess?.();
        onCancel();
      }
    } catch (error) {
      console.error(error);
      message.error(error.message || "Có lỗi xảy ra khi nhập kho");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã hàng",
      dataIndex: "ma_loai_xe",
      width: 120,
    },
    {
      title: "Tên hàng",
      dataIndex: "ten_loai_xe",
    },
    {
      title: "Tiến độ (Đã/Tất cả)",
      key: "progress",
      width: 140,
      render: (_, record) => (
        <span>
          {record.so_luong_da_giao} / {record.so_luong}
        </span>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "so_luong_con_lai",
      width: 80,
      render: (val) => <b style={{ color: "red" }}>{val}</b>,
    },
    {
      title: "SL Nhập lần này",
      key: "input_qty",
      width: 150,
      render: (_, record) => (
        <Form.Item
          name={`items_${record.key}_qty`}
          initialValue={0}
          rules={[
            {
              type: "number",
              min: 0,
              max: record.so_luong_con_lai,
              message: `Tối đa ${record.so_luong_con_lai}`,
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            min={0}
            max={record.so_luong_con_lai}
            style={{ width: "100%" }}
            placeholder="0"
          />
        </Form.Item>
      ),
    },
  ];

  const expandable = {
    expandedRowRender: (record) => {
      return (
        <Form.Item
          noStyle
          shouldUpdate={(prev, curr) =>
            prev[`items_${record.key}_qty`] !== curr[`items_${record.key}_qty`]
          }
        >
          {({ getFieldValue }) => {
            const qty = getFieldValue(`items_${record.key}_qty`) || 0;
            if (qty <= 0) return null;

            return (
              <div
                style={{
                  padding: "16px",
                  background: "#fafafa",
                  border: "1px solid #f0f0f0",
                  borderRadius: 4,
                }}
              >
                <h4>Nhập thông tin cho {qty} xe:</h4>
                <Form.List name={`items_${record.key}_serials`}>
                  {(fields) => {
                    return Array.from({ length: qty }).map((_, i) => (
                      <Space
                        key={i}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="start"
                      >
                        <span style={{ lineHeight: "32px", width: 30 }}>
                          #{i + 1}
                        </span>
                        <Form.Item
                          name={[i, "so_khung"]}
                          rules={[{ required: true, message: "Số khung" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Số khung *" />
                        </Form.Item>
                        <Form.Item
                          name={[i, "so_may"]}
                          rules={[{ required: true, message: "Số máy" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Input placeholder="Số máy *" />
                        </Form.Item>
                        <Form.Item
                          name={[i, "ma_mau"]}
                          rules={[{ required: true, message: "Màu" }]}
                          initialValue={record.ma_mau || record.kho_mau}
                          style={{ marginBottom: 0, width: 150 }}
                        >
                          <Select
                            placeholder="Màu"
                            showSearch
                            optionFilterProp="children"
                          >
                            {colors.map((c) => (
                              <Select.Option key={c.ma_mau} value={c.ma_mau}>
                                {c.ten_mau}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Space>
                    ));
                  }}
                </Form.List>
              </div>
            );
          }}
        </Form.Item>
      );
    },
    defaultExpandAllRows: true,
  };

  return (
    <Modal
      title={`Nhập kho (Nhiều lần) - Đơn: ${orderId}`}
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={900}
      confirmLoading={loading}
      okText="Xác nhận"
    >
      <Form form={form} layout="vertical">
        <Alert
          message="Nhập số lượng thực tế về đợt này. Hệ thống sẽ tạo ô nhập Số khung/Số máy tương ứng."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={items}
          columns={columns}
          rowKey="key"
          pagination={false}
          size="small"
          expandable={expandable}
        />

        <div
          style={{
            marginTop: 24,
            borderTop: "1px solid #f0f0f0",
            paddingTop: 16,
          }}
        >
          <h3>Thông tin thanh toán (Tùy chọn)</h3>
          <Form.Item
            name={["payment_info", "should_pay"]}
            valuePropName="checked"
          >
            <Checkbox>Thanh toán ngay</Checkbox>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.payment_info?.should_pay !== current.payment_info?.should_pay
            }
          >
            {({ getFieldValue }) =>
              getFieldValue(["payment_info", "should_pay"]) && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={["payment_info", "amount"]}
                      label="Số tiền"
                      rules={[{ required: true, message: "Nhập số tiền" }]}
                      initialValue={0}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={["payment_info", "method"]}
                      label="Hình thức"
                      rules={[{ required: true }]}
                      initialValue="TIEN_MAT"
                    >
                      <Select>
                        <Select.Option value="TIEN_MAT">Tiền mặt</Select.Option>
                        <Select.Option value="NGAN_HANG">
                          Ngân hàng
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              )
            }
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default OrderReceiveModal;
