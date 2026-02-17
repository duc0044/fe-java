import api from '../api/axiosInstance';
import { useAuthStore } from '../stores/authStore';

export const authService = {
    // Auth endpoints
    register: async (userData: any) => {
        return api.post('/api/auth/register', userData);
    },
    login: async (credentials: any) => {
        return api.post('/api/auth/login', credentials);
    },
    logout: () => {
        useAuthStore.getState().logout();
        window.location.href = '/login';
    },
    triggerGoogleLogin: () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/oauth2/authorization/google`;
    },
    getProfile: async () => {
        return api.get('/api/auth/me');
    },
    getDashboardSummary: async () => {
        return api.get('/api/auth/dashboard/summary');
    },
    refreshToken: async (token: string) => {
        return api.post('/api/auth/refresh', { refreshToken: token });
    },

    // User Management CRUD (Authority-based)
    getUsers: async (params?: { page?: number, size?: number, search?: string, role?: string }) => {
        return api.get('/api/users', { params });
    },
    createUser: async (userData: any) => {
        return api.post('/api/users', userData);
    },
    updateUser: async (id: number, userData: any) => {
        return api.put(`/api/users/${id}`, userData);
    },
    deleteUser: async (id: number) => {
        return api.delete(`/api/users/${id}`);
    },

    // Avatar Management
    uploadAvatar: async (userId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/api/users/${userId}/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    deleteAvatar: async (userId: number) => {
        return api.delete(`/api/users/${userId}/avatar`);
    },
    getAvatarUrl: (avatarUrl?: string) => {
        if (!avatarUrl) return null;
        // avatarUrl format: "avatars/user-{id}/filename.png"
        // Convert to: "/api/files/download?path=avatars/user-{id}/filename.png"
        return `${import.meta.env.VITE_API_URL}/api/files/download?path=${encodeURIComponent(avatarUrl)}`;
    }
};
