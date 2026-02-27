// src/components/pages/maintenance/MaintenanceFormPage.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  InputNumber,
  Row,
  Col,
  Space,
  Input,
  Tooltip,
  Divider,
  Badge,
  Alert,
  Typography,
  Tag,
  AutoComplete,
  Modal,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  CarOutlined,
  UserOutlined,
  InfoCircleOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  phuTungAPI,
  userAPI,
  productsAPI,
  khachHangAPI,
  maintenanceAPI,
  khoAPI,
  xeAPI,
} from "../../../api";
import { useDebouncedCallback } from "../../../hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { notificationService, formatService } from "../../../services";
import {
  LOAI_BAO_TRI,
  LOAI_BAO_TRI_LABELS,
  LOAI_DOI_TAC,
} from "../../../utils/constant";

const { Option } = Select;

const MaintenanceFormPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchingXe, setSearchingXe] = useState(false);
  const [xeList, setXeList] = useState([]);
  const [phuTungList, setPhuTungList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [productList, setProductList] = useState([]); // For external vehicle product selection
  const [partnerList, setPartnerList] = useState([]); // For external vehicle partner selection
  const [liftList, setLiftList] = useState([]); // List of lifts
  const [khoList, setKhoList] = useState([]); // List of warehouses
  const [stockMap, setStockMap] = useState({}); // { ma_pt: so_luong_kha_dung }

  const [isExternal, setIsExternal] = useState(false);
  const [warrantyInfo, setWarrantyInfo] = useState(null);

  // States for Quick Add Customer
  const [isAddCustomerModalVisible, setIsAddCustomerModalVisible] =
    useState(false);
  const [customerForm] = Form.useForm();
  const [addingCustomer, setAddingCustomer] = useState(false);

  // Common services templates for quick selection
  const COMMON_SERVICES = [
    { value: "Rửa xe bọt tuyết", price: 30000 },
    { value: "Rửa xe siêu cấp", price: 50000 },
    { value: "Thay nhớt máy", price: 120000 },
    { value: "Thay nhớt láp", price: 50000 },
    { value: "Bảo dưỡng định kỳ", price: 150000 },
    { value: "Vá lốp không sâm", price: 30000 },
    { value: "Bơm lốp", price: 10000 },
    { value: "Vệ sinh kim phun buồng đốt", price: 200000 },
  ];

  const [items, setItems] = useState([]);
  const location = useLocation();

  useEffect(() => {
    loadMasterData();
    if (location.state?.ma_ban_nang) {
      form.setFieldsValue({ ma_ban_nang: location.state.ma_ban_nang });
    }
    if (form.getFieldValue("ma_kho")) {
      fetchStock(form.getFieldValue("ma_kho"));
    }
  }, []);

  const watchedMaKho = Form.useWatch("ma_kho", form);
  useEffect(() => {
    if (watchedMaKho) {
      fetchStock(watchedMaKho);
    } else {
      setStockMap({});
    }
  }, [watchedMaKho]);

  const fetchStock = async (ma_kho) => {
    try {
      const res = await phuTungAPI.getTonKho(ma_kho);
      const list = res.data || res || [];
      const map = {};
      list.forEach((item) => {
        map[item.ma_pt] = item.so_luong_kha_dung;
      });
      setStockMap(map);
    } catch (error) {
      console.error("Error fetching stock map", error);
    }
  };

  const loadMasterData = async () => {
    try {
      const settle = await Promise.allSettled([
        phuTungAPI.getAll({ limit: 100 }),
        userAPI.getAll(),
        productsAPI.getAll({ type: "XE", limit: 50 }),
        khachHangAPI.getAll({ limit: 100 }),
        maintenanceAPI.getWorkshopBoard(),
        khoAPI.getAll(),
        xeAPI.getAll({ limit: 20 }),
      ]);

      const [ptRes, userRes, prodRes, partnerRes, liftRes, khoRes, xeRes] =
        settle.map((s) => (s.status === "fulfilled" ? s.value : null));

      // 1. Phụ tùng
      const ptList = ptRes?.data || ptRes || [];
      setPhuTungList(Array.isArray(ptList) ? ptList : []);

      // 2. Kỹ thuật viên (User)
      const allUsers = userRes?.data || userRes || [];
      const technicians = Array.isArray(allUsers)
        ? allUsers.filter(
            (u) =>
              u.status &&
              (u.vai_tro === "BAN_HANG" || u.vai_tro === "NHAN_VIEN"),
          )
        : [];
      setUserList(technicians);

      // 3. Loại xe
      const pList = prodRes?.data || prodRes || [];
      setProductList(Array.isArray(pList) ? pList : []);

      // 4. Khách hàng
      const kList = partnerRes?.data || partnerRes || [];
      setPartnerList(Array.isArray(kList) ? kList : []);

      // 5. Bàn nâng
      setLiftList(liftRes?.data || liftRes || []);

      // 6. Kho
      setKhoList(khoRes?.data || khoRes || []);

      // 7. Xe (Initial list)
      setXeList(xeRes?.data?.data || xeRes?.data || xeRes || []);

      console.log("Master Data loaded:", {
        ptCount: ptList.length,
        userCount: technicians.length,
        prodCount: pList.length,
        partnerCount: kList.length,
        liftCount: (liftRes?.data || liftRes || []).length,
        xeCount: (xeRes?.data?.data || xeRes?.data || xeRes || []).length,
      });
    } catch (error) {
      console.error("Error in loadMasterData", error);
    }
  };

  const handleAddCustomer = async (values) => {
    setAddingCustomer(true);
    try {
      const payload = {
        ...values,
        loai_doi_tac: LOAI_DOI_TAC.KHACH_HANG,
      };
      const res = await khachHangAPI.create(payload);

      const newCustomer = res.data?.data || res.data;
      notificationService.success("Thêm mới khách hàng thành công");

      // Update the local list
      setPartnerList((prev) => [...prev, newCustomer]);

      // Auto-select the newly created customer
      form.setFieldsValue({
        ma_doi_tac: newCustomer.ma_doi_tac || newCustomer.ma_kh,
      });

      setIsAddCustomerModalVisible(false);
      customerForm.resetFields();
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo khách hàng",
      );
    } finally {
      setAddingCustomer(false);
    }
  };

  const debouncedSearchXe = useDebouncedCallback(async (value) => {
    setSearchingXe(true);
    try {
      const res = await xeAPI.getAll({ search: value || "", limit: 20 });
      setXeList(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error searching vehicle", error);
    } finally {
      setSearchingXe(false);
    }
  }, 500);

  const handleSearchXe = (value) => {
    debouncedSearchXe(value);
  };

  const onSelectXe = async (value) => {
    // If user picks from list, it's a known vehicle
    const xe = xeList.find((x) => x.xe_key === value);
    if (xe) {
      setIsExternal(false);
      // Try fetching detail for warranty info
      try {
        const detail = await xeAPI.getDetail(value);
        const fullXe = detail.data || detail;

        // Cập nhật thông tin từ chi tiết xe
        const monthsSinceSale = fullXe.ngay_ban
          ? dayjs().diff(dayjs(fullXe.ngay_ban), "month")
          : 100;
        const currentKm = fullXe.so_km_hien_tai || 0;
        const isEligibleFree = monthsSinceSale < 6 && currentKm < 10000;

        setWarrantyInfo({
          ...fullXe.warranty,
          is_eligible: isEligibleFree,
          monthsSinceSale,
          currentKm,
        });

        form.setFieldsValue({
          ma_doi_tac: fullXe.ma_doi_tac,
          so_km_hien_tai: fullXe.so_km_hien_tai || 0,
          loai_bao_tri: isEligibleFree
            ? LOAI_BAO_TRI.MIEN_PHI
            : LOAI_BAO_TRI.TINH_PHI,
        });

        if (isEligibleFree) {
          notificationService.info(
            `Xe ưu đãi: Mới mua ${monthsSinceSale} tháng & ${currentKm} km. Gợi ý bảo trì MIỄN PHÍ.`,
          );
        }
      } catch (err) {
        form.setFieldsValue({
          ma_doi_tac: xe.ma_doi_tac,
          so_km_hien_tai: xe.so_km_hien_tai || 0,
        });
      }
    }
  };

  const detectExternalVehicle = () => {
    setIsExternal(true);
    setWarrantyInfo(null);
    form.setFieldsValue({
      ma_doi_tac: null,
      loai_bao_tri: LOAI_BAO_TRI.TINH_PHI,
    });
    notificationService.info("Đã chuyển sang chế độ khai báo Xe Ngoài");
  };

  const handleAddItem = () => {
    const newItem = {
      key: Date.now(),
      loai_hang_muc: "PHU_TUNG",
      ma_hang_hoa: null,
      ten_hang_muc: "",
      so_luong: 1,
      don_gia: 0,
      thanh_tien: 0,
      ghi_chu: "",
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (key) => {
    setItems(items.filter((item) => item.key !== key));
  };

  const handleRowChange = (key, field, value) => {
    const newItems = items.map((item) => {
      if (item.key === key) {
        let updatedItem = { ...item, [field]: value };

        // Nếu chọn phụ tùng từ danh mục
        if (
          field === "ma_hang_hoa" &&
          updatedItem.loai_hang_muc === "PHU_TUNG"
        ) {
          const pt = phuTungList.find((p) => p.ma_pt === value);
          if (pt) {
            updatedItem.ten_hang_muc = pt.ten_pt;
            updatedItem.don_gia = pt.gia_ban || 0;
          }
        }

        if (field === "loai_hang_muc" && value === "DICH_VU") {
          updatedItem.ma_hang_hoa = null;
          // If maintenance type is MIEN_PHI, labor fee is 0
          if (form.getFieldValue("loai_bao_tri") === LOAI_BAO_TRI.MIEN_PHI) {
            updatedItem.don_gia = 0;
          }
        }

        // Tính thành tiền
        if (
          field === "so_luong" ||
          field === "don_gia" ||
          field === "ma_hang_hoa" ||
          field === "loai_hang_muc"
        ) {
          updatedItem.thanh_tien =
            (updatedItem.so_luong || 0) * (updatedItem.don_gia || 0);

          // Kiểm tra tồn kho ngay lập tức
          if (
            updatedItem.loai_hang_muc === "PHU_TUNG" &&
            updatedItem.ma_hang_hoa
          ) {
            const available = stockMap[updatedItem.ma_hang_hoa] || 0;
            if (updatedItem.so_luong > available) {
              notificationService.warning(
                `Kho hiện tại chỉ còn ${available} ${updatedItem.ten_hang_muc}. Vui lòng kiểm tra lại.`,
              );
            }
          }
        }

        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const handleMaintenanceTypeChange = (type) => {
    if (type === LOAI_BAO_TRI.MIEN_PHI) {
      // Set all DICH_VU prices to 0
      const newItems = items.map((item) => {
        if (item.loai_hang_muc === "DICH_VU") {
          return { ...item, don_gia: 0, thanh_tien: 0 };
        }
        return item;
      });
      setItems(newItems);
    }
  };

  const onFinish = async (values) => {
    if (items.length === 0) {
      notificationService.error("Vui lòng thêm ít nhất 1 hạng mục dịch vụ");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ma_phieu: values.ma_phieu,
        ma_serial: values.ma_serial,
        ma_doi_tac: values.ma_doi_tac,
        so_km_hien_tai: values.so_km_hien_tai,
        ghi_chu: values.ghi_chu,
        loai_bao_tri: values.loai_bao_tri,
        ma_hang_hoa: isExternal ? values.ma_hang_hoa_xe : null, // ID loại xe từ products
        so_khung: isExternal ? values.so_khung_thuc_te : null,
        tong_tien: items.reduce((sum, item) => sum + (item.thanh_tien || 0), 0),
        chi_tiet: items.map((item) => ({
          ma_hang_hoa: item.ma_hang_hoa,
          ten_hang_muc: item.ten_hang_muc,
          loai_hang_muc: item.loai_hang_muc,
          so_luong: item.so_luong,
          don_gia: item.don_gia,
          thanh_tien: item.thanh_tien,
          ghi_chu: item.ghi_chu,
        })),
        ktv_chinh: values.ktv_chinh,
        ma_ban_nang: values.ma_ban_nang,
        ma_kho: values.ma_kho,
        tien_phu_tung: items.reduce(
          (sum, i) => sum + (i.loai_hang_muc === "PHU_TUNG" ? i.thanh_tien : 0),
          0,
        ),
        tien_cong: items.reduce(
          (sum, i) => sum + (i.loai_hang_muc === "DICH_VU" ? i.thanh_tien : 0),
          0,
        ),
      };

      const res = await maintenanceAPI.createMaintenance(payload);
      const createdData = res.data || res;

      notificationService.success(
        res.message || "Tạo phiếu dịch vụ thành công",
      );

      // Chuyển hướng đến trang chi tiết của phiếu vừa tạo
      if (createdData?.ma_phieu) {
        navigate(`/maintenance/${createdData.ma_phieu}`);
      } else {
        navigate("/maintenance");
      }
    } catch (error) {
      notificationService.error(
        error?.response?.data?.message || "Lỗi tạo phiếu dịch vụ",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "loai_hang_muc",
      width: 120,
      render: (val, record) => (
        <Select
          value={val}
          onChange={(v) => handleRowChange(record.key, "loai_hang_muc", v)}
          style={{ width: "100%" }}
        >
          <Option value="PHU_TUNG">Phụ tùng</Option>
          <Option value="DICH_VU">Dịch vụ</Option>
        </Select>
      ),
    },
    {
      title: "Hạng mục",
      dataIndex: "ten_hang_muc",
      render: (val, record) => {
        if (record.loai_hang_muc === "PHU_TUNG") {
          return (
            <Select
              showSearch
              placeholder="Chọn phụ tùng"
              value={record.ma_hang_hoa}
              onChange={(v) => handleRowChange(record.key, "ma_hang_hoa", v)}
              style={{ width: "100%" }}
              optionFilterProp="children"
            >
              {phuTungList.map((p) => {
                const available = stockMap[p.ma_pt] || 0;
                return (
                  <Option
                    key={p.ma_pt}
                    value={p.ma_pt}
                    disabled={available <= 0}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        {p.ma_pt} - {p.ten_pt}
                      </span>
                      <Tag color={available > 0 ? "blue" : "red"}>
                        Tồn: {available}
                      </Tag>
                    </div>
                  </Option>
                );
              })}
            </Select>
          );
        }
        return (
          <AutoComplete
            options={COMMON_SERVICES}
            value={val}
            onChange={(v) => handleRowChange(record.key, "ten_hang_muc", v)}
            onSelect={(v, option) => {
              // When a common service is selected, auto-fill the suggested price
              // (if not free maintenance)
              handleRowChange(record.key, "ten_hang_muc", v);
              if (
                form.getFieldValue("loai_bao_tri") !== LOAI_BAO_TRI.MIEN_PHI &&
                option.price
              ) {
                handleRowChange(record.key, "don_gia", option.price);
              }
            }}
            placeholder="Gõ hoặc chọn nhanh dịch vụ..."
            style={{ width: "100%" }}
            filterOption={(inputValue, option) =>
              option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              -1
            }
          />
        );
      },
    },
    {
      title: "Số lượng",
      dataIndex: "so_luong",
      width: 100,
      render: (val, record) => (
        <InputNumber
          min={1}
          value={val}
          onChange={(v) => handleRowChange(record.key, "so_luong", v)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "don_gia",
      width: 150,
      render: (val, record) => (
        <InputNumber
          min={0}
          value={val}
          onChange={(v) => handleRowChange(record.key, "don_gia", v)}
          style={{ width: "100%" }}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          disabled={
            record.loai_hang_muc === "DICH_VU" &&
            form.getFieldValue("loai_bao_tri") === LOAI_BAO_TRI.MIEN_PHI
          }
        />
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "thanh_tien",
      width: 150,
      align: "right",
      render: (val) => <strong>{formatService.formatCurrency(val)}</strong>,
    },
    {
      title: "Ghi chú",
      dataIndex: "ghi_chu",
      render: (val, record) => (
        <Input
          placeholder="Ghi chú"
          value={val}
          onChange={(e) =>
            handleRowChange(record.key, "ghi_chu", e.target.value)
          }
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
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  const totalAmount = items.reduce(
    (sum, item) => sum + (item.thanh_tien || 0),
    0,
  );

  return (
    <div style={{ padding: "16px 8px" }}>
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/maintenance")}
              type="text"
            />
            <span>
              <ToolOutlined /> Lập Phiếu Dịch Vụ / Sửa Chữa Mới
            </span>
          </Space>
        }
        size="small"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ loai_bao_tri: LOAI_BAO_TRI.TINH_PHI }}
        >
          <Row gutter={24}>
            {/* Cột trái: Thông tin chung */}
            <Col xs={24} lg={16}>
              <Card
                type="inner"
                title="Thông tin xe & Khách hàng"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={16}>
                  <Col span={18}>
                    <Form.Item
                      name="ma_serial"
                      label={
                        isExternal
                          ? "Biển số / Số khung ngoài"
                          : "Số khung/Số máy (Trong hệ thống)"
                      }
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng cung cấp định danh xe",
                        },
                      ]}
                      extra={
                        isExternal ? (
                          <Tag color="warning">
                            Xe ngoài hệ thống (Sẽ tự động đăng ký)
                          </Tag>
                        ) : warrantyInfo?.is_eligible ? (
                          <Tag color="success">
                            Ưu đãi: {warrantyInfo.monthsSinceSale} tháng /{" "}
                            {warrantyInfo.currentKm} km
                          </Tag>
                        ) : null
                      }
                    >
                      {isExternal ? (
                        <Input placeholder="Nhập biển số hoặc số khung xe ngoài..." />
                      ) : (
                        <Select
                          showSearch
                          placeholder="Quét mã hoặc nhập số khung..."
                          onSearch={handleSearchXe}
                          onChange={onSelectXe}
                          loading={searchingXe}
                          filterOption={false}
                          optionLabelProp="label"
                        >
                          {xeList.map((x) => (
                            <Option
                              key={x.xe_key}
                              value={x.xe_key}
                              label={`${x.so_khung || x.so_may} - ${x.ten_loai}`}
                            >
                              <Space size="small">
                                <CarOutlined style={{ color: "#1890ff" }} />
                                <span style={{ fontWeight: 500 }}>
                                  {x.so_khung || x.so_may}
                                </span>
                                <span style={{ color: "#8c8c8c" }}>
                                  | {x.ten_loai} ({x.ten_mau})
                                </span>
                                {x.ho_ten && <Tag color="blue">{x.ho_ten}</Tag>}
                              </Space>
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6} style={{ paddingTop: 30 }}>
                    <Button
                      block
                      icon={<PlusOutlined />}
                      onClick={() => {
                        if (isExternal) {
                          setIsExternal(false);
                          form.setFieldsValue({ ma_serial: null });
                        } else {
                          detectExternalVehicle();
                        }
                      }}
                      danger={isExternal}
                    >
                      {isExternal ? "Hủy xe ngoài" : "Xe ngoài"}
                    </Button>
                  </Col>
                </Row>

                {isExternal && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="ma_hang_hoa_xe"
                        label="Loại xe"
                        rules={[
                          { required: isExternal, message: "Chọn loại xe" },
                        ]}
                      >
                        <AutoComplete
                          options={productList.map((p) => ({
                            value: p.ten_hang_hoa, // Use name since users don't know the code, backend will handle it based on name/code
                            key: p.ma_hang_hoa,
                          }))}
                          placeholder="Tìm hoặc gõ model xe mới..."
                          filterOption={(inputValue, option) =>
                            (option?.value ?? "")
                              .toLowerCase()
                              .includes(inputValue.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="so_khung_thuc_te"
                        label="Số khung xác thực"
                        rules={[
                          { required: isExternal, message: "Nhập số khung" },
                        ]}
                      >
                        <Input placeholder="Xác nhận lại số khung" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ma_doi_tac"
                      label="Chủ xe / Khách hàng"
                      rules={[{ required: true, message: "Chọn khách hàng" }]}
                    >
                      <Select
                        showSearch
                        placeholder="Tìm chọn khách hàng..."
                        filterOption={(input, option) =>
                          (option?.children ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Divider style={{ margin: "8px 0" }} />
                            <Space
                              align="center"
                              style={{ padding: "0 8px 4px" }}
                            >
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsAddCustomerModalVisible(true);
                                }}
                              >
                                Thêm mới khách hàng
                              </Button>
                            </Space>
                          </>
                        )}
                      >
                        {partnerList.map((p) => (
                          <Option
                            key={p.ma_doi_tac || p.ma_kh}
                            value={p.ma_doi_tac || p.ma_kh}
                          >
                            {p.ho_ten} - {p.dien_thoai}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="ktv_chinh" label="Kỹ thuật viên thực hiện">
                      <Select placeholder="Chọn người làm">
                        {userList.map((u) => {
                          const busyLift = liftList.find(
                            (l) => l.ktv_id === u.id,
                          );
                          return (
                            <Option
                              key={u.id}
                              value={u.id}
                              disabled={!!busyLift}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <span>{u.ho_ten}</span>
                                {busyLift && (
                                  <Tag color="error">
                                    Bận: {busyLift.ten_ban_nang}
                                  </Tag>
                                )}
                              </div>
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="ma_ban_nang" label="Bàn nâng điều phối">
                      <Select placeholder="Chọn bàn nâng (nếu có)">
                        {liftList.map((l) => (
                          <Option key={l.ma_ban_nang} value={l.ma_ban_nang}>
                            {l.ten_ban_nang} (
                            {l.trang_thai === "TRONG" ? "Sẵn sàng" : "Đang bận"}
                            )
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="ma_kho"
                      label="Kho xuất phụ tùng"
                      rules={[{ required: true, message: "Chọn kho xuất" }]}
                    >
                      <Select placeholder="Chọn kho xuất mặc định">
                        {khoList.map((k) => (
                          <Option key={k.ma_kho} value={k.ma_kho}>
                            {k.ten_kho}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="ghi_chu" label="Ghi chú">
                  <Input.TextArea
                    rows={2}
                    placeholder="Tình trạng xe khi tiếp nhận..."
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Cột phải: Tóm tắt và Loại hình */}
            <Col xs={24} lg={8}>
              <Card
                type="inner"
                title="Chi phí & Phân loại"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Form.Item
                  name="loai_bao_tri"
                  label="Phân loại dịch vụ"
                  rules={[{ required: true }]}
                >
                  <Select onChange={handleMaintenanceTypeChange} size="large">
                    {Object.keys(LOAI_BAO_TRI).map((key) => {
                      const color =
                        key === "MIEN_PHI"
                          ? "green"
                          : key === "BAO_HANH"
                            ? "orange"
                            : "blue";
                      return (
                        <Option key={key} value={LOAI_BAO_TRI[key]}>
                          <Tag color={color}>{LOAI_BAO_TRI_LABELS[key]}</Tag>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="so_km_hien_tai"
                  label="Số KM hiện tại"
                  rules={[
                    { required: true, message: "Nhập số KM" },
                    {
                      validator: (_, value) => {
                        const prevKm = warrantyInfo?.currentKm || 0;
                        if (value && value < prevKm) {
                          return Promise.reject(
                            `Số KM phải >= số KM cũ (${prevKm})`,
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    size="large"
                    addonAfter="km"
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(v) => v.replace(/,/g, "")}
                  />
                </Form.Item>

                <Divider style={{ margin: "12px 0" }} />

                <div
                  style={{
                    padding: "12px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Typography.Text type="secondary">
                      Số lượng hạng mục:
                    </Typography.Text>
                    <Typography.Text>{items.length}</Typography.Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Typography.Text type="secondary">
                      Tiền phụ tùng:
                    </Typography.Text>
                    <Typography.Text>
                      {formatService.formatCurrency(
                        items.reduce(
                          (sum, i) =>
                            sum +
                            (i.loai_hang_muc === "PHU_TUNG" ? i.thanh_tien : 0),
                          0,
                        ),
                      )}
                    </Typography.Text>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Typography.Text type="secondary">
                      Tiền công thợ:
                    </Typography.Text>
                    <Typography.Text>
                      {formatService.formatCurrency(
                        items.reduce(
                          (sum, i) =>
                            sum +
                            (i.loai_hang_muc === "DICH_VU" ? i.thanh_tien : 0),
                          0,
                        ),
                      )}
                    </Typography.Text>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography.Text strong style={{ fontSize: 16 }}>
                      Tổng thanh toán:
                    </Typography.Text>
                    <Typography.Text
                      strong
                      style={{ fontSize: 18, color: "#f5222d" }}
                    >
                      {formatService.formatCurrency(totalAmount)}
                    </Typography.Text>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Divider titlePlacement="left">Chi tiết hạng mục bảo trì</Divider>

          <Table
            dataSource={items}
            columns={columns}
            rowKey="key"
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
            footer={() => (
              <Button
                type="dashed"
                onClick={handleAddItem}
                block
                icon={<PlusOutlined />}
              >
                Thêm hạng mục
              </Button>
            )}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    <strong>Tổng tiền quyết toán:</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <strong style={{ color: "#f5222d", fontSize: "18px" }}>
                      {formatService.formatCurrency(totalAmount)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} />
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Space>
              <Button onClick={() => navigate("/maintenance")}>Hủy</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                htmlType="submit"
              >
                Lưu phiếu bảo trì
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* Modal Thêm Khách Hàng Nhanh */}
      <Modal
        title="Thêm mới khách hàng"
        open={isAddCustomerModalVisible}
        onCancel={() => setIsAddCustomerModalVisible(false)}
        onOk={() => customerForm.submit()}
        confirmLoading={addingCustomer}
      >
        <Form
          form={customerForm}
          layout="vertical"
          onFinish={handleAddCustomer}
        >
          <Form.Item
            name="ho_ten"
            label="Họ tên khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item name="dien_thoai" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item name="dia_chi" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceFormPage;
