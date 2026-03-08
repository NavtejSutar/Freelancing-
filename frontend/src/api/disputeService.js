import api from './axios';

export const disputeService = {
  getAll: (page = 0, size = 10) => api.get(`/disputes?page=${page}&size=${size}`),
  getById: (id) => api.get(`/disputes/${id}`),
  create: (data) => api.post('/disputes', data),
  resolve: (id, data) => api.put(`/disputes/${id}/resolve`, data),
  close: (id) => api.put(`/disputes/${id}/close`),
  getByContract: (contractId) => api.get(`/disputes/contract/${contractId}`),
};
