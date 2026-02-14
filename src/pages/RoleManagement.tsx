import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { permissionService } from '@/services/permissionService';
import { useToast } from "@/hooks/use-toast";
import { hasPermission, hasPermissionFromApi } from '@/lib/permissions';
import type { Role as RoleType } from '@/lib/permissions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog as ShadDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Role {
  id: number;
  name: string;
  description: string;
  permissions?: string[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

const PERMISSION_CATEGORIES = {
  'User Management': [] as string[],
  'Report Management': [] as string[],
  'Order Management': [] as string[],
  'System Management': [] as string[]
};

const RoleManagement = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();

  // Permission check
  const userRoles = (Array.isArray(userProfile?.roles) ? userProfile?.roles : [userProfile?.roles]) as RoleType[];
  const hasAccess = userProfile?.permissions
    ? hasPermissionFromApi(userProfile.permissions, 'role:manage')
    : hasPermission(userRoles, 'role:manage');

  useEffect(() => {
    if (!hasAccess) {
      navigate('/admin/dashboard');
    }
  }, [hasAccess, navigate]);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [permissionsByCategory, setPermissionsByCategory] = useState(PERMISSION_CATEGORIES);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      const res = await permissionService.getRoles(params);

      if (res.data.content) {
        setRoles(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalItems);
      }
    } catch (error) {
      console.error("Fetch roles error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách vai trò",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await permissionService.getAllPermissions();

      // Group permissions by category
      const grouped: any = {
        'User Management': [],
        'Report Management': [],
        'Order Management': [],
        'System Management': []
      };

      res.data.forEach((perm: Permission) => {
        if (grouped[perm.category]) {
          grouped[perm.category].push(perm.name);
        }
      });

      setPermissionsByCategory(grouped);
    } catch (error) {
      console.error("Fetch permissions error:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  useEffect(() => {
    fetchAllPermissions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await permissionService.createRole(formData);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', permissions: [] });
      toast({
        title: "Thành công",
        description: "Tạo vai trò mới thành công",
        variant: "success",
      });
      fetchRoles();
    } catch (error: any) {
      const message = error.response?.data?.error || "Lỗi khi tạo vai trò";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await permissionService.updateRole(editingRole.id, formData);
      setEditingRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      toast({
        title: "Thành công",
        description: "Cập nhật vai trò thành công",
        variant: "success",
      });
      fetchRoles();
    } catch (error: any) {
      const message = error.response?.data?.error || "Lỗi khi cập nhật vai trò";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await permissionService.deleteRole(id);
      toast({
        title: "Thành công",
        description: "Đã xóa vai trò",
        variant: "success",
      });
      fetchRoles();
    } catch (error: any) {
      const message = error.response?.data?.error || "Lỗi khi xóa vai trò";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = async (role: Role) => {
    try {
      const res = await permissionService.getRoleById(role.id);
      const roleData = res.data;

      setEditingRole(role);
      setFormData({
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions || []
      });
    } catch (error) {
      console.error("Load role error:", error);
    }
  };

  const togglePermission = (permName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter(p => p !== permName)
        : [...prev.permissions, permName]
    }));
  };

  const getRoleColor = (roleName: string) => {
    if (roleName === 'ROLE_ADMIN') return 'destructive';
    if (roleName === 'ROLE_MANAGER') return 'default';
    if (roleName === 'ROLE_STAFF') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý vai trò</h2>
          <p className="text-sm text-slate-500">Cấu hình roles và phân quyền trong hệ thống</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchRoles} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <ShadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                Thêm vai trò
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tạo vai trò mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin và chọn quyền cho vai trò mới
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên vai trò</Label>
                  <Input
                    id="name"
                    placeholder="ROLE_STAFF"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Nhân viên văn phòng"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-3 border rounded-lg p-4 bg-slate-50 max-h-96 overflow-y-auto">
                  <Label>Chọn quyền</Label>
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <div key={perm} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`new-${perm}`}
                              checked={formData.permissions.includes(perm)}
                              onChange={() => togglePermission(perm)}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor={`new-${perm}`} className="text-xs font-mono">
                              {perm}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <div className="text-xs text-slate-500">
                    Đã chọn: {formData.permissions.length} quyền
                  </div>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </ShadDialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Số quyền</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                  Không tìm thấy vai trò nào
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-slate-400">#{role.id}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleColor(role.name)} className="font-mono">
                      {role.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className="text-slate-400" />
                      <span className="text-sm font-semibold">
                        {role.permissions?.length || 0} quyền
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(role)}>
                        <Pencil size={16} className="text-slate-400 hover:text-blue-500" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={role.name === 'ROLE_ADMIN' || role.name === 'ROLE_USER'}
                          >
                            <Trash2 size={16} className={
                              role.name === 'ROLE_ADMIN' || role.name === 'ROLE_USER'
                                ? "text-slate-200"
                                : "text-slate-400 hover:text-red-500"
                            } />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xóa vai trò <strong>{role.name}</strong> sẽ ảnh hưởng đến users có vai trò này.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(role.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading && roles.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t">
            <div className="text-sm text-slate-500">
              Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} trong tổng {totalElements}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="flex items-center px-3 text-sm font-medium">
                Trang {page + 1} / {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <ShadDialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và quyền cho <strong>{editingRole?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên vai trò</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={editingRole?.name === 'ROLE_ADMIN' || editingRole?.name === 'ROLE_USER'}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Mô tả</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-3 border rounded-lg p-4 bg-slate-50 max-h-96 overflow-y-auto">
              <Label>Chọn quyền</Label>
              {Object.entries(permissionsByCategory).map(([category, perms]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b pb-1">
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <div key={perm} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`edit-${perm}`}
                          checked={formData.permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`edit-${perm}`} className="text-xs font-mono">
                          {perm}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <div className="text-xs text-slate-500">
                Đã chọn: {formData.permissions.length} quyền
              </div>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </ShadDialog>
    </div>
  );
};

export default RoleManagement;
