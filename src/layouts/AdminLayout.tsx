import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, LogOut, ShieldCheck, Key, Shield } from "lucide-react";
import { hasMinimumRole, getRoleLabel } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";

interface AdminLayoutProps {
    children: React.ReactNode;
    username?: string;
}

interface MenuItem {
    name: string;
    icon: React.ComponentType<{ size: number }>;
    path: string;
    requiredRole?: Role;
    requiredPermission?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, username }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { userProfile } = useAuthStore();

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const allMenuItems: MenuItem[] = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { name: "Người dùng", icon: Users, path: "/admin/users", requiredPermission: "user:create" },
        { name: "Vai trò", icon: Shield, path: "/admin/roles", requiredPermission: "role:manage" },
        { name: "Quyền hạn", icon: Key, path: "/admin/permissions", requiredPermission: "role:manage" },
        { name: "Cài đặt", icon: Settings, path: "/admin/settings", requiredPermission: "system:config" },
    ];

    // Lọc menu items dựa trên quyền từ API hoặc role
    const userRoles = (Array.isArray(userProfile?.roles) ? userProfile?.roles : [userProfile?.roles]) as Role[];
    const menuItems = allMenuItems.filter(item => {
        if (!item.requiredPermission && !item.requiredRole) return true;

        // Ưu tiên kiểm tra permissions từ API trước
        if (item.requiredPermission) {
            if (userProfile?.permissions && Array.isArray(userProfile.permissions)) {
                return userProfile.permissions.includes(item.requiredPermission);
            }
            // Fallback: không có API permissions, không hiển thị
            return false;
        }

        // Fallback: kiểm tra role nếu không có permission requirement
        if (item.requiredRole) {
            return hasMinimumRole(userRoles, item.requiredRole);
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col sticky top-0 h-screen shadow-xl">
                <div className="p-6 flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-lg">
                        <ShieldCheck className="text-white h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">AdminPanel</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                            {username?.substring(0, 2) || "AD"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{username}</p>
                            <p className="text-xs text-slate-500">{userProfile && getRoleLabel(userRoles[0] || 'ROLE_USER')}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>Đăng xuất</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
                    <h2 className="text-lg font-bold text-slate-800 capitalize">
                        {menuItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-xs font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">
                            Hệ thống ổn định
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
