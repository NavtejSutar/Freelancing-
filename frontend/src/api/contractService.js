import api from './axios';

export const contractService = {
  getAll: (page = 0, size = 10) => api.get(`/contracts?page=${page}&size=${size}`),
  getById: (id) => api.get(`/contracts/${id}`),
  createFromProposal: (proposalId) => api.post(`/contracts/proposal/${proposalId}`),
  // FIX: signatureUrl sent in the JSON request body instead of as a query param.
  // A drawn canvas signature is a base64 PNG string (50-200KB). Sending it as a
  // URL query param caused Tomcat to reject the request with "Request header is
  // too large" (default 8KB limit) -> the frontend showed "Failed to sign contract".
  // Sending it in the body has no size restriction and works on any deployment.
  accept: (id, signatureUrl) => api.put(`/contracts/${id}/accept`, { signatureUrl }),
  complete: (id) => api.put(`/contracts/${id}/complete`),
  cancel: (id) => api.put(`/contracts/${id}/cancel`),
  getByClient: (clientId, page = 0, size = 10) => api.get(`/contracts/client/${clientId}?page=${page}&size=${size}`),
  getByFreelancer: (freelancerId, page = 0, size = 10) => api.get(`/contracts/freelancer/${freelancerId}?page=${page}&size=${size}`),
  getMilestones: (contractId) => api.get(`/contracts/${contractId}/milestones`),
  createMilestone: (contractId, data) => api.post(`/contracts/${contractId}/milestones`, data),
  updateMilestone: (contractId, milestoneId, data) => api.put(`/contracts/${contractId}/milestones/${milestoneId}`, data),
  deleteMilestone: (contractId, milestoneId) => api.delete(`/contracts/${contractId}/milestones/${milestoneId}`),
  completeMilestone: (contractId, milestoneId) => api.put(`/contracts/${contractId}/milestones/${milestoneId}/complete`),
};