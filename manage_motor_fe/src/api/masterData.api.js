import axiosInstance from './axios.config';
import { API_BASE_URL } from '../utils/constant';

export const masterDataApi = {
  getAll: (resource) =>
    axiosInstance.get(`/${resource}`),

  getById: (resource, id) =>
    axiosInstance.get(`/${resource}/${id}`),


  create: (resource, data) =>
    axiosInstance.post(`/${resource}`, data),

  update: (resource, id, data) =>
    axiosInstance.put(`/${resource}/${id}`, data),

  remove: (resource, id) =>
    axiosInstance.delete(`/${resource}/${id}`)
};
