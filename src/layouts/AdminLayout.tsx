import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { AuthenticatedImage } from "@/components/AuthenticatedImage";
import { LayoutDashboard, Users, Settings, LogOut, ShieldCheck, Key, Shield, ShoppingCart } from "lucide-react";
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
        { name: "Đơn hàng", icon: ShoppingCart, path: "/admin/orders", requiredPermission: "order:read" },
        { name: "Vai trò", icon: Shield, path: "/admin/roles", requiredPermission: "role:manage" },
        { name: "Quyền hạn", icon: Key, path: "/admin/permissions", requiredPermission: "role:manage" },
        { name: "Cài đặt", icon: Settings, path: "/admin/settings", requiredPermission: "system:config" },
    ];

    // Lọc menu items dựa trên quyền từ API hoặc role
    const userRoles = (Array.isArray(userProfile?.roles) ? userProfile?.roles : [userProfile?.roles]) as Role[];
    const isAdmin = userRoles.includes('ROLE_ADMIN');
    const avatarUrl = userProfile?.avatarUrl ? authService.getAvatarUrl(userProfile.avatarUrl) : null;

    const menuItems = allMenuItems.filter(item => {
        // Admin có toàn quyền - hiển thị tất cả menu
        if (isAdmin) return true;

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 flex flex-col sticky top-0 h-screen shadow-2xl">
                <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30">
                        <ShieldCheck className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <span className="text-xl font-black text-white tracking-tight">AdminPanel</span>
                        <p className="text-xs text-slate-400 font-medium">Control Center</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${location.pathname === item.path
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30"
                                : "hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-semibold">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-slate-800/50 rounded-2xl">
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-400/50 shadow-lg">
                            {avatarUrl ? (
                                <AuthenticatedImage
                                    src={avatarUrl}
                                    alt={username || "Admin"}
                                    className="w-full h-full object-cover"
                                    fallback={
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                                            {(username || "AD").substring(0, 2).toUpperCase()}
                                        </div>
                                    }
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                                    {(username || "AD").substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{username}</p>
                            <p className="text-xs text-slate-400 font-medium truncate">{userProfile && getRoleLabel(userRoles[0] || 'ROLE_USER')}</p>
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
