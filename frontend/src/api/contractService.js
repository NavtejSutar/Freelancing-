import api from './axios';

export const contractService = {
  getAll: (page = 0, size = 10) => api.get(`/contracts?page=${page}&size=${size}`),
  getById: (id) => api.get(`/contracts/${id}`),
  createFromProposal: (proposalId) => api.post(`/contracts/proposal/${proposalId}`),
  complete: (id) => api.put(`/contracts/${id}/complete`),
  cancel: (id) => api.put(`/contracts/${id}/cancel`),
  getByClient: (clientId, page = 0, size = 10) => api.get(`/contracts/client/${clientId}?page=${page}&size=${size}`),
  getByFreelancer: (freelancerId, page = 0, size = 10) => api.get(`/contracts/freelancer/${freelancerId}?page=${page}&size=${size}`),
  // Milestones
  getMilestones: (contractId) => api.get(`/contracts/${contractId}/milestones`),
  createMilestone: (contractId, data) => api.post(`/contracts/${contractId}/milestones`, data),
  updateMilestone: (contractId, milestoneId, data) => api.put(`/contracts/${contractId}/milestones/${milestoneId}`, data),
  deleteMilestone: (contractId, milestoneId) => api.delete(`/contracts/${contractId}/milestones/${milestoneId}`),
  completeMilestone: (contractId, milestoneId) => api.put(`/contracts/${contractId}/milestones/${milestoneId}/complete`),
};
