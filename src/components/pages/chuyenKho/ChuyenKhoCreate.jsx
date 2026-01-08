// src/components/pages/chuyenKho/ChuyenKhoCreate.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Steps,
  Space,
  Row,
  Col,
  Table,
  Divider,
  Modal,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { chuyenKhoAPI, khoAPI, xeAPI, tonKhoAPI } from "../../../api";
import { notificationService, authService } from "../../../services";
import moment from "moment";

const { Option } = Select;
const { Step } = Steps;

const ChuyenKhoCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [khoList, setKhoList] = useState([]);

  // Data cho Step 2 (Chọn hàng)
  const [selectedXe, setSelectedXe] = useState([]);
  const [selectedPhuTung, setSelectedPhuTung] = useState([]);

  // Nguồn dữ liệu
  const [availableXe, setAvailableXe] = useState([]);
  const [availablePhuTung, setAvailablePhuTung] = useState([]);

  // Form Info
  const [transferInfo, setTransferInfo] = useState({});

  useEffect(() => {
    fetchKhoList();
  }, []);

  const fetchKhoList = async () => {
    try {
      const res = await khoAPI.getAll();
      setKhoList(res || []);
    } catch (error) {
      console.error("Lỗi tải danh sách kho");
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        const values = await form.validateFields();
        setTransferInfo(values);
        // Load hàng hóa từ kho xuất
        await loadAvailableItems(values.ma_kho_xuat);
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Validation failed
      }
    } else if (currentStep === 1) {
      if (selectedXe.length === 0 && selectedPhuTung.length === 0) {
        notificationService.error("Vui lòng chọn ít nhất 1 xe hoặc phụ tùng");
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const loadAvailableItems = async (ma_kho) => {
    setLoading(true);
    try {
      // 1. Load Xe tồn kho
      const xeRes = await xeAPI.getTonKho(ma_kho, { trang_thai: "TON_KHO" });
      setAvailableXe(xeRes.data || []);

      // 2. Load Phụ tùng tồn kho
      const ptRes = await tonKhoAPI.getAll({ ma_kho });
      setAvailablePhuTung(ptRes.data || []);
    } catch (error) {
      notificationService.error("Không thể tải danh sách hàng hóa từ kho xuất");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      // 1. Tạo phiếu
      const payload = {
        ma_phieu: `CK-${moment().format("YYYYMMDDHHmmss")}`,
        ngay_chuyen_kho: transferInfo.ngay_chuyen_kho.toISOString(),
        ma_kho_xuat: transferInfo.ma_kho_xuat,
        ma_kho_nhap: transferInfo.ma_kho_nhap,
        dien_giai: transferInfo.dien_giai || null,
      };

      const res = await chuyenKhoAPI.create(payload);
      const ma_phieu = res.data?.so_phieu || payload.so_phieu;

      // 2. Thêm xe (song song)
      const xePromises = selectedXe.map((xe) =>
        chuyenKhoAPI.addXe(ma_phieu, {
          xe_key: xe.xe_key,
          ma_kho_hien_tai: transferInfo.ma_kho_xuat,
        })
      );

      // 3. Thêm phụ tùng (song song)
      const ptPromises = selectedPhuTung.map((pt) =>
        chuyenKhoAPI.addPhuTung(ma_phieu, {
          ma_pt: pt.ma_pt,
          ten_pt: pt.ten_pt,
          don_vi_tinh: pt.don_vi_tinh,
          so_luong: pt.so_luong_chuyen,
          don_gia: pt.gia_nhap || 0,
        })
      );

      await Promise.all([...xePromises, ...ptPromises]);

      notificationService.success("Tạo phiếu chuyển kho thành công");
      navigate("/chuyen-kho");
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo phiếu chuyển kho"
      );
    } finally {
      setLoading(false);
    }
  };

  const Step1Info = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ngay_chuyen_kho: moment(),
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="ma_kho_xuat"
            label="Kho xuất"
            rules={[{ required: true, message: "Chọn kho xuất" }]}
          >
            <Select placeholder="Chọn kho xuất">
              {khoList.map((k) => (
                <Option key={k.ma_kho} value={k.ma_kho}>
                  {k.ten_kho}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="ma_kho_nhap"
            label="Kho nhập"
            dependencies={["ma_kho_xuat"]}
            rules={[
              { required: true, message: "Chọn kho nhập" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("ma_kho_xuat") !== value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Kho nhập không được trùng kho xuất")
                  );
                },
              }),
            ]}
          >
            <Select placeholder="Chọn kho nhập">
              {khoList.map((k) => (
                <Option key={k.ma_kho} value={k.ma_kho}>
                  {k.ten_kho}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="ngay_chuyen_kho"
            label="Ngày chuyển"
            rules={[{ required: true, message: "Chọn ngày chuyển" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dien_giai" label="Ghi chú">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // Modal states
  const [showXeModal, setShowXeModal] = useState(false);
  const [showPhuTungModal, setShowPhuTungModal] = useState(false);
  const [tempSelectedXeKeys, setTempSelectedXeKeys] = useState([]);
  const [tempSelectedPhuTungKeys, setTempSelectedPhuTungKeys] = useState([]);

  // Reset temp keys when opening modals
  useEffect(() => {
    if (showXeModal) {
      setTempSelectedXeKeys(selectedXe.map((x) => x.xe_key));
    }
  }, [showXeModal]);

  useEffect(() => {
    if (showPhuTungModal) {
      setTempSelectedPhuTungKeys(selectedPhuTung.map((pt) => pt.ma_pt));
    }
  }, [showPhuTungModal]);

  const handleConfirmAddXe = () => {
    const selected = availableXe.filter((x) =>
      tempSelectedXeKeys.includes(x.xe_key)
    );
    setSelectedXe(selected);
    setShowXeModal(false);
  };

  const handleConfirmAddPhuTung = () => {
    const newItems = availablePhuTung
      .filter((pt) => tempSelectedPhuTungKeys.includes(pt.ma_pt))
      .map((pt) => {
        const existing = selectedPhuTung.find((s) => s.ma_pt === pt.ma_pt);
        return existing ? existing : { ...pt, so_luong_chuyen: 1 };
      });
    setSelectedPhuTung(newItems);
    setShowPhuTungModal(false);
  };

  const Step2Items = () => (
    <div>
      {/* SECTION XE */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3>Danh sách Xe chuyển ({selectedXe.length})</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowXeModal(true)}
          >
            Thêm Xe
          </Button>
        </div>

        <Table
          dataSource={selectedXe}
          rowKey="xe_key"
          pagination={false}
          locale={{ emptyText: "Chưa chọn xe nào" }}
          columns={[
            { title: "#", render: (_, __, i) => i + 1, width: 50 },
            { title: "Mã loại xe", dataIndex: "ma_loai_xe" },
            { title: "Tên xe", dataIndex: "ten_loai_xe" },
            { title: "Số khung", dataIndex: "so_khung" },
            { title: "Số máy", dataIndex: "so_may" },
            { title: "Màu sắc", dataIndex: "mau_sac" },
            {
              title: "",
              key: "action",
              width: 50,
              render: (_, record) => (
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setSelectedXe(
                      selectedXe.filter((x) => x.xe_key !== record.xe_key)
                    );
                  }}
                />
              ),
            },
          ]}
        />
      </div>

      <Divider />

      {/* SECTION PHU TUNG */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3>Danh sách Phụ tùng chuyển ({selectedPhuTung.length})</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowPhuTungModal(true)}
          >
            Thêm Phụ Tùng
          </Button>
        </div>

        <Table
          dataSource={selectedPhuTung}
          rowKey="ma_pt"
          pagination={false}
          locale={{ emptyText: "Chưa chọn phụ tùng nào" }}
          columns={[
            { title: "#", render: (_, __, i) => i + 1, width: 50 },
            { title: "Mã PT", dataIndex: "ma_pt" },
            { title: "Tên phụ tùng", dataIndex: "ten_pt" },
            { title: "ĐVT", dataIndex: "don_vi_tinh" },
            {
              title: "Tồn kho",
              dataIndex: "so_luong_kha_dung",
              align: "center",
            },
            {
              title: "Số lượng chuyển",
              key: "sl",
              width: 150,
              render: (_, record) => (
                <Input
                  type="number"
                  min={1}
                  max={record.so_luong_kha_dung}
                  value={record.so_luong_chuyen}
                  onChange={(e) => {
                    let val = parseInt(e.target.value) || 0;
                    if (val < 1) val = 1;
                    if (val > record.so_luong_kha_dung)
                      val = record.so_luong_kha_dung;

                    const newData = selectedPhuTung.map((item) =>
                      item.ma_pt === record.ma_pt
                        ? { ...item, so_luong_chuyen: val }
                        : item
                    );
                    setSelectedPhuTung(newData);
                  }}
                />
              ),
            },
            {
              title: "",
              key: "action",
              width: 50,
              render: (_, record) => (
                <Button
                  danger
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setSelectedPhuTung(
                      selectedPhuTung.filter((pt) => pt.ma_pt !== record.ma_pt)
                    );
                  }}
                />
              ),
            },
          ]}
        />
      </div>

      {/* MODAL CHON XE */}
      <Modal
        title={`Chọn xe từ kho: ${
          khoList.find((k) => k.ma_kho === transferInfo.ma_kho_xuat)?.ten_kho ||
          ""
        }`}
        open={showXeModal}
        onOk={handleConfirmAddXe}
        onCancel={() => setShowXeModal(false)}
        width={800}
        okText="Chọn"
        cancelText="Hủy"
      >
        <Table
          dataSource={availableXe}
          rowKey="xe_key"
          columns={[
            { title: "Mã loại", dataIndex: "ma_loai_xe" },
            { title: "Tên xe", dataIndex: "ten_loai_xe" },
            { title: "Số khung", dataIndex: "so_khung" },
            { title: "Số máy", dataIndex: "so_may" },
            { title: "Màu", dataIndex: "mau_sac" },
          ]}
          rowSelection={{
            selectedRowKeys: tempSelectedXeKeys,
            onChange: (keys) => setTempSelectedXeKeys(keys),
          }}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* MODAL CHON PHU TUNG */}
      <Modal
        title={`Chọn phụ tùng từ kho: ${
          khoList.find((k) => k.ma_kho === transferInfo.ma_kho_xuat)?.ten_kho ||
          ""
        }`}
        open={showPhuTungModal}
        onOk={handleConfirmAddPhuTung}
        onCancel={() => setShowPhuTungModal(false)}
        width={800}
        okText="Chọn"
        cancelText="Hủy"
      >
        <Table
          dataSource={availablePhuTung}
          rowKey="ma_pt"
          columns={[
            { title: "Mã PT", dataIndex: "ma_pt" },
            { title: "Tên phụ tùng", dataIndex: "ten_pt" },
            { title: "ĐVT", dataIndex: "don_vi_tinh" },
            { title: "Tồn kho", dataIndex: "so_luong_kha_dung" },
            {
              title: "Giá nhập",
              dataIndex: "gia_nhap",
              render: (val) => val?.toLocaleString("vi-VN") + " đ",
            },
          ]}
          rowSelection={{
            selectedRowKeys: tempSelectedPhuTungKeys,
            onChange: (keys) => setTempSelectedPhuTungKeys(keys),
          }}
          pagination={{ pageSize: 5 }}
        />
      </Modal>
    </div>
  );

  const Step3Confirm = () => (
    <div>
      <Card title="Thông tin phiếu">
        <p>
          <strong>Ngày chuyển:</strong>{" "}
          {transferInfo.ngay_chuyen_kho?.format("DD/MM/YYYY")}
        </p>
        <p>
          <strong>Kho xuất:</strong>{" "}
          {khoList.find((k) => k.ma_kho === transferInfo.ma_kho_xuat)?.ten_kho}
        </p>
        <p>
          <strong>Kho nhập:</strong>{" "}
          {khoList.find((k) => k.ma_kho === transferInfo.ma_kho_nhap)?.ten_kho}
        </p>
        <p>
          <strong>Ghi chú:</strong> {transferInfo.dien_giai || "(Không có)"}
        </p>
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title={`Xe (${selectedXe.length})`}>
            <ul>
              {selectedXe.map((xe) => (
                <li key={xe.xe_key}>
                  {xe.ten_loai_xe} - {xe.so_khung}
                </li>
              ))}
            </ul>
          </Card>
        </Col>
        <Col span={12}>
          <Card title={`Phụ tùng (${selectedPhuTung.length})`}>
            <ul>
              {selectedPhuTung.map((pt) => (
                <li key={pt.ma_pt}>
                  {pt.ten_pt} (x{pt.so_luong_chuyen})
                </li>
              ))}
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div style={{ padding: 24, background: "#f0f2f5", minHeight: "100vh" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/chuyen-kho")}
            />
            <span>Tạo phiếu chuyển kho</span>
          </Space>
        }
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="Thông tin chung" />
          <Step title="Chọn hàng hóa" />
          <Step title="Xác nhận" />
        </Steps>

        <div style={{ minHeight: 300 }}>
          {currentStep === 0 && <Step1Info />}
          {currentStep === 1 && <Step2Items />}
          {currentStep === 2 && <Step3Confirm />}
        </div>

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Quay lại
              </Button>
            )}
            {currentStep < 2 && (
              <Button type="primary" onClick={handleNext}>
                Tiếp tục
              </Button>
            )}
            {currentStep === 2 && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={handleCreate}
              >
                Tạo phiếu
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ChuyenKhoCreate;
