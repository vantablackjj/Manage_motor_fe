// src/services/notification.service.js
// Notification service using Ant Design message and notification

import { message, notification } from "antd";

class NotificationService {
  constructor() {
    // Configure default settings
    message.config({
      top: 80,
      duration: 3,
      maxCount: 3,
    });

    notification.config({
      placement: "topRight",
      top: 80,
      duration: 4.5,
    });
  }

  // ===== MESSAGE (TOAST) =====

  success(content, duration = 3) {
    return message.success(content, duration);
  }

  error(content, duration = 3) {
    return message.error(content, duration);
  }

  warning(content, duration = 3) {
    return message.warning(content, duration);
  }

  info(content, duration = 3) {
    return message.info(content, duration);
  }

  loading(content, duration = 0) {
    return message.loading(content, duration);
  }

  // ===== NOTIFICATION (MORE DETAILED) =====

  showNotification(type, title, description, options = {}) {
    const config = {
      message: title,
      description: description,
      duration: options.duration || 4.5,
      placement: options.placement || "topRight",
      ...options,
    };

    notification[type](config);
  }

  notifySuccess(title, description, options = {}) {
    this.showNotification("success", title, description, options);
  }

  notifyError(title, description, options = {}) {
    this.showNotification("error", title, description, options);
  }

  notifyWarning(title, description, options = {}) {
    this.showNotification("warning", title, description, options);
  }

  notifyInfo(title, description, options = {}) {
    this.showNotification("info", title, description, options);
  }

  // ===== OPERATION NOTIFICATIONS =====

  operationSuccess(operation = "Thao tác") {
    return this.success(`${operation} thành công`);
  }

  operationError(operation = "Thao tác", error = null) {
    const errorMsg = error?.message || error || "Vui lòng thử lại";
    return this.error(`${operation} thất bại: ${errorMsg}`);
  }

  // ===== CRUD NOTIFICATIONS =====

  createSuccess(entityName = "Bản ghi") {
    return this.success(`Tạo ${entityName} thành công`);
  }

  createError(entityName = "Bản ghi", error = null) {
    return this.operationError(`Tạo ${entityName}`, error);
  }

  updateSuccess(entityName = "Bản ghi") {
    return this.success(`Cập nhật ${entityName} thành công`);
  }

  updateError(entityName = "Bản ghi", error = null) {
    return this.operationError(`Cập nhật ${entityName}`, error);
  }

  deleteSuccess(entityName = "Bản ghi") {
    return this.success(`Xóa ${entityName} thành công`);
  }

  deleteError(entityName = "Bản ghi", error = null) {
    return this.operationError(`Xóa ${entityName}`, error);
  }

  // ===== WORKFLOW NOTIFICATIONS =====

  approveSuccess(entityName = "Phiếu") {
    return this.success(`Phê duyệt ${entityName} thành công`);
  }

  approveError(entityName = "Phiếu", error = null) {
    return this.operationError(`Phê duyệt ${entityName}`, error);
  }

  rejectSuccess(entityName = "Phiếu") {
    return this.success(`Từ chối ${entityName} thành công`);
  }

  rejectError(entityName = "Phiếu", error = null) {
    return this.operationError(`Từ chối ${entityName}`, error);
  }

  cancelSuccess(entityName = "Phiếu") {
    return this.success(`Hủy ${entityName} thành công`);
  }

  cancelError(entityName = "Phiếu", error = null) {
    return this.operationError(`Hủy ${entityName}`, error);
  }

  sendForApprovalSuccess(entityName = "Phiếu") {
    return this.success(`Gửi ${entityName} phê duyệt thành công`);
  }

  sendForApprovalError(entityName = "Phiếu", error = null) {
    return this.operationError(`Gửi ${entityName} phê duyệt`, error);
  }

  // ===== VALIDATION NOTIFICATIONS =====

  validationError(message = "Vui lòng kiểm tra lại thông tin") {
    return this.error(message);
  }

  requiredFieldError(fieldName = "Trường") {
    return this.error(`${fieldName} là bắt buộc`);
  }

  // ===== FILE NOTIFICATIONS =====

  uploadSuccess(fileName = "File") {
    return this.success(`Tải lên ${fileName} thành công`);
  }

  uploadError(fileName = "File", error = null) {
    return this.operationError(`Tải lên ${fileName}`, error);
  }

  downloadSuccess(fileName = "File") {
    return this.success(`Tải xuống ${fileName} thành công`);
  }

  downloadError(fileName = "File", error = null) {
    return this.operationError(`Tải xuống ${fileName}`, error);
  }

  // ===== NETWORK NOTIFICATIONS =====

  networkError() {
    return this.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet");
  }

  serverError() {
    return this.error("Lỗi máy chủ. Vui lòng thử lại sau");
  }

  timeoutError() {
    return this.error("Hết thời gian chờ. Vui lòng thử lại");
  }

  // ===== AUTH NOTIFICATIONS =====

  loginSuccess() {
    return this.success("Đăng nhập thành công");
  }

  loginError(error = null) {
    return this.operationError(
      "Đăng nhập",
      error || "Tên đăng nhập hoặc mật khẩu không đúng"
    );
  }

  logoutSuccess() {
    return this.success("Đăng xuất thành công");
  }

  sessionExpired() {
    return this.warning("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
  }

  unauthorized() {
    return this.error("Bạn không có quyền thực hiện thao tác này");
  }

  // ===== STOCK NOTIFICATIONS =====

  lowStockWarning(itemName, quantity) {
    this.notifyWarning(
      "Cảnh báo tồn kho thấp",
      `${itemName} chỉ còn ${quantity} trong kho`,
      { duration: 6 }
    );
  }

  outOfStockError(itemName) {
    return this.error(`${itemName} đã hết hàng`);
  }

  stockLocked(itemName) {
    return this.warning(`${itemName} đang bị khóa`);
  }

  // ===== PAYMENT NOTIFICATIONS =====

  paymentSuccess(amount) {
    return this.success(`Thanh toán ${amount} thành công`);
  }

  paymentError(error = null) {
    return this.operationError("Thanh toán", error);
  }

  // ===== COPYING =====

  copySuccess(content = "Nội dung") {
    return this.success(`Đã sao chép ${content}`);
  }

  copyError() {
    return this.error("Không thể sao chép. Vui lòng thử lại");
  }

  // ===== SAVING =====

  saving() {
    return this.loading("Đang lưu...", 0);
  }

  saveSuccess() {
    return this.success("Lưu thành công");
  }

  saveError(error = null) {
    return this.operationError("Lưu", error);
  }

  // ===== LOADING =====

  loadingData() {
    return this.loading("Đang tải dữ liệu...", 0);
  }

  loadingComplete() {
    message.destroy();
  }

  // ===== CUSTOM =====

  custom(type, content, duration = 3) {
    return message[type](content, duration);
  }

  customNotification(config) {
    return notification.open(config);
  }

  // ===== DESTROY =====

  destroy() {
    message.destroy();
    notification.destroy();
  }

  destroyMessage() {
    message.destroy();
  }

  destroyNotification() {
    notification.destroy();
  }

  // ===== CONFIRMATION =====

  // Note: This returns a promise that can be used with modal.confirm
  confirm(config) {
    return new Promise((resolve, reject) => {
      notification.open({
        ...config,
        onOk: () => resolve(true),
        onCancel: () => reject(false),
      });
    });
  }
}

export default new NotificationService();
