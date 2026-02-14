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
import { Plus, Pencil, Trash2, RefreshCw, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Permission {
  id: number;
  name: string;
  description: string;
  category: string;
}

const PermissionManagement = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuthStore();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
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

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: ''
  });

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        category: categoryFilter || undefined
      };
      const res = await permissionService.getPermissions(params);

      if (res.data.content) {
        setPermissions(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalItems);
      }
    } catch (error) {
      console.error("Fetch permissions error:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách quyền",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await permissionService.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Fetch categories error:", error);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [page, categoryFilter]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await permissionService.createPermission(formData);
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', category: '' });
      toast({
        title: "Thành công",
        description: "Tạo quyền mới thành công",
        variant: "success",
      });
      fetchPermissions();
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.error || "Lỗi khi tạo quyền";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermission) return;
    try {
      await permissionService.updatePermission(editingPermission.id, formData);
      setEditingPermission(null);
      setFormData({ name: '', description: '', category: '' });
      toast({
        title: "Thành công",
        description: "Cập nhật quyền thành công",
        variant: "success",
      });
      fetchPermissions();
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.error || "Lỗi khi cập nhật quyền";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await permissionService.deletePermission(id);
      toast({
        title: "Thành công",
        description: "Đã xóa quyền",
        variant: "success",
      });
      fetchPermissions();
    } catch (error: any) {
      const message = error.response?.data?.error || "Lỗi khi xóa quyền";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description,
      category: permission.category
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'User Management': 'bg-blue-100 text-blue-700 border-blue-300',
      'Report Management': 'bg-green-100 text-green-700 border-green-300',
      'Order Management': 'bg-purple-100 text-purple-700 border-purple-300',
      'System Management': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý quyền hạn</h2>
          <p className="text-sm text-slate-500">Danh sách và cấu hình các quyền trong hệ thống</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchPermissions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <ShadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} />
                Thêm quyền
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tạo quyền mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin cho quyền hạn mới
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên quyền</Label>
                  <Input
                    id="name"
                    placeholder="user:read"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <p className="text-xs text-slate-500">Định dạng: module:action (vd: user:create)</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Input
                    id="description"
                    placeholder="Cho phép đọc thông tin người dùng"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <Input
                    id="category"
                    placeholder="User Management"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    list="categories"
                    required
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <DialogFooter>
                  <Button type="submit">Lưu</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </ShadDialog>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-3 border rounded-md bg-white w-72">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(0);
            }}
            className="text-sm bg-transparent outline-none py-2 flex-1"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Tên quyền</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Danh mục</TableHead>
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
            ) : permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                  Không tìm thấy quyền nào
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((perm) => (
                <TableRow key={perm.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-slate-400">#{perm.id}</TableCell>
                  <TableCell className="font-mono font-bold text-slate-700">{perm.name}</TableCell>
                  <TableCell className="text-slate-600">{perm.description}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${getCategoryColor(perm.category)}`} variant="outline">
                      {perm.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(perm)}>
                        <Pencil size={16} className="text-slate-400 hover:text-blue-500" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 size={16} className="text-slate-400 hover:text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Xóa quyền <strong>{perm.name}</strong> sẽ ảnh hưởng đến tất cả roles và users có quyền này.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(perm.id)} className="bg-red-600 hover:bg-red-700">
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
        {!loading && permissions.length > 0 && (
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
      <ShadDialog open={!!editingPermission} onOpenChange={(open) => !open && setEditingPermission(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa quyền</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cho <strong>{editingPermission?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tên quyền</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
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
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Danh mục</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                list="edit-categories"
                required
              />
              <datalist id="edit-categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
            <DialogFooter>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </ShadDialog>
    </div>
  );
};

export default PermissionManagement;
