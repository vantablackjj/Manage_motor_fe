import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Space,
  Tag,
  DatePicker,
  Row,
  Col,
  Divider,
  Tooltip,
} from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import QrScannerModal from "../../common/QrScanner/QrScannerModal";
import dayjs from "dayjs";
import { xeAPI } from "../../../api";
import { notificationService, formatService } from "../../../services";
import { useResponsive } from "../../../hooks/useResponsive";

const { Option } = Select;
const { TextArea } = Input;

const XeForm = ({
  mode = "create",
  initialData,
  loaiXeList = [],
  mauList = [],
  khoList = [],
  currentKho,
  onSuccess,
  onCancel,
}) => {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrTarget, setQrTarget] = useState(null); // 'so_khung' | 'so_may'
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        ma_loai: initialData.ma_loai || initialData.ma_loai_xe,
        ma_kho: initialData.ma_kho || initialData.ma_kho_hien_tai || currentKho,
        ngay_nhap: initialData.ngay_nhap ? dayjs(initialData.ngay_nhap) : null,
      });
    } else if (isCreate && currentKho) {
      // Set default kho when creating
      form.setFieldsValue({
        ma_kho_hien_tai: currentKho,
        vat: 10,
        trang_thai: "TON_KHO",
      });
    }
  }, [initialData, form, isCreate, currentKho]);

  const onFinish = async (values) => {
    if (isView) return;

    setLoading(true);
    try {
      const payload = {
        ...values,
        ma_kho_hien_tai: values.ma_kho,
        ma_loai_xe: values.ma_loai,
        ngay_nhap: values.ngay_nhap
          ? values.ngay_nhap.format("YYYY-MM-DD")
          : null,
      };

      if (isEdit) {
        await xeAPI.update(initialData.xe_key, payload);
        notificationService.success("Cập nhật xe thành công");
      } else {
        await xeAPI.create(payload);
        notificationService.success(
          "Xe đã được tạo dưới dạng Nháp và chờ gửi duyệt",
        );
        navigate("/xe/phe-duyet");
      }

      onSuccess?.();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lưu xe thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form form={form} layout="vertical" onFinish={onFinish} disabled={isView}>
        <Row gutter={16}>
          {/* Mã xe */}
          <Col xs={24} md={12}>
            <Form.Item
              name="xe_key"
              label="Mã xe"
              tooltip="Mã xe sẽ được tự động tạo bởi hệ thống"
            >
              <Input
                placeholder="Tự động tạo"
                disabled={true}
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>
          </Col>

          {/* Kho */}
          <Col xs={24} md={12}>
            <Form.Item
              name="ma_kho"
              label="Kho"
              rules={[{ required: true, message: "Vui lòng chọn kho" }]}
            >
              <Select placeholder="Chọn kho" disabled={isView}>
                {khoList.map((kho) => (
                  <Option key={kho.ma_kho} value={kho.ma_kho}>
                    {kho.ten_kho}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Loại xe */}
          <Col xs={24} md={12}>
            <Form.Item
              name="ma_loai"
              label="Loại xe"
              rules={[{ required: true, message: "Vui lòng chọn loại xe" }]}
            >
              <Select
                placeholder="Chọn loại xe"
                showSearch
                optionFilterProp="children"
              >
                {loaiXeList.map((loai) => (
                  <Option key={loai.ma_loai} value={loai.ma_loai}>
                    {loai.ten_loai}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Màu xe */}
          <Col xs={24} md={12}>
            <Form.Item
              name="ma_mau"
              label="Màu xe"
              rules={[{ required: true, message: "Vui lòng chọn màu xe" }]}
            >
              <Select placeholder="Chọn màu xe">
                {mauList.map((mau) => (
                  <Option key={mau.ma_mau} value={mau.ma_mau}>
                    <Tag color={mau.gia_tri}>{mau.ten_mau}</Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Số khung */}
          <Col xs={24} md={12}>
            <Form.Item
              name="so_khung"
              label="Số khung"
              rules={[
                { required: true, message: "Vui lòng nhập số khung" },
                { min: 10, message: "Số khung phải có ít nhất 10 ký tự" },
              ]}
            >
              <Input
                placeholder="Nhập số khung hoặc quét QR"
                style={{ textTransform: "uppercase" }}
                suffix={
                  !isView && (
                    <Tooltip title="Quét QR/Barcode số khung">
                      <QrcodeOutlined
                        style={{
                          fontSize: 18,
                          color: "#4096ff",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setQrTarget("so_khung");
                          setQrOpen(true);
                        }}
                      />
                    </Tooltip>
                  )
                }
              />
            </Form.Item>
          </Col>

          {/* Số máy */}
          <Col xs={24} md={12}>
            <Form.Item
              name="so_may"
              label="Số máy"
              rules={[
                { required: true, message: "Vui lòng nhập số máy" },
                { min: 6, message: "Số máy phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input
                placeholder="Nhập số máy hoặc quét QR"
                style={{ textTransform: "uppercase" }}
                suffix={
                  !isView && (
                    <Tooltip title="Quét QR/Barcode số máy">
                      <QrcodeOutlined
                        style={{
                          fontSize: 18,
                          color: "#4096ff",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setQrTarget("so_may");
                          setQrOpen(true);
                        }}
                      />
                    </Tooltip>
                  )
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Thông tin giá</Divider>

        <Row gutter={16}>
          {/* Giá nhập */}
          <Col xs={24} md={8}>
            <Form.Item
              name="gia_nhap"
              label="Giá nhập"
              rules={[
                { required: true, message: "Vui lòng nhập giá nhập" },
                { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0"
                min={0}
                formatter={(v) =>
                  v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(v) => v.replace(/,/g, "")}
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Col>

          {/* Giá bán */}
          <Col xs={24} md={8}>
            <Form.Item
              name="gia_ban"
              label="Giá bán"
              rules={[
                { type: "number", min: 0, message: "Giá phải lớn hơn 0" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0"
                min={0}
                formatter={(v) =>
                  v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
                }
                parser={(v) => v.replace(/,/g, "")}
                addonAfter="VNĐ"
              />
            </Form.Item>
          </Col>

          {/* VAT */}
          <Col xs={24} md={8}>
            <Form.Item
              name="vat"
              label="VAT (%)"
              rules={[{ required: true, message: "Vui lòng nhập VAT" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                placeholder="10"
                addonAfter="%"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Ngày nhập */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="ngay_nhap" label="Ngày nhập kho">
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày nhập"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Ghi chú */}
        <Form.Item name="ghi_chu" label="Ghi chú">
          <TextArea
            rows={3}
            placeholder="Nhập ghi chú (nếu có)"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* Display info for edit/view mode */}
        {(isEdit || isView) && initialData && (
          <>
            <Divider orientation="left">Thông tin trạng thái</Divider>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item label="Trạng thái">
                  <Tag
                    color={
                      initialData.trang_thai === "TON_KHO"
                        ? "green"
                        : initialData.trang_thai === "DA_BAN"
                          ? "red"
                          : "blue"
                    }
                  >
                    {formatService.formatXeTrangThai(initialData.trang_thai)}
                  </Tag>
                </Form.Item>
              </Col>

              <Col xs={24} md={8}>
                <Form.Item label="Khóa">
                  {initialData.locked ? (
                    <Tag color="red">Đang khóa</Tag>
                  ) : (
                    <Tag color="green">Không khóa</Tag>
                  )}
                </Form.Item>
              </Col>

              {initialData.ngay_tao && (
                <Col xs={24} md={8}>
                  <Form.Item label="Ngày tạo">
                    <span>
                      {formatService.formatDateTime(initialData.ngay_tao)}
                    </span>
                  </Form.Item>
                </Col>
              )}
            </Row>

            {initialData.locked && (
              <div
                style={{
                  padding: "12px",
                  background: "rgba(250,173,20,0.1)",
                  border: "1px solid #ffbb96",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                <strong>⚠️ Xe đang bị khóa</strong>
                <p style={{ margin: "4px 0 0 0", color: "#8c8c8c" }}>
                  Xe bị khóa không thể chỉnh sửa. Vui lòng mở khóa trước khi
                  thao tác.
                </p>
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onCancel} block={isMobile}>
              {isView ? "Đóng" : "Hủy"}
            </Button>

            {!isView && (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={isEdit && initialData?.locked}
                block={isMobile}
              >
                {isCreate ? "Thêm xe" : "Cập nhật"}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      {/* QR Scanner Modal */}
      <QrScannerModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onScan={(value) => {
          if (qrTarget) {
            form.setFieldValue(qrTarget, value.toUpperCase());
          }
          setQrOpen(false);
        }}
        title={qrTarget === "so_khung" ? "Quét Số Khung" : "Quét Số Máy"}
        hint={
          qrTarget === "so_khung"
            ? "Đặt camera vào mã số khung của xe"
            : "Đặt camera vào mã số máy của xe"
        }
      />
    </>
  );
};

export default XeForm;
