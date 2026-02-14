import { useAuthStore } from '@/stores/authStore';

/**
 * Hook để kiểm tra quyền từ API permissions (thay vì chỉ từ role)
 * Ưu tiên kiểm tra permissions từ server trước, rồi mới dùng rolePermissions
 */
export const usePermissions = () => {
  const { userProfile } = useAuthStore();

  const hasPermission = (permission: string): boolean => {
    if (!userProfile) return false;

    // Kiểm tra permissions từ API trước
    if (userProfile.permissions && Array.isArray(userProfile.permissions)) {
      return userProfile.permissions.includes(permission);
    }

    return false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  return {
    permissions: userProfile?.permissions || [],
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };
};

export default usePermissions;
