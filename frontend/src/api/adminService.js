import api from './axios';

export const adminService = {
  getUsers: (page = 0, size = 10) => api.get(`/admin/users?page=${page}&size=${size}`),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  getPendingFreelancers: (page = 0, size = 10) =>
    api.get(`/admin/freelancers/pending?page=${page}&size=${size}`),
  verifyFreelancer: (id, note) =>
    api.put(`/admin/freelancers/${id}/verify`, null, { params: note ? { note } : {} }),
  rejectFreelancer: (id, note) =>
    api.put(`/admin/freelancers/${id}/reject`, null, { params: note ? { note } : {} }),
};