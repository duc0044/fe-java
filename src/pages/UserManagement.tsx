import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from '@/components/PermissionGuard';
import { AuthenticatedImage } from '@/components/AuthenticatedImage';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
} from "@/components/ui/card";
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
import { UserPlus, Pencil, Trash2, RefreshCw, Search, ChevronLeft, ChevronRight, Filter, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl?: string;
    roles?: string[];
    permissions?: string[];
}

const PERMISSION_CATEGORIES = {
    'User Management': ['user:read', 'user:create', 'user:update', 'user:delete'],
    'Report Management': ['report:read', 'report:create', 'report:update', 'report:delete', 'report:export'],
    'Order Management': ['order:read', 'order:create', 'order:update', 'order:delete', 'order:approve'],
    'System Management': ['audit:read', 'system:config', 'role:manage']
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const { toast } = useToast();

    // Pagination & Filter state
    const [page, setPage] = useState(0);
    const [pageSize] = useState(5);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roles: ['ROLE_USER'],
        permissions: [] as string[]
    });
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Avatar upload state
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [selectedAvatarUser, setSelectedAvatarUser] = useState<User | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const fetchProfile = async () => {
        try {
            const res = await authService.getProfile();
            setCurrentUser(res.data);
        } catch (error) {
            console.error("Fetch profile error:", error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: pageSize,
                search: search || undefined,
                role: roleFilter || undefined
            };
            const res = await authService.getUsers(params);
            console.log("Dữ liệu người dùng nhận được từ API:", res.data);

            // Xử lý cả định dạng mảng (cũ) và PageResponse (mới)
            if (res.data.content) {
                setUsers(res.data.content);
                setTotalPages(res.data.totalPages);
                setTotalElements(res.data.totalElements);
            } else {
                setUsers(res.data);
                setTotalPages(1);
                setTotalElements(res.data.length);
            }
        } catch (error) {
            console.error("Fetch users error:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách người dùng",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, pageSize, roleFilter]); // Tự động fetch khi đổi trang hoặc filter

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchUsers();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.createUser({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                roles: formData.roles,
                permissions: formData.permissions.length > 0 ? formData.permissions : null
            });
            setIsCreateDialogOpen(false);
            setFormData({ username: '', email: '', password: '', roles: ['ROLE_USER'], permissions: [] });
            toast({
                title: "Thành công",
                description: "Tạo người dùng thành công",
                variant: "success",
            });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || "Lỗi khi tạo người dùng";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            await authService.updateUser(editingUser.id, {
                username: formData.username,
                email: formData.email,
                roles: formData.roles,
                permissions: formData.permissions.length > 0 ? formData.permissions : null
            });
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', roles: ['ROLE_USER'], permissions: [] });
            toast({
                title: "Thành công",
                description: "Cập nhật thông tin thành công",
                variant: "success",
            });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || "Lỗi khi cập nhật";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await authService.deleteUser(id);
            toast({
                title: "Thành công",
                description: "Đã xóa người dùng",
                variant: "success",
            });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || "Lỗi khi xóa người dùng";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile || !selectedAvatarUser) return;

        setUploadingAvatar(true);
        try {
            await authService.uploadAvatar(selectedAvatarUser.id, avatarFile);
            toast({
                title: "Thành công",
                description: "Đã cập nhật avatar",
                variant: "success",
            });
            setSelectedAvatarUser(null);
            setAvatarFile(null);
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || "Lỗi khi upload avatar";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleDeleteAvatar = async (userId: number) => {
        try {
            await authService.deleteAvatar(userId);
            toast({
                title: "Thành công",
                description: "Đã xóa avatar",
                variant: "success",
            });
            fetchUsers();
        } catch (error: any) {
            const message = error.response?.data?.message || "Lỗi khi xóa avatar";
            toast({
                title: "Lỗi",
                description: message,
                variant: "destructive",
            });
        }
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            roles: user.roles || ['ROLE_USER'],
            permissions: user.permissions || []
        });
    };

    const isCurrentUserAdmin = currentUser?.roles && (Array.isArray(currentUser.roles)
        ? currentUser.roles.includes('ROLE_ADMIN')
        : currentUser.roles === 'ROLE_ADMIN'
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
                    <p className="text-sm text-slate-500">Danh sách và phân quyền người dùng trong hệ thống</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>

                    <PermissionGuard permission="user:create">
                        <ShadDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <UserPlus size={18} />
                                    Thêm người dùng
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Tạo người dùng mới</DialogTitle>
                                    <DialogDescription>
                                        Nhập thông tin chi tiết cho tài khoản mới tại đây.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Tên người dùng</Label>
                                        <Input id="name" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Mật khẩu</Label>
                                        <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Vai trò</Label>
                                        <select
                                            id="role"
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={formData.roles[0] || 'ROLE_USER'}
                                            onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                                        >
                                            <option value="ROLE_USER">Người dùng (USER)</option>
                                            <option value="ROLE_STAFF">Nhân viên (STAFF)</option>
                                            <option value="ROLE_MANAGER">Quản lý (MANAGER)</option>
                                            <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
                                        </select>
                                    </div>
                                    {isCurrentUserAdmin && !['ROLE_USER', 'ROLE_ADMIN'].includes(formData.roles[0]) && (
                                        <div className="grid gap-3 max-h-96 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                                            <Label className="text-base font-semibold">Quyền hạn bổ sung (tùy chọn)</Label>
                                            {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                                                <div key={category} className="space-y-2">
                                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b pb-1">{category}</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {permissions.map((perm) => (
                                                            <div key={perm} className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`new-perm-${perm}`}
                                                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                                    checked={formData.permissions.includes(perm)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                                                                        } else {
                                                                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`new-perm-${perm}`}
                                                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                                >
                                                                    {perm}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <p className="text-[10px] text-slate-500 mt-2 italic">
                                                Chọn các quyền hạn bổ sung ngoài quyền mặc định của role. ROLE_ADMIN tự động có tất cả quyền.
                                            </p>
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <Button type="submit">Lưu thay đổi</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </ShadDialog>
                    </PermissionGuard>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-2">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit" variant="secondary">Tìm kiếm</Button>
                </form>

                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 border rounded-md bg-white">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPage(0);
                            }}
                            className="text-sm bg-transparent outline-none py-2"
                        >
                            <option value="">Tất cả vai trò</option>
                            <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
                            <option value="ROLE_MANAGER">Quản lý (MANAGER)</option>
                            <option value="ROLE_STAFF">Nhân viên (STAFF)</option>
                            <option value="ROLE_USER">Người dùng (USER)</option>
                        </select>
                    </div>
                </div>
            </div>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[80px]">ID</TableHead>
                            <TableHead className="w-[80px]">Avatar</TableHead>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Vai trò & Quyền</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow key="loading">
                                <TableCell colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow key="empty">
                                <TableCell colSpan={6} className="text-center py-10 text-slate-400 font-medium">
                                    Không tìm thấy người dùng nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user, idx) => (
                                <TableRow key={`user-row-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell className="font-mono font-bold text-slate-400">#{user.id}</TableCell>
                                    <TableCell>
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                                            {user.avatarUrl ? (
                                                <AuthenticatedImage
                                                    src={authService.getAvatarUrl(user.avatarUrl) || undefined}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-slate-500 font-semibold text-sm">
                                                    {(user.username || 'U').charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-700">{user.username || (user as any).userName || "N/A"}</TableCell>
                                    <TableCell className="text-slate-500 font-medium">{user.email || (user as any).userEmail || "N/A"}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex gap-1">
                                                {(() => {
                                                    const rolesArray = Array.isArray(user.roles)
                                                        ? user.roles
                                                        : (typeof user.roles === 'string' ? [user.roles] : []);

                                                    return rolesArray.length > 0 ? (
                                                        rolesArray.map((role, rIdx) => {
                                                            let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
                                                            let className = "text-[10px]";
                                                            if (role === 'ROLE_ADMIN') {
                                                                variant = "destructive";
                                                            } else if (role === 'ROLE_MANAGER') {
                                                                variant = "default";
                                                                className = "text-[10px] bg-purple-600 hover:bg-purple-700";
                                                            } else if (role === 'ROLE_STAFF') {
                                                                variant = "default";
                                                            }

                                                            return (
                                                                <Badge key={`${role}-${rIdx}`} variant={variant} className={className}>
                                                                    {role}
                                                                </Badge>
                                                            );
                                                        })
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px]">ROLE_USER</Badge>
                                                    );
                                                })()}
                                            </div>
                                            {user.permissions && user.permissions.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {user.permissions.map((perm, pIdx) => (
                                                        <Badge key={`perm-${pIdx}`} variant="outline" className="text-[9px] font-mono bg-blue-50 text-blue-700 border-blue-200">
                                                            {perm}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <PermissionGuard permission="user:update">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                                                    <Pencil size={16} className="text-slate-400 group-hover:text-blue-500" />
                                                </Button>
                                            </PermissionGuard>

                                            <PermissionGuard permission="user:update">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedAvatarUser(user)}
                                                    title="Upload avatar"
                                                >
                                                    <Upload size={16} className="text-slate-400 group-hover:text-green-500" />
                                                </Button>
                                            </PermissionGuard>

                                            <PermissionGuard permission="user:delete">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={user.id === currentUser?.id}
                                                            title={user.id === currentUser?.id ? "Bạn không thể tự xóa chính mình" : ""}
                                                        >
                                                            <Trash2 size={16} className={user.id === currentUser?.id ? "text-slate-200" : "text-slate-400 group-hover:text-red-500"} />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Hành động này không thể hoàn tác. Tài khoản <strong>{user.username}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(user.id)} className="bg-red-600 hover:bg-red-700">Xác nhận xóa</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </PermissionGuard>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                {!loading && users.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
                        <div className="text-sm text-slate-500">
                            Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalElements)} trong tổng số {totalElements}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="gap-1 px-3"
                            >
                                <ChevronLeft size={16} />
                                Trước
                            </Button>
                            <div className="flex items-center px-3 text-sm font-medium text-slate-600">
                                Trang {page + 1} / {totalPages || 1}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= totalPages - 1}
                                className="gap-1 px-3"
                            >
                                Sau
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Edit Dialog */}
            <ShadDialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin và quyền hạn cho <strong>{editingUser?.username}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Tên người dùng</Label>
                            <Input id="edit-name" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Vai trò</Label>
                            <select
                                id="edit-role"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.roles[0] || 'ROLE_USER'}
                                onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })}
                            >
                                <option value="ROLE_USER">Người dùng (USER)</option>
                                <option value="ROLE_STAFF">Nhân viên (STAFF)</option>
                                <option value="ROLE_MANAGER">Quản lý (MANAGER)</option>
                                <option value="ROLE_ADMIN">Quản trị viên (ADMIN)</option>
                            </select>
                        </div>
                        {isCurrentUserAdmin && !['ROLE_USER', 'ROLE_ADMIN'].includes(formData.roles[0]) && (
                            <div className="grid gap-3 max-h-96 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                                <Label className="text-base font-semibold">Quyền hạn bổ sung (tùy chọn)</Label>
                                {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
                                    <div key={category} className="space-y-2">
                                        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide border-b pb-1">{category}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {permissions.map((perm) => (
                                                <div key={perm} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`edit-perm-${perm}`}
                                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={formData.permissions.includes(perm)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setFormData({ ...formData, permissions: [...formData.permissions, perm] });
                                                            } else {
                                                                setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm) });
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`edit-perm-${perm}`}
                                                        className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {perm}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                <p className="text-[10px] text-slate-500 mt-2 italic">
                                    Chọn các quyền hạn bổ sung ngoài quyền mặc định của role. ROLE_ADMIN tự động có tất cả quyền.
                                </p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="submit">Cập nhật</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </ShadDialog>

            {/* Avatar Upload Dialog */}
            <ShadDialog open={!!selectedAvatarUser} onOpenChange={(open) => {
                if (!open) {
                    setSelectedAvatarUser(null);
                    setAvatarFile(null);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Avatar - {selectedAvatarUser?.username}</DialogTitle>
                        <DialogDescription>
                            Chọn ảnh avatar cho người dùng (tối đa 10MB)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Current Avatar Preview */}
                        {selectedAvatarUser?.avatarUrl && (
                            <div className="flex flex-col items-center gap-2">
                                <Label>Avatar hiện tại:</Label>
                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200">
                                    <AuthenticatedImage
                                        src={authService.getAvatarUrl(selectedAvatarUser.avatarUrl) || undefined}
                                        alt={selectedAvatarUser.username}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (selectedAvatarUser) {
                                            handleDeleteAvatar(selectedAvatarUser.id);
                                            setSelectedAvatarUser(null);
                                        }
                                    }}
                                >
                                    <X size={14} className="mr-1" /> Xóa avatar
                                </Button>
                            </div>
                        )}

                        {/* File Input */}
                        <div>
                            <Label htmlFor="avatar-file">Chọn ảnh mới:</Label>
                            <Input
                                id="avatar-file"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 10 * 1024 * 1024) {
                                            toast({
                                                title: "Lỗi",
                                                description: "File không được vượt quá 10MB",
                                                variant: "destructive",
                                            });
                                            return;
                                        }
                                        setAvatarFile(file);
                                    }
                                }}
                                className="mt-1"
                            />
                        </div>

                        {/* Preview New Avatar */}
                        {avatarFile && (
                            <div className="flex flex-col items-center gap-2">
                                <Label>Xem trước:</Label>
                                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200">
                                    <img
                                        src={URL.createObjectURL(avatarFile)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleAvatarUpload}
                            disabled={!avatarFile || uploadingAvatar}
                        >
                            {uploadingAvatar ? "Đang upload..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </ShadDialog>
        </div>
    );
};

export default UserManagement;
