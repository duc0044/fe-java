import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');

        if (accessToken && refreshToken) {
            useAuthStore.getState().setTokens(accessToken, refreshToken);
            navigate('/');
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <h2 className="text-xl font-semibold text-slate-700 animate-pulse">Đang định danh tài khoản...</h2>
                <p className="text-sm text-slate-500">Vui lòng đợi trong giây lát</p>
            </div>
        </div>
    );
};

export default AuthCallback;
