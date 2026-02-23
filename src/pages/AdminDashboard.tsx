import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission, hasPermissionFromApi } from '@/lib/permissions';
import type { Role } from '@/lib/permissions';

interface DashboardSummary {
    totalUsers: number;
    activeSessions: number;
    systemHealth: string;
    recentActivity: string[];
}

const AdminDashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const { userProfile } = useAuthStore();

    const userRoles = (Array.isArray(userProfile?.roles) ? userProfile?.roles : [userProfile?.roles]) as Role[];

    // Helper function để kiểm tra quyền (ưu tiên API permissions)
    const checkPermission = (permission: string): boolean => {
        if (userProfile?.permissions && Array.isArray(userProfile.permissions)) {
            return hasPermissionFromApi(userProfile.permissions, permission);
        }
        return hasPermission(userRoles, permission);
    };

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await authService.getDashboardSummary();
                setSummary(res.data);
            } catch (error) {
                console.error('Lỗi khi tải thống kê:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <div className="text-center py-10">Đang tải thống kê...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium">Bảng điều khiển quản trị</p>
                            <h2 className="text-2xl font-black">Chào mừng trở lại!</h2>
                        </div>
                    </div>
                    <p className="text-white/90 font-medium mt-2">Xem tổng quan hoạt động hệ thống và quản lý người dùng</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng người dùng</p>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-slate-800 mb-1">{summary?.totalUsers || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Tài khoản đã đăng ký</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl"></div>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phiên hoạt động</p>
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-black text-emerald-600 mb-1">{summary?.activeSessions || 0}</p>
                        <p className="text-xs text-slate-500 font-medium">Đang trực tuyến</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl"></div>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sức khỏe hệ thống</p>
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-purple-600 mb-1 uppercase italic">{summary?.systemHealth || 'Good'}</p>
                        <p className="text-xs text-slate-500 font-medium">Trạng thái hoạt động</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-slate-200 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black text-slate-800">Hoạt động gần đây</CardTitle>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Cập nhật theo thời gian thực</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {summary?.recentActivity && summary.recentActivity.length > 0 ? (
                            summary.recentActivity.map((activity, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent rounded-2xl border border-slate-100 items-center hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full group-hover:scale-150 transition-transform"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{activity}</p>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-400 font-medium">Chưa có hoạt động nào</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Admin Features - Conditional Rendering */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {checkPermission('audit:read') && (
                    <Card className="border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-transparent overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl"></div>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black text-purple-900">Audit Log</CardTitle>
                                    <p className="text-xs text-purple-600 font-medium">Chỉ dành cho quản trị viên</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-purple-700">
                                <p className="mb-3 font-bold">Các hành động được ghi nhận:</p>
                                <ul className="space-y-2 text-xs">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                        Đăng nhập/Đăng xuất người dùng
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                        Thay đổi role và quyền
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                        Tạo/Xóa tài khoản
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                        Truy cập các tài nguyên bị hạn chế
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {checkPermission('system:config') && (
                    <Card className="border-amber-200 shadow-lg bg-gradient-to-br from-amber-50 to-transparent overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl"></div>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black text-amber-900">Cài đặt hệ thống</CardTitle>
                                    <p className="text-xs text-amber-600 font-medium">Chỉ dành cho quản trị viên</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-amber-700">
                                <p className="font-bold mb-3">Quyền truy cập:</p>
                                <ul className="space-y-2 text-xs">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                        Thay đổi cấu hình hệ thống
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                        Quản lý cơ sở dữ liệu
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                        Cấu hình bảo mật
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                                        Quản lý tích hợp API
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
