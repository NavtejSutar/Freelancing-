import api from './axios';

export const skillService = {
  getAll: (categoryId) => api.get('/skills', { params: categoryId ? { categoryId } : {} }),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  getCategories: () => api.get('/skills/categories'),
  // FIX: backend uses @RequestParam (not @RequestBody) for createCategory, so send as params
  createCategory: ({ name, description }) =>
    api.post('/skills/categories', null, { params: { name, description } }),
  deleteCategory: (id) => api.delete(`/skills/categories/${id}`),
};