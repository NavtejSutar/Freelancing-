import api from './axios';

export const reviewService = {
  getAll: (page = 0, size = 10) => api.get(`/reviews?page=${page}&size=${size}`),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getByContract: (contractId) => api.get(`/reviews/contract/${contractId}`),
  getByFreelancer: (freelancerId, page = 0, size = 10) => api.get(`/reviews/freelancer/${freelancerId}?page=${page}&size=${size}`),
  getByClient: (clientId, page = 0, size = 10) => api.get(`/reviews/client/${clientId}?page=${page}&size=${size}`),
};
