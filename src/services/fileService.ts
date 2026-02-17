import api from '../api/axiosInstance';

export const fileService = {
  // Upload file to specific folder
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    return api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download file by path
  downloadFile: async (path: string) => {
    return api.get('/api/files/download', {
      params: { path },
      responseType: 'blob'
    });
  },

  // Delete file by path
  deleteFile: async (path: string) => {
    return api.delete('/api/files/delete', {
      params: { path }
    });
  },

  // Get file URL for display
  getFileUrl: (path?: string) => {
    if (!path) return null;
    return `${import.meta.env.VITE_API_URL}/api/files/download?path=${encodeURIComponent(path)}`;
  }
};
