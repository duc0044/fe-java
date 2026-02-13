import React from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";

interface UserLayoutProps {
    children: React.ReactNode;
    username?: string;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children, username }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    ViteJava Portal
                </h1>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-slate-600 px-3 py-1 bg-slate-100 rounded-full">
                        {username || "User"}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </div>
            </nav>
            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
            <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-400">
                © 2024 ViteJava Framework. All rights reserved.
            </footer>
        </div>
    );
};

export default UserLayout;
