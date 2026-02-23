import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/stores/authStore';

const UserDashboard = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { userProfile } = useAuthStore();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await authService.getProfile();
                setProfile(res.data);
                useAuthStore.getState().setUserProfile(res.data);
            } catch (error) {
                console.error('Lỗi khi tải profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="text-center py-10">Đang tải thông tin cá nhân...</div>;

    const displayProfile = profile || userProfile;
    const username = displayProfile?.username || 'Người dùng';

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            {/* Welcome Header */}
            <div className="flex items-center gap-6 mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-3xl font-bold shadow-xl">
                    {username.substring(0, 2).toUpperCase()}
                </div>
                <div className="relative">
                    <p className="text-white/90 text-sm font-medium mb-1">Xin chào,</p>
                    <h2 className="text-4xl font-black mb-2">{username}!</h2>
                    <p className="text-white/90 font-medium">Chúc bạn một ngày làm việc hiệu quả 🚀</p>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b border-blue-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg font-black text-slate-800">Thông tin tài khoản</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex justify-between items-center py-3 border-b border-slate-100">
                            <span className="text-slate-500 font-semibold text-sm">Email</span>
                            <span className="text-slate-800 font-bold text-sm">{displayProfile?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-slate-500 font-semibold text-sm">Mã số</span>
                            <span className="text-slate-800 font-mono font-bold text-sm">#{displayProfile?.id || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl"></div>
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-transparent border-b border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <CardTitle className="text-lg font-black text-slate-800">Trạng thái hệ thống</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-transparent text-emerald-700 rounded-2xl font-bold border border-emerald-200">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-300"></span>
                            Tài khoản đang được bảo vệ
                        </div>
                        <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                <span className="font-bold text-slate-700">✓ Kết nối ổn định</span><br />
                                Server: Java Spring Boot<br />
                                Thời gian phản hồi: <span className="font-bold text-emerald-600">42ms</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Access Token */}
            <Card className="bg-slate-900 text-white overflow-hidden shadow-2xl relative border-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black">Token định danh</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Dành cho việc phát triển và tích hợp API</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-2xl font-mono text-[10px] break-all leading-relaxed text-blue-300 border border-slate-700/50 shadow-inner">
                        {useAuthStore.getState().getAccessToken() || 'No token available'}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Token này được sử dụng để xác thực các yêu cầu API</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserDashboard;
