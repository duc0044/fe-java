import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSummary {
    totalUsers: number;
    activeSessions: number;
    systemHealth: string;
    recentActivity: string[];
}

const AdminDashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

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
        </div>
    );
};

export default AdminDashboard;
