import api from './axios';

export const proposalService = {
  getAll: (page = 0, size = 10) => api.get(`/proposals?page=${page}&size=${size}`),
  getById: (id) => api.get(`/proposals/${id}`),
  create: (data) => api.post('/proposals', data),
  update: (id, data) => api.put(`/proposals/${id}`, data),
  withdraw: (id) => api.put(`/proposals/${id}/withdraw`),
  accept: (id) => api.put(`/proposals/${id}/accept`),
  reject: (id) => api.put(`/proposals/${id}/reject`),
  getByJob: (jobId, page = 0, size = 10) => api.get(`/proposals/job/${jobId}?page=${page}&size=${size}`),
  getByFreelancer: (freelancerId, page = 0, size = 10) => api.get(`/proposals/freelancer/${freelancerId}?page=${page}&size=${size}`),
  getMy: (page = 0, size = 10) => api.get(`/proposals/my?page=${page}&size=${size}`),
};
