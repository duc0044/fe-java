import React from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { AuthenticatedImage } from "@/components/AuthenticatedImage";
import { getRoleLabel } from "@/lib/permissions";
import type { Role } from "@/lib/permissions";

interface UserLayoutProps {
    children: React.ReactNode;
    username?: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, username }) => {
    const navigate = useNavigate();
    const { userProfile } = useAuthStore();

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const userRoles = (Array.isArray(userProfile?.roles) ? userProfile?.roles : [userProfile?.roles]) as Role[];
    const roleLabel = userRoles ? getRoleLabel(userRoles[0] || 'ROLE_USER') : 'Người dùng';
    const avatarUrl = userProfile?.avatarUrl ? authService.getAvatarUrl(userProfile.avatarUrl) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
            <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            ViteJava Portal
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">User Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* User Info with Avatar */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                    >
                        {/* Avatar */}
                        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-200 shadow-md">
                            {avatarUrl ? (
                                <AuthenticatedImage
                                    src={avatarUrl}
                                    alt={username || "User"}
                                    className="w-full h-full object-cover"
                                    fallback={
                                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                            {(username || "U").substring(0, 2).toUpperCase()}
                                        </div>
                                    }
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                    {(username || "U").substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        {/* User Name and Role */}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-700">{username || "User"}</span>
                            <span className="text-xs text-slate-500 font-medium">{roleLabel}</span>
                        </div>
                    </button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 hover:bg-red-50 hover:text-red-600 transition-colors font-semibold"
                        onClick={handleLogout}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                    </Button>
                </div>
            </nav>
            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
            <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/60 py-6 text-center">
                <p className="text-sm text-slate-500 font-medium">
                    © 2026 <span className="font-bold text-slate-700">ViteJava Framework</span>. All rights reserved.
                </p>
                <p className="text-xs text-slate-400 mt-1">Powered by Spring Boot & React</p>
            </footer>
        </div>
    );
};

export default UserLayout;
