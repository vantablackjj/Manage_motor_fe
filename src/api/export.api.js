// src/api/export.api.js
import axiosInstance from "./axios.config";

export const exportApi = {
  /**
   * Export data to Excel
   * @param {string} module - Module name (customer, part, brand, etc.)
   * @param {object} params - Filter parameters
   * @returns {Promise<Blob>}
   */
  exportData: (module, params = {}) => {
    return axiosInstance.get(`/export/${module}`, {
      params,
      responseType: "blob", // Important for handling binary data
    });
  },
};
