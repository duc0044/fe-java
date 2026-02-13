import api from '../api/axiosInstance';

export const authService = {
    // Auth endpoints
    register: async (userData: any) => {
        return api.post('/api/auth/register', userData);
    },
    login: async (credentials: any) => {
        return api.post('/api/auth/login', credentials);
    },
    logout: () => {
        localStorage.clear();
        window.location.href = '/login';
    },
    triggerGoogleLogin: () => {
        window.location.href = '/api/auth/oauth2/authorization/google';
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
    }
};
