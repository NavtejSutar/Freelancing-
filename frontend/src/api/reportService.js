import api from './axios';

export const reportService = {
  submit: (data) => api.post('/reports', data),
  getMy: (page = 0, size = 10) => api.get(`/reports/my?page=${page}&size=${size}`),
  getById: (id) => api.get(`/reports/${id}`),
  getAll: (page = 0, size = 10) => api.get(`/reports?page=${page}&size=${size}`),
  resolve: (id, adminNote) => api.put(`/reports/${id}/resolve`, { adminNote }),
};
