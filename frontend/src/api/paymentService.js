import api from './axios';

export const paymentService = {
  getAll: (page = 0, size = 10) => api.get(`/payments?page=${page}&size=${size}`),
  getById: (id) => api.get(`/payments/${id}`),
  initiate: (contractId, upiTransactionId) =>
    api.post(`/payments/contract/${contractId}`, { upiTransactionId }),
  confirm: (id) => api.put(`/payments/${id}/confirm`),
};