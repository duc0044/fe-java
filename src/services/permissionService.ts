import api from '../api/axiosInstance';

export const permissionService = {
  // Permission endpoints
  getPermissions: async (params?: { page?: number, size?: number, category?: string }) => {
    return api.get('/api/permissions', { params });
  },
  getAllPermissions: async () => {
    return api.get('/api/permissions/all');
  },
  getCategories: async () => {
    return api.get('/api/permissions/categories');
  },
  getPermissionById: async (id: number) => {
    return api.get(`/api/permissions/${id}`);
  },
  createPermission: async (data: any) => {
    return api.post('/api/permissions', data);
  },
  updatePermission: async (id: number, data: any) => {
    return api.put(`/api/permissions/${id}`, data);
  },
  deletePermission: async (id: number) => {
    return api.delete(`/api/permissions/${id}`);
  },

  // Role endpoints
  getRoles: async (params?: { page?: number, size?: number }) => {
    return api.get('/api/roles', { params });
  },
  getAllRoles: async () => {
    return api.get('/api/roles/all');
  },
  getRoleById: async (id: number) => {
    return api.get(`/api/roles/${id}`);
  },
  createRole: async (data: any) => {
    return api.post('/api/roles', data);
  },
  updateRole: async (id: number, data: any) => {
    return api.put(`/api/roles/${id}`, data);
  },
  deleteRole: async (id: number) => {
    return api.delete(`/api/roles/${id}`);
  },
  assignPermissionsToRole: async (roleId: number, permissions: string[]) => {
    return api.post(`/api/roles/${roleId}/permissions`, { permissions });
  }
};
