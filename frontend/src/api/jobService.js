import api from './axios';

export const jobService = {
  getAll: (page = 0, size = 10) => api.get(`/jobs?page=${page}&size=${size}`),
  getMyJobs: (page = 0, size = 10) => api.get(`/jobs/my?page=${page}&size=${size}`), // ADDED: client's own jobs
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  search: (params) => api.get('/jobs/search', { params }),
  getByClient: (clientId, page = 0, size = 10) => api.get(`/jobs/client/${clientId}?page=${page}&size=${size}`),
  addSkill: (jobId, skillId) => api.post(`/jobs/${jobId}/skills/${skillId}`),
  removeSkill: (jobId, skillId) => api.delete(`/jobs/${jobId}/skills/${skillId}`),
};