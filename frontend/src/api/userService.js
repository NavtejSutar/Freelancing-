import api from './axios';

export const userService = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  deleteMe: () => api.delete('/users/me'),
  getAllUsers: (page = 0, size = 10) => api.get(`/users?page=${page}&size=${size}`),
  getUserById: (id) => api.get(`/users/${id}`),
};
