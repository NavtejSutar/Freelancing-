import api from './axios';

export const freelancerService = {
  getAll: (page = 0, size = 10) => api.get(`/freelancers?page=${page}&size=${size}`),
  getById: (id) => api.get(`/freelancers/${id}`),
  getMe: () => api.get('/freelancers/me'),
  updateMe: (data) => api.put('/freelancers/me', data),
  createMe: (data) => api.post('/freelancers/me', data),
  search: (keyword, page = 0, size = 10) => api.get(`/freelancers/search?keyword=${keyword}&page=${page}&size=${size}`),
  addSkill: (skillId) => api.post(`/freelancers/me/skills/${skillId}`),
  removeSkill: (skillId) => api.delete(`/freelancers/me/skills/${skillId}`),
  getPortfolio: (freelancerId) => api.get(`/freelancers/${freelancerId}/portfolio`),
  addPortfolio: (data) => api.post('/freelancers/me/portfolio', data),
  updatePortfolio: (id, data) => api.put(`/freelancers/me/portfolio/${id}`, data),
  deletePortfolio: (id) => api.delete(`/freelancers/me/portfolio/${id}`),
  getEducation: (freelancerId) => api.get(`/freelancers/${freelancerId}/education`),
  addEducation: (data) => api.post('/freelancers/me/education', data),
  updateEducation: (id, data) => api.put(`/freelancers/me/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/freelancers/me/education/${id}`),
};
