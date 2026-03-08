import api from './axios';

export const submissionService = {
  getAll: (page = 0, size = 10) => api.get(`/submissions?page=${page}&size=${size}`),
  getById: (id) => api.get(`/submissions/${id}`),
  create: (data) => api.post('/submissions', data),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  approve: (id) => api.put(`/submissions/${id}/approve`),
  reject: (id) => api.put(`/submissions/${id}/reject`),
  getByContract: (contractId) => api.get(`/submissions/contract/${contractId}`),
  getByMilestone: (milestoneId) => api.get(`/submissions/milestone/${milestoneId}`),
};
