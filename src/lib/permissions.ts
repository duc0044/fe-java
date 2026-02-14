export type Role = 'ROLE_ADMIN' | 'ROLE_MANAGER' | 'ROLE_STAFF' | 'ROLE_USER';

export const roleHierarchy: Record<Role, number> = {
  'ROLE_ADMIN': 4,
  'ROLE_MANAGER': 3,
  'ROLE_STAFF': 2,
  'ROLE_USER': 1,
};

export const rolePermissions: Record<Role, string[]> = {
  'ROLE_ADMIN': [
    'user:read', 'user:create', 'user:update', 'user:delete',
    'report:read', 'report:create', 'report:update', 'report:delete', 'report:export',
    'order:read', 'order:create', 'order:update', 'order:delete', 'order:approve',
    'audit:read', 'system:config', 'role:manage'
  ],
  'ROLE_MANAGER': [
    'user:read', 'user:create', 'user:update',
    'report:read', 'report:create', 'report:update', 'report:export',
    'order:read', 'order:create', 'order:update', 'order:approve'
  ],
  'ROLE_STAFF': [
    'user:read',
    'report:read', 'report:create',
    'order:read', 'order:create'
  ],
  'ROLE_USER': [
    'user:read'
  ],
};

// Kiểm tra xem role có cao hơn hoặc bằng minimum role không
export const hasMinimumRole = (userRole: Role | Role[], minimumRole: Role): boolean => {
  const roles = Array.isArray(userRole) ? userRole : [userRole];
  return roles.some(role => roleHierarchy[role] >= roleHierarchy[minimumRole]);
};

// Kiểm tra xem role có specific permission không (dựa trên role)
export const hasPermission = (userRole: Role | Role[], permission: string): boolean => {
  const roles = Array.isArray(userRole) ? userRole : [userRole];
  return roles.some(role => rolePermissions[role]?.includes(permission));
};

// Kiểm tra xem user có permission từ API response không
export const hasPermissionFromApi = (apiPermissions: string[] | undefined, permission: string): boolean => {
  if (!apiPermissions || !Array.isArray(apiPermissions)) return false;
  return apiPermissions.includes(permission);
};

// Lấy role cao nhất từ mảng roles
export const getHighestRole = (roles: Role[]): Role => {
  return roles.reduce((highest, current) =>
    roleHierarchy[current] > roleHierarchy[highest] ? current : highest
    , 'ROLE_USER');
};

// Lấy display name cho role
export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    'ROLE_ADMIN': 'Quản trị viên',
    'ROLE_MANAGER': 'Quản lý',
    'ROLE_STAFF': 'Nhân viên',
    'ROLE_USER': 'Người dùng',
  };
  return labels[role] || role;
};
