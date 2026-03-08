import api from './axios';

export const messageService = {
  getThreads: () => api.get('/messages/threads'),
  createThread: (data) => api.post('/messages/threads', data),
  getMessages: (threadId, page = 0, size = 20) => api.get(`/messages/threads/${threadId}/messages?page=${page}&size=${size}`),
  sendMessage: (threadId, data) => api.post(`/messages/threads/${threadId}/messages`, data),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
  getThreadByContract: (contractId) => api.get(`/messages/contract/${contractId}`),
};
