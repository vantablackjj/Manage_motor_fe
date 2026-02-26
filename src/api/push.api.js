// src/api/push.api.js
import axiosInstance from "./axios.config";

const pushApi = {
  // Đăng ký nhận thông báo Push
  subscribe: (subscription) => {
    return axiosInstance.post("/push/subscribe", subscription);
  },

  // Hủy đăng ký nhận thông báo Push
  unsubscribe: (endpoint) => {
    return axiosInstance.post("/push/unsubscribe", { endpoint });
  },
};

export default pushApi;
