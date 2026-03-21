import api from './axios';

// Convert file to base64 data URL (used for signatures only)
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export const fileService = {
  // Upload a PDF to the server via the backend file endpoint.
  // Returns the server URL string (e.g. /api/files/pdfs/uuid_filename.pdf).
  // This URL is stored in proposal.coverLetterPdfUrl so the client can open it.
  uploadPdf: async (file) => {
    if (!file) throw new Error('No file provided');
    if (file.size > 10 * 1024 * 1024) throw new Error('PDF must be under 10MB');
    if (file.type !== 'application/pdf') throw new Error('Only PDF files are allowed');

    const formData = new FormData();
    formData.append('file', file);

    // Do not manually set Content-Type — let the browser set the multipart boundary
    const response = await api.post('/files/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = response.data?.data?.url;
    if (!url) throw new Error('Upload succeeded but no URL was returned');
    return url;
  },

  // Upload a signature image to the server.
  // Kept for reference — contract signing also supports base64 drawn signatures.
  uploadSignature: async (file) => {
    if (!file) throw new Error('No file provided');

    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload/signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const url = response.data?.data?.url;
    if (!url) throw new Error('Upload succeeded but no URL was returned');
    return url;
  },

  // Converts a file to a base64 data URL — used directly for signatures
  // drawn on canvas (no server round-trip needed for that case).
  toBase64,
};