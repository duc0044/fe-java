import { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import type { Order } from '@/services/orderService';
import { useToast } from "@/hooks/use-toast";
import { PermissionGuard } from '@/components/PermissionGuard';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Plus, Pencil, Trash2, RefreshCw, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  // Pagination & Filter
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [totalPages, setTotalPages] = useState(0);

  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    totalAmount: 0,
    status: 'PENDING' as Order['status']
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        status: statusFilter || undefined
      };
      const res = await orderService.getOrders(params);

      // Handle different response formats
      if (res.data.content) {
        // Spring PageResponse format
        setOrders(Array.isArray(res.data.content) ? res.data.content : []);
        setTotalPages(res.data.totalPages || 0);
      } else if (res.data.orders) {
        // Custom format with "orders" key
        setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
        setTotalPages(res.data.totalPages || 1);
      } else if (Array.isArray(res.data)) {
        // Direct array
        setOrders(res.data);
        setTotalPages(1);
      } else {
        // Fallback: set empty array nếu data không đúng format
        console.warn("Unexpected data format:", res.data);
        setOrders([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      setOrders([]); // Đảm bảo orders luôn là array
      setTotalPages(0);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderService.createOrder(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        orderNumber: '',
        customerName: '',
        totalAmount: 0,
        status: 'PENDING'
      });
      toast({
        title: "Thành công",
        description: "Tạo đơn hàng thành công",
      });
      fetchOrders();
    } catch (error: any) {
      const message = error.response?.data?.message || "Lỗi khi tạo đơn hàng";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      await orderService.updateOrder(editingOrder.id, formData);
      setEditingOrder(null);
      setFormData({
        orderNumber: '',
        customerName: '',
        totalAmount: 0,
        status: 'PENDING'
      });
      toast({
        title: "Thành công",
        description: "Cập nhật đơn hàng thành công",
      });
      fetchOrders();
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
      await orderService.deleteOrder(id);
      toast({
        title: "Thành công",
        description: "Đã xóa đơn hàng",
      });
      fetchOrders();
    } catch (error: any) {
      const message = error.response?.data?.message || "Lỗi khi xóa đơn hàng";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await orderService.approveOrder(id);
      toast({
        title: "Thành công",
        description: "Đã phê duyệt đơn hàng",
      });
      fetchOrders();
    } catch (error: any) {
      const message = error.response?.data?.message || "Lỗi khi phê duyệt";
      toast({
        title: "Lỗi",
        description: message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (order: any) => {
    setEditingOrder(order);
    setFormData({
      orderNumber: order.orderNumber || order.order_number || '',
      customerName: order.customerName || order.customer_name || '',
      totalAmount: order.totalAmount || order.amount || 0,
      status: order.status || 'PENDING'
    });
  };

  const getStatusBadge = (status: any) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
      'PENDING': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { variant: 'default', className: 'bg-green-100 text-green-800' },
      'REJECTED': { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      'COMPLETED': { variant: 'default', className: 'bg-blue-100 text-blue-800' },
      'pending': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      'approved': { variant: 'default', className: 'bg-green-100 text-green-800' },
      'rejected': { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      'completed': { variant: 'default', className: 'bg-blue-100 text-blue-800' }
    };

    const statusStr = String(status || 'PENDING').toUpperCase();
    const config = variants[statusStr] || variants['PENDING'];
    const { variant, className } = config;
    return <Badge variant={variant} className={className}>{status || 'PENDING'}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý Đơn hàng</h1>
          <p className="text-slate-500">Quản lý đơn hàng và phê duyệt</p>
        </div>
        <PermissionGuard permission="order:create">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2" size={16} />
            Tạo đơn hàng
          </Button>
        </PermissionGuard>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Lọc theo trạng thái</Label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw size={16} className="mr-2" />
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Mã đơn hàng</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : !Array.isArray(orders) || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  Không có đơn hàng nào
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">#{order.id}</TableCell>
                  <TableCell className="font-bold">{order.orderNumber || order.order_number || 'N/A'}</TableCell>
                  <TableCell>{order.customerName || order.customer_name || 'N/A'}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ${(order.totalAmount || order.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status || 'PENDING')}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {(order.status || 'PENDING') === 'PENDING' && (
                        <PermissionGuard permission="order:approve">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(order.id)}
                            title="Phê duyệt"
                          >
                            <CheckCircle size={16} className="text-green-500" />
                          </Button>
                        </PermissionGuard>
                      )}
                      <PermissionGuard permission="order:update">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(order)}>
                          <Pencil size={16} className="text-blue-500" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="order:delete">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 size={16} className="text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn xóa đơn hàng #{order.orderNumber}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(order.id)}>
                                Xóa
                              </AlertDialogAction>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm">
              Trang {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo đơn hàng mới</DialogTitle>
            <DialogDescription>Nhập thông tin đơn hàng</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Mã đơn hàng</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerName">Khách hàng</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="totalAmount">Tổng tiền</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Tạo đơn hàng</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đơn hàng</DialogTitle>
            <DialogDescription>Cập nhật thông tin đơn hàng</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit-orderNumber">Mã đơn hàng</Label>
              <Input
                id="edit-orderNumber"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-customerName">Khách hàng</Label>
              <Input
                id="edit-customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-totalAmount">Tổng tiền</Label>
              <Input
                id="edit-totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Trạng thái</Label>
              <select
                id="edit-status"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Order['status'] })}
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
