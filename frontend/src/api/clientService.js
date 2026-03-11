import api from './axios';

export const clientService = {
  getAll: (page = 0, size = 10) => api.get(`/clients?page=${page}&size=${size}`),
  getById: (id) => api.get(`/clients/${id}`),
  getMe: () => api.get('/clients/me'),
  createMe: (data) => api.post('/clients/me', data),
  updateMe: (data) => api.put('/clients/me', data),
  getCompany: () => api.get('/clients/me/company'),
  createCompany: (data) => api.post('/clients/me/company', data),
  updateCompany: (data) => api.put('/clients/me/company', data),
};
