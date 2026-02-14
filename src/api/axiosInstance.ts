import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Gắn token vào request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tự động refresh khi hết hạn (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = useAuthStore.getState().getRefreshToken();
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, { refreshToken });
                useAuthStore.getState().setTokens(res.data.accessToken, res.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Nếu refresh cũng lỗi (hết hạn hoàn toàn), đăng xuất
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
