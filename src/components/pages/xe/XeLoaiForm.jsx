import { Form, Input, Button, Select, InputNumber, Space } from "antd";

import { danhMucAPI } from "../../../api";
import { notificationService } from "../../../services";
import { useEffect } from "react";

const XeLoaiForm = ({
  initialData,
  onSuccess,
  nhanHieuList = [],
  loaiHinhList = [],
  noiSanXuatList = [],
}) => {
  const [form] = Form.useForm();
  useEffect(() => {
    console.log(initialData, noiSanXuatList[0].ten_noi_sx);
  }, [initialData, noiSanXuatList]);
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        noi_sx: initialData.noi_sx ?? null,
      });
    }
  }, [initialData]);

  const cleanPayload = (values) => {
    const payload = { ...values };

    if (!payload.noi_sx || payload.noi_sx === "undefined") {
      delete payload.noi_sx;
    }

    return payload;
  };


  const onFinish = async (values) => {
    try {
      const payload = cleanPayload(values);

      if (initialData) {
        await danhMucAPI.modelCar.update(initialData.ma_loai, payload);
        notificationService.success("Cập nhật thành công");
      } else {
        await danhMucAPI.modelCar.create(payload);
        notificationService.success("Thêm mới thành công");
      }

      onSuccess();
    } catch {
      notificationService.error("Lưu dữ liệu thất bại");
    }
  };

  const handleSubmit = () => {
    form.submit();
  };
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData || { vat: 10 }}
      onFinish={onFinish}
    >
      <Form.Item name="ma_loai" label="Mã loại xe" rules={[{ required: true }]}>
        <Input disabled={!!initialData} />
      </Form.Item>

      <Form.Item
        name="ten_loai"
        label="Tên loại xe"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="ma_nh" label="Nhãn hiệu" rules={[{ required: true }]}>
        <Select placeholder="Chọn nhãn hiệu">
          {nhanHieuList.map((nh) => (
            <Select.Option key={nh.ma_nh} value={String(nh.ma_nh)}>
              {nh.ten_nh}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="noi_sx" label="Nơi sản xuất">
        <Select allowClear placeholder="Chọn nơi sản xuất">
          {noiSanXuatList
            .filter((nsx) => nsx.ma != null)
            .map((nsx) => (
              <Select.Option key={nsx.ma} value={String(nsx.ma)}>
                {nsx.ten_noi_sx}
              </Select.Option>
            ))}
        </Select>
      </Form.Item>

      <Form.Item name="loai_hinh" label="Loại hình">
        <Select allowClear>
          {loaiHinhList.map((lh) => (
            <Select.Option key={lh.ma_lh} value={lh.ma_lh}>
              {lh.ten_lh}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="gia_nhap" label="Giá nhập">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="gia_ban" label="Giá bán">
        <InputNumber style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="vat" label="VAT (%)">
        <InputNumber min={0} max={100} />
      </Form.Item>

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onSuccess}>Hủy</Button>
        <Button type="primary" onClick={handleSubmit}>
          Lưu
        </Button>
      </Space>
      
    </Form>
  );
};

export default XeLoaiForm;
