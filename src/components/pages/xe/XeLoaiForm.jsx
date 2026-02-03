import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  TreeSelect,
} from "antd";
import { danhMucAPI } from "../../../api";
import { notificationService } from "../../../services";
import { useEffect, useState } from "react";

const XeLoaiForm = ({
  initialData,
  onSuccess,
  loaiHinhList = [],
  noiSanXuatList = [],
}) => {
  const [form] = Form.useForm();
  const [nhomHangTree, setNhomHangTree] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNhomHang();
  }, []);

  const fetchNhomHang = async () => {
    try {
      const res = await danhMucAPI.brand.getAll();
      setNhomHangTree(res?.data || res || []);
    } catch (error) {
      console.error("Failed to fetch nhom hang tree", error);
    }
  };

  useEffect(() => {
    if (initialData) {
      // Data enrichment for Edit: Map names to codes if codes are missing
      let mappedLoaiHinh =
        initialData.loai_hinh || initialData.thong_so_ky_thuat?.loai_hinh;
      // If loai_hinh code is not directly available, try to find it using ten_lh from the list
      if (!mappedLoaiHinh && initialData.ten_lh && loaiHinhList.length > 0) {
        const found = loaiHinhList.find(
          (item) =>
            item.ten_lh?.toLowerCase() === initialData.ten_lh?.toLowerCase(),
        );
        if (found) mappedLoaiHinh = found.ma_lh;
      }

      let mappedNoiSx =
        initialData.noi_sx || initialData.thong_so_ky_thuat?.noi_sx;
      // If noi_sx code is not directly available, try to find it using ten_noi_sx from the list
      if (!mappedNoiSx && initialData.ten_noi_sx && noiSanXuatList.length > 0) {
        const found = noiSanXuatList.find(
          (item) =>
            item.ten_noi_sx?.toLowerCase() ===
            initialData.ten_noi_sx?.toLowerCase(),
        );
        if (found) mappedNoiSx = found.ma;
      }

      form.setFieldsValue({
        ...initialData,
        noi_sx: mappedNoiSx,
        loai_hinh: mappedLoaiHinh,
        phan_khoi: initialData.thong_so_ky_thuat?.phan_khoi,
      });
    }
  }, [initialData, loaiHinhList, noiSanXuatList]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ma_loai: values.ma_loai,
        ten_loai: values.ten_loai,
        ma_nh: values.ma_nh,
        loai_quan_ly: "SERIAL",
        loai_hinh: values.loai_hinh,
        noi_sx: values.noi_sx,
        gia_nhap: values.gia_nhap,
        gia_ban: values.gia_ban,
        don_vi_tinh: values.don_vi_tinh || "Chiếc",
        vat: values.vat,
        thong_so_ky_thuat: {
          phan_khoi: values.phan_khoi,
        },
      };

      if (initialData) {
        await danhMucAPI.modelCar.update(initialData.ma_loai, payload);
        notificationService.success("Cập nhật thành công");
      } else {
        await danhMucAPI.modelCar.create(payload);
        notificationService.success("Thêm mới thành công");
      }

      onSuccess();
    } catch (error) {
      notificationService.error("Lưu dữ liệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData || { vat: 10, don_vi_tinh: "Chiếc" }}
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

      <Form.Item
        name="ma_nh"
        label="Nhãn hiệu (Nhóm hàng)"
        rules={[{ required: true }]}
      >
        <Select
          placeholder="Chọn nhãn hiệu"
          allowClear
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={nhomHangTree.map((b) => ({
            label: b.ten_nh,
            value: b.ma_nh,
          }))}
        />
      </Form.Item>

      <Form.Item name="phan_khoi" label="Phân khối">
        <Input placeholder="VD: 125cc" />
      </Form.Item>

      <Form.Item name="noi_sx" label="Nơi sản xuất">
        <Select allowClear placeholder="Chọn nơi sản xuất">
          {noiSanXuatList.map((nsx) => (
            <Select.Option key={nsx.ma} value={nsx.ma}>
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
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>

      <Form.Item name="gia_ban" label="Giá bán">
        <InputNumber
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>

      <Form.Item name="don_vi_tinh" label="Đơn vị tính">
        <Input />
      </Form.Item>

      <Form.Item name="vat" label="VAT (%)">
        <InputNumber min={0} max={100} />
      </Form.Item>

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={onSuccess}>Hủy</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Lưu
        </Button>
      </Space>
    </Form>
  );
};

export default XeLoaiForm;
