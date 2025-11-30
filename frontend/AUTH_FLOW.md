# 🔐 Luồng Xác Thực & Xử Lý Token Expired

## Kiến Trúc 2 Lớp Bảo Vệ

### Lớp 1: Middleware (Proactive - Chặn sớm)
**File:** `farmer/middleware.ts`

**Chức năng:**
- Chạy **TRƯỚC** khi trang được render
- Decode JWT để check `exp` (expiry time)
- Tự động refresh token nếu hết hạn
- Redirect về `/signin` nếu không thể refresh

**Luồng xử lý:**
```
User vào /dashboard
  ↓
Middleware chặn lại
  ↓
Decode JWT → Check exp field
  ↓
Token hết hạn? 
  ├─ YES → Gọi API refresh → Cập nhật cookie mới → Cho qua
  └─ NO  → Cho qua luôn
  ↓
Nếu refresh thất bại → Redirect /signin
```

**Ưu điểm:**
- ✅ Không cần gọi API để validate (chỉ decode JWT)
- ✅ Xử lý trước khi render → Tránh flash content
- ✅ Tự động refresh mỗi lần navigate

---

### Lớp 2: Service Layer (Reactive - Xử lý runtime)
**Files:** 
- `farmer/services/fetchWithAuth.ts` (Helper chung)
- `farmer/services/useApiGet.ts`
- `farmer/services/useApiPost.ts`
- `farmer/services/useApiPut.ts`
- `farmer/services/useApiDelete.ts`

**Chức năng:**
- Bắt lỗi **401 Unauthorized** khi gọi API (tất cả HTTP methods)
- Reload trang để trigger Middleware refresh lại

**Khi nào xảy ra:**
- Token hết hạn giữa chừng (sau khi qua Middleware)
- Backend trả về 401 vì lý do khác (token invalid, revoked...)

**Luồng xử lý:**
```
Client gọi API
  ↓
Backend trả về 401
  ↓
Service layer bắt được
  ↓
window.location.reload()
  ↓
Middleware chạy lại → Refresh token → Trang load lại với token mới
```

**Ưu điểm:**
- ✅ Xử lý edge case (token hết hạn giữa session)
- ✅ Không cần user thao tác gì
- ✅ Tự động retry sau khi refresh

---

## So Sánh Với Cách Cũ

| Tiêu chí | Cách Cũ (Layout) | Cách Mới (Middleware) |
|----------|------------------|----------------------|
| **Nơi chạy** | Trong Server Component | Trước khi render |
| **Ghi cookie** | ❌ Không được phép | ✅ Được phép |
| **Performance** | Chậm (gọi API mỗi lần) | Nhanh (chỉ decode JWT) |
| **UX** | Flash content | Mượt mà |
| **Xử lý 401** | ❌ Không có | ✅ Có (GET/POST/PUT/DELETE) |

---

## Test Cases

### ✅ Case 1: Token còn hạn
```
User vào /dashboard
→ Middleware check exp → OK
→ Render trang bình thường
```

### ✅ Case 2: Token hết hạn, có refresh_token
```
User vào /dashboard
→ Middleware check exp → EXPIRED
→ Gọi API refresh → Success
→ Set cookie mới → Render trang
```

### ✅ Case 3: Token hết hạn, không có refresh_token
```
User vào /dashboard
→ Middleware check exp → EXPIRED
→ Không có refresh_token
→ Redirect /signin
```

### ✅ Case 4: Token hết hạn giữa chừng (đang dùng app)
```
User đang ở /dashboard
→ Click button gọi API
→ Backend trả 401
→ Service layer reload trang
→ Middleware refresh token
→ Trang load lại với token mới
```

### ✅ Case 5: Refresh token cũng hết hạn
```
User vào /dashboard
→ Middleware gọi refresh API → FAILED
→ Redirect /signin
```

---

## Lưu Ý Quan Trọng

1. **JWT Structure:** Backend phải trả JWT có field `exp` (Unix timestamp)
2. **Cookie Settings:** `httpOnly: true` để bảo mật
3. **Environment:** Đảm bảo `NEXT_PUBLIC_API_URL` đúng
4. **Matcher:** Middleware chỉ chạy trên `/dashboard/*` (config ở cuối file)

---

## Debug Tips

### Kiểm tra JWT payload:
```javascript
// Paste vào browser console
const token = 'your_jwt_token_here';
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expiry:', new Date(payload.exp * 1000));
console.log('Now:', new Date());
```

### Xem log Middleware:
- Mở DevTools → Console
- Tìm các log bắt đầu bằng `🔄`, `✅`, `❌`

### Force test expired token:
- Xóa cookie `token` trong DevTools → Application → Cookies
- Giữ lại `refresh_token`
- Reload trang → Middleware sẽ tự động refresh
