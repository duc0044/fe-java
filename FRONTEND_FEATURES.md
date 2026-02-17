# Frontend Features - Hướng dẫn Sử dụng

## 🎨 Tính năng mới đã thêm

### 1. **Avatar Management** (Quản lý Avatar)

#### Tính năng:
- ✅ Hiển thị avatar trong danh sách người dùng
- ✅ Upload avatar cho từng user (max 10MB)
- ✅ Xóa avatar
- ✅ Preview avatar trước khi upload
- ✅ Fallback hiển thị chữ cái đầu nếu không có avatar
- ✅ Default avatar tự động theo role (Admin/User)

#### Cách sử dụng:
1. Vào **Admin Panel** → **Người dùng**
2. Click icon **Upload** (↑) ở cột "Thao tác"
3. Chọn file ảnh (PNG, JPG, JPEG...) - tối đa 10MB
4. Click **Upload** để lưu
5. Click **Xóa avatar** để xóa avatar hiện tại

#### Quyền cần thiết:
- `user:update` - Để upload/xóa avatar

#### API Endpoints:
```typescript
// Upload avatar
POST /api/users/{id}/avatar
Content-Type: multipart/form-data
Authorization: Bearer <token>

// Delete avatar
DELETE /api/users/{id}/avatar
Authorization: Bearer <token>

// Get avatar (tự động qua URL)
GET /api/files/download?path=avatars/user-{id}/filename.jpg
```

---

### 2. **Order Management** (Quản lý Đơn hàng)

#### Tính năng:
- ✅ Danh sách đơn hàng với pagination
- ✅ Tạo đơn hàng mới
- ✅ Cập nhật thông tin đơn hàng
- ✅ Xóa đơn hàng
- ✅ Phê duyệt đơn hàng (Approve)
- ✅ Lọc theo trạng thái (PENDING, APPROVED, REJECTED, COMPLETED)
- ✅ Hiển thị trạng thái với color-coded badges

#### Cách sử dụng:
1. Vào **Admin Panel** → **Đơn hàng**
2. Click **Tạo đơn hàng** để tạo mới
3. Nhập thông tin: Mã đơn, Khách hàng, Tổng tiền
4. Click icon ✓ để phê duyệt đơn hàng PENDING
5. Click icon ✏️ để chỉnh sửa
6. Click icon 🗑️ để xóa

#### Quyền cần thiết:
- `order:read` - Xem danh sách đơn hàng
- `order:create` - Tạo đơn hàng mới
- `order:update` - Cập nhật đơn hàng
- `order:delete` - Xóa đơn hàng
- `order:approve` - Phê duyệt đơn hàng

#### API Endpoints:
```typescript
// Get orders with pagination
GET /api/orders?page=0&size=10&status=PENDING

// Create order
POST /api/orders
Body: { orderNumber, customerName, totalAmount }

// Update order
PUT /api/orders/{id}
Body: { orderNumber, customerName, totalAmount, status }

// Delete order
DELETE /api/orders/{id}

// Approve order
POST /api/orders/{id}/approve
```

#### Status Flow:
```
PENDING → APPROVED → COMPLETED
   ↓
REJECTED
```

---

### 3. **File Upload Service** (Dịch vụ Upload File)

#### API Service:
```typescript
import { fileService } from '@/services/fileService';

// Upload file
const response = await fileService.uploadFile(file, 'folder-name');

// Download file
const blob = await fileService.downloadFile('path/to/file.jpg');

// Delete file
await fileService.deleteFile('path/to/file.jpg');

// Get file URL
const url = fileService.getFileUrl('path/to/file.jpg');
```

#### Tính năng:
- Upload file lên MinIO
- Tổ chức file theo folder
- Download file
- Xóa file
- Hỗ trợ mọi loại file

---

## 📱 Navigation Updates

### Admin Menu (Sidebar):
```
📊 Dashboard
👥 Người dùng
🛒 Đơn hàng          ← MỚI
🛡️ Vai trò
🔑 Quyền hạn
⚙️ Cài đặt
```

