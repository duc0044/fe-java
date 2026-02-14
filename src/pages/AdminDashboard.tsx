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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tổng người dùng</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-slate-800">{summary?.totalUsers}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Phiên hoạt động</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-black text-blue-600">{summary?.activeSessions}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Sức khỏe hệ thống</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold text-emerald-600 uppercase italic">{summary?.systemHealth}</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {summary?.recentActivity.map((activity, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 items-center">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                <p className="text-sm text-slate-600 font-medium">{activity}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {checkPermission('audit:read') && (
                <Card className="border-slate-200 shadow-sm bg-purple-50 border-purple-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-purple-900">🔒 Audit Log (Chỉ Admin)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-purple-700">
                            <p className="mb-2">Các hành động được ghi nhận:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Đăng nhập/Đăng xuất người dùng</li>
                                <li>Thay đổi role và quyền</li>
                                <li>Tạo/Xóa tài khoản</li>
                                <li>Truy cập các tài nguyên bị hạn chế</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {checkPermission('system:config') && (
                <Card className="border-slate-200 shadow-sm bg-red-50 border-red-200">
                    <CardHeader>
                        <CardTitle className="text-lg text-red-900">⚙️ Cài đặt hệ thống (Chỉ Admin)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-red-700">
                            <p className="font-bold mb-2">Quyền truy cập:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>Thay đổi cấu hình hệ thống</li>
                                <li>Quản lý cơ sở dữ liệu</li>
                                <li>Cấu hình bảo mật</li>
                                <li>Quản lý tích hợp API</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminDashboard;
