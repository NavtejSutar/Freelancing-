import api from './axios';

export const disputeService = {
  getAll: (page = 0, size = 10) => api.get(`/disputes?page=${page}&size=${size}`),
  getById: (id) => api.get(`/disputes/${id}`),
  create: (data) => api.post('/disputes', data),
  // FIX: backend uses @RequestParam String resolution (not a request body).
  // Old code sent { resolution } as a JSON body which the backend couldn't read,
  // causing the resolve call to fail silently. Now sent as a query param.
  resolve: (id, resolution) => api.put(`/disputes/${id}/resolve`, null, { params: { resolution } }),
  close: (id) => api.put(`/disputes/${id}/close`),
  getByContract: (contractId) => api.get(`/disputes/contract/${contractId}`),
};