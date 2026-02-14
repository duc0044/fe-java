# 🚀 Development vs Production

## Development Mode (Hot Reload)

Tự động reload khi bạn chỉnh sửa code:

```bash
docker-compose up --build
```

✅ Truy cập: `http://localhost:3000`
✅ Code changes tự động reload
✅ Source maps bật để debug dễ
✅ Node.js 20+ (tự động trong Docker)

## Production Mode (Build Static)

Build optimized và serve static files:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

✅ Truy cập: `http://localhost:3000`
✅ Tối ưu hoá kích thước bundle
✅ Prodction-ready

## Chuyển đổi Mode

### Sang Development
```bash
# Dừng container hiện tại
docker-compose down

# Chạy development mode
docker-compose up --build
```

### Sang Production
```bash
# Dừng container hiện tại
docker-compose down

# Chạy production mode
docker-compose -f docker-compose.prod.yml up --build
```

## Cấu hình

### docker-compose.yml (Development)
- **Port**: 5173 (Vite dev server) → 3000 (localhost)
- **Volumes**: Mounted để hot reload
- **Command**: `npm run dev -- --host`

### docker-compose.prod.yml (Production)
- **Port**: 80 (nginx/serve) → 3000 (localhost)
- **Build**: Vite build + serve static files
- **Restart**: always

## Troubleshooting

### Port đang bị sử dụng
```bash
# Giải phóng port 3000
docker ps
docker stop <container_id>
docker rm <container_id>
```

### Clear Docker cache
```bash
docker system prune -a
docker volume prune
```

### Xem logs
```bash
# Development
docker-compose logs -f

# Production
docker-compose -f docker-compose.prod.yml logs -f
```
