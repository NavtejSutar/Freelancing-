import api from './axios';

export const fileService = {
  uploadPdf: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/files/upload/pdf', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadSignature: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/files/upload/signature', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};