### Routes:
```
/admin/dashboard     - Tổng quan
/admin/users         - Quản lý người dùng & Avatar
/admin/orders        - Quản lý đơn hàng ← MỚI
/admin/roles         - Quản lý vai trò
/admin/permissions   - Quản lý quyền hạn
/admin/settings      - Cài đặt
```

---

## 🔐 Permission Guard

Tất cả các tính năng đều được bảo vệ bởi **PermissionGuard**:

```tsx
<PermissionGuard permission="order:create">
  <Button>Tạo đơn hàng</Button>
</PermissionGuard>
```

Nếu user không có quyền → Component sẽ bị ẩn.

---

## 🚀 Development Server

```bash
cd fe-java
npm install
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

API Gateway: **http://localhost:8080**

---

## 🎯 Testing Checklist

### Avatar Feature:
- [ ] Upload avatar cho user thành công
- [ ] Xóa avatar hoạt động
- [ ] Avatar hiển thị đúng trong table
- [ ] Preview avatar trước khi upload
- [ ] Validation file size 10MB
- [ ] Default avatar theo role (Admin/User)
- [ ] Permission guard: chỉ user:update mới thấy upload button

### Order Management:
- [ ] Danh sách đơn hàng hiển thị đúng
- [ ] Tạo đơn hàng mới thành công
- [ ] Cập nhật đơn hàng hoạt động
- [ ] Xóa đơn hàng hoạt động
- [ ] Approve đơn hàng (PENDING → APPROVED)
- [ ] Filter theo status hoạt động
- [ ] Pagination hoạt động
- [ ] Permission guard: các button ẩn/hiện đúng theo quyền

### Navigation:
- [ ] Menu "Đơn hàng" xuất hiện trong sidebar
- [ ] Route /admin/orders hoạt động
- [ ] Permission guard: user không có quyền order:read không thấy menu

---

## 🔧 Environment Variables

Đảm bảo file `.env` có:

```env
VITE_API_URL=http://localhost:8080
```

---

## 📦 Services Created

### 1. **authService.ts** (Updated)
- `uploadAvatar(userId, file)` - Upload avatar
- `deleteAvatar(userId)` - Xóa avatar
- `getAvatarUrl(avatarUrl)` - Get avatar URL

### 2. **fileService.ts** (NEW)
- `uploadFile(file, folder)` - Upload file chung
- `downloadFile(path)` - Download file
- `deleteFile(path)` - Xóa file
- `getFileUrl(path)` - Get file URL

### 3. **orderService.ts** (NEW)
- `getOrders(params)` - Lấy danh sách orders
- `createOrder(data)` - Tạo order mới
- `updateOrder(id, data)` - Cập nhật order
- `deleteOrder(id)` - Xóa order
- `approveOrder(id)` - Phê duyệt order

---

## 🎨 UI Components Used

- **shadcn/ui**:
  - Table, Card, Button, Input, Label
  - Dialog, AlertDialog
  - Badge (for status indicators)
  - Toast notifications

- **lucide-react** icons:
  - Upload, Pencil, Trash2, CheckCircle
  - ShoppingCart (Orders menu)
  - Plus, RefreshCw, ChevronLeft, ChevronRight

---

## 🐛 Troubleshooting

### Avatar không hiển thị:
1. Kiểm tra MinIO container đang chạy
2. Kiểm tra file-service đang chạy (port 8083)
3. Check network tab trong browser DevTools
4. Verify avatarUrl trong user object

### Orders không load:
1. Kiểm tra order-service đang chạy (port 8082)
2. Check JWT token còn hạn
3. Verify permissions của user (order:read)
4. Check API Gateway routing (/api/orders → order-service)

### Permission issues:
1. Login lại để refresh JWT token
2. Kiểm tra roles và permissions trong user profile
3. ROLE_ADMIN tự động có tất cả quyền

---

## 📚 Documentation Links

- [AVATAR_GUIDE.md](../java/AVATAR_GUIDE.md) - Backend avatar implementation
- [README.md](../java/README.md) - Backend API documentation
- Component source: `fe-java/src/pages/`

---

**Created**: $(date)  
**Author**: System  
**Version**: 1.0.0
