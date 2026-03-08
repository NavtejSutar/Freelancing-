import api from './axios';

export const withdrawalService = {
  getAll: (page = 0, size = 10) => api.get(`/withdrawals?page=${page}&size=${size}`),
  create: (data) => api.post('/withdrawals', data),
  approve: (id) => api.put(`/withdrawals/${id}/approve`),
  reject: (id, adminNote) => api.put(`/withdrawals/${id}/reject`, { adminNote }),
  getPending: (page = 0, size = 10) => api.get(`/withdrawals/pending?page=${page}&size=${size}`),
};
