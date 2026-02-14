import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission, hasMinimumRole } from '@/lib/permissions';
import type { Role } from '@/lib/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: string;
  minRole?: Role;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard component để hiển thị/ẩn nội dung dựa trên quyền hoặc role
 * 
 * @example
 * // Hiển thị nếu user có quyền 'user:delete'
 * <PermissionGuard permission="user:delete">
 *   <DeleteButton />
 * </PermissionGuard>
 * 
 * @example
 * // Hiển thị nếu user là ROLE_ADMIN hoặc cao hơn
 * <PermissionGuard minRole="ROLE_ADMIN">
 *   <AdminSettings />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  minRole,
  fallback,
}) => {
  const { userProfile } = useAuthStore();

  const userRoles = (Array.isArray(userProfile?.roles)
    ? userProfile?.roles
    : [userProfile?.roles]) as Role[];

  let hasAccess = true;

  if (permission) {
    // Ưu tiên kiểm tra permissions từ API trước
    if (userProfile?.permissions && Array.isArray(userProfile.permissions)) {
      hasAccess = userProfile.permissions.includes(permission);
      if (!hasAccess) {
        console.log(`[PermissionGuard] Access denied - Permission "${permission}" not found in:`, userProfile.permissions);
      }
    } else {
      // Nếu không có permissions từ API, dùng rolePermissions
      hasAccess = hasPermission(userRoles, permission);
      if (!hasAccess) {
        console.log(`[PermissionGuard] Access denied - No API permissions, role-based check failed for "${permission}" with roles:`, userRoles);
      }
    }
  } else if (minRole) {
    hasAccess = hasMinimumRole(userRoles, minRole);
  }

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default PermissionGuard;
