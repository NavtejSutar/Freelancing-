import api from './axios';

export const skillService = {
  getAll: (categoryId) => api.get('/skills', { params: categoryId ? { categoryId } : {} }),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  getCategories: () => api.get('/skills/categories'),
  createCategory: (data) => api.post('/skills/categories', data),
  deleteCategory: (id) => api.delete(`/skills/categories/${id}`),
};
