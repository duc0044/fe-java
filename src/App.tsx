import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import PermissionManagement from './pages/PermissionManagement';
import RoleManagement from './pages/RoleManagement';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import { authService } from './services/authService';
import { Toaster } from "@/components/ui/toaster"
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/stores/authStore';

// Component bảo vệ và phân loại Layout
const ProtectedLayout = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await authService.getProfile();
        setProfile(res.data);
        useAuthStore.getState().setUserProfile(res.data);
      } catch (error) {
        console.error("Auth error:", error);
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-medium text-slate-500">Đang khởi tạo ứng dụng...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-medium text-slate-500">Đang tải thông tin...</div>;

  const hasAdminAccess = profile?.email === 'admin@admin.com' ||
    (profile?.roles && (Array.isArray(profile.roles)
      ? (profile.roles.includes('ROLE_ADMIN') || profile.roles.includes('ROLE_MANAGER') || profile.roles.includes('ROLE_STAFF'))
      : (profile.roles === 'ROLE_ADMIN' || profile.roles === 'ROLE_MANAGER' || profile.roles === 'ROLE_STAFF')
    ));

  if (requireAdmin && !hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  if (hasAdminAccess) {
    return <AdminLayout username={profile.username || (profile as any).userName}>{children}</AdminLayout>;
  }

  return <UserLayout username={profile.username || (profile as any).userName}>{children}</UserLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* User Space */}
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <UserDashboard />
            </ProtectedLayout>
          }
        />

        {/* Admin Space */}
        <Route
          path="/admin"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedLayout requireAdmin={true}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="permissions" element={<PermissionManagement />} />
                <Route path="roles" element={<RoleManagement />} />
                <Route path="settings" element={<div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">Cài đặt hệ thống (Coming Soon)</div>} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </ProtectedLayout>
          }
        />

        {/* Default route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
