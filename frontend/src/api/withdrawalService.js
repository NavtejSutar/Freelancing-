import api from './axios';

export const withdrawalService = {
  getAll: (page = 0, size = 10) => api.get(`/withdrawals?page=${page}&size=${size}`),
  create: (data) => api.post('/withdrawals', data),
  // Fix: backend uses @RequestParam String adminNote — pass as query param not request body
  approve: (id) => api.put(`/withdrawals/${id}/approve`),
  reject: (id, adminNote) => api.put(`/withdrawals/${id}/reject`, null, { params: { adminNote } }),
  getPending: (page = 0, size = 10) => api.get(`/withdrawals/pending?page=${page}&size=${size}`),
};