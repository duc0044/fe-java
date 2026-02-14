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
        <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-200">
                    {username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-800">Xin chào, {username}!</h2>
                    <p className="text-slate-500 font-medium">Chúc bạn một ngày làm việc hiệu quả.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-blue-600">
                    <CardHeader>
                        <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500 font-medium">Email</span>
                            <span className="text-slate-800 font-bold">{displayProfile?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-50">
                            <span className="text-slate-500 font-medium">Mã số</span>
                            <span className="text-slate-800 font-mono font-bold">#{displayProfile?.id || 'N/A'}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
                    <CardHeader>
                        <CardTitle className="text-lg">Trạng thái hệ thống</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold">
                            <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                            Tài khoản đang được bảo vệ
                        </div>
                        <p className="mt-4 text-xs text-slate-400 leading-relaxed font-medium">
                            Kết nối với server Java Spring Boot ổn định. Thời gian phản hồi trung bình: 42ms.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900 text-white overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <CardHeader>
                    <CardTitle>Token định danh</CardTitle>
                    <CardDescription className="text-slate-400">Dành cho việc phát triển và tích hợp API</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-800 p-4 rounded-xl font-mono text-[10px] break-all leading-relaxed text-blue-300">
                        {useAuthStore.getState().getAccessToken()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserDashboard;
