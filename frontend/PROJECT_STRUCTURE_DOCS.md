# Tài Liệu Cấu Trúc Dự Án Farmer

## 📋 Tổng Quan
Dự án Farmer được xây dựng trên nền tảng Next.js với TypeScript, theo kiến trúc rõ ràng và phân tách theo chức năng. Dưới đây là tài liệu chi tiết về từng thư mục và công dụng của chúng.

---

## 📁 Thư Mục `action/`
**Công dụng:** Chứa các action/hành động chính của ứng dụng, xử lý logic nghiệp vụ cốt lõi

### 📄 Các file chính:
- **`ai.ts`** - Các action liên quan đến AI, xử lý tương tác với AI service
- **`auth.ts`** - Action xác thực người dùng (login, logout, refresh token)
- **`farm.ts`** - Action quản lý trang trại (tạo, cập nhật thông tin nông trại)
- **`utils.ts`** - Các utility functions hỗ trợ cho action

### 🎯 Mục đích:
- Tách biệt logic nghiệp vụ khỏi UI components
- Dễ dàng tái sử dụng và test
- Giữ cho code clean và maintainable

---

## 📁 Thư Mục `app/`
**Công dụng:** Chứa cấu trúc ứng dụng Next.js App Router, bao gồm pages, layouts và routes

### 📂 Cấu trúc:
- **`(auth)/`** - Route group cho các trang xác thực
  - `signin/` - Trang đăng nhập
  - `signup/` - Trang đăng ký
  - `layout.tsx` - Layout chung cho auth pages
- **`dashboard/`** - Trang dashboard chính sau khi đăng nhập
  - `doctor/` - Tư vấn nông nghiệp
  - `fields/` - Quản lý cánh đồng
  - `notifications/` - Quản lý thông báo
- **`globals.css`** - Global styles
- **`layout.tsx`** - Root layout của ứng dụng
- **`page.tsx`** - Trang chủ

### 🎯 Mục đích:
- Định nghĩa routing và navigation
- Quản lý layout chung
- Tổ chức các trang theo chức năng

---

## 📁 Thư Mục `common/`
**Công dụng:** Chứa các cấu hình và constants dùng chung cho toàn ứng dụng

### 📂 Cấu trúc:
- **`config/`** - Cấu hình ứng dụng
  - `api.ts` - Cấu hình API endpoints
  - `default.ts` - Default configurations
  - `index.ts` - Export các config

### 🎯 Mục đích:
- Centralized configuration
- Dễ dàng quản lý và thay đổi settings
- Reusable constants

---

## 📁 Thư Mục `hooks/`
**Công dụng:** Chứa các custom React hooks (hiện tại đang trống, chuẩn bị cho phát triển)

### 🎯 Mục đích:
- Tạo reusable logic cho React components
- Tách biệt logic khỏi UI
- Tăng khả năng test và maintain

---

## 📁 Thư Mục `models/`
**Công dụng:** Định nghĩa các interfaces, types và models dữ liệu

### 📂 Cấu trúc:
- **`ai/`** - Types và interfaces cho AI service
- **`auth/`** - Types cho authentication (user, token, etc.)
- **`farm/`** - Types cho farm management (farm, field, crop)
- **`global/`** - Global types và interfaces
- **`index.ts`** - Export tất cả models

### 🎯 Mục đích:
- Type safety cho toàn ứng dụng
- Định nghĩa cấu trúc dữ liệu
- Documentation cho data structures

---

## 📁 Thư Mục `services/`
**Công dụng:** Chứa các service layer để giao tiếp với external APIs và xử lý data

### 📂 Cấu trúc:
- **`ai/`** - Service cho AI interactions
- **`auth/`** - Service cho authentication
- **`farm/`** - Service cho farm management
- **`notification/`** - Service cho notifications
- **`weather/`** - Service cho weather data
- **`useApiGet.ts`** - Custom hook cho GET requests
- **`useApiPost.ts`** - Custom hook cho POST requests
- **`useApiPut.ts`** - Custom hook cho PUT requests
- **`useApiDelete.ts`** - Custom hook cho DELETE requests

### 🎯 Mục đích:
- Tách biệt API logic khỏi components
- Centralized API calls
- Error handling và response processing
- Reusable API utilities

---

## 📁 Thư Mục `utils/`
**Công dụng:** Chứa các utility functions và helper functions

### 📄 Các file chính:
- **`clientAuth.ts`** - Utilities cho client-side authentication
- **`funcUtils.ts`** - General utility functions

### 🎯 Mục đích:
- Cung cấp các functions tiện ích
- Code reuse across application
- Helper functions cho common tasks

---

## 🔄 Luồng Hoạt Động

### 1. Authentication Flow:
```
User Input → app/(auth)/signin → action/auth.ts → services/auth/ → API
```

### 2. Farm Management Flow:
```
Dashboard → action/farm.ts → services/farm/ → API → models/farm/
```

### 3. AI Interaction Flow:
```
User Query → action/ai.ts → services/ai/ → AI API → models/ai/
```

---

## 🎨 Quy ước Coding

### File Naming:
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Actions: `camelCase.ts`
- Services: `camelCase.ts`

### Import Order:
1. React/Next.js imports
2. External libraries
3. Internal imports (models, services, actions, utils)

### Type Definitions:
- Sử dụng TypeScript interfaces cho objects
- Sử dụng type aliases cho union types
- Export types từ `models/` directory

---

## 📝 Ghi Chú Phát Triển

### Best Practices:
1. **Separation of Concerns**: Mỗi thư mục có trách nhiệm rõ ràng
2. **Type Safety**: Luôn định nghĩa types trong `models/`
3. **Reusable Logic**: Sử dụng hooks và utilities
4. **Error Handling**: Centralized trong services layer
5. **Testing**: Structure hỗ trợ unit testing

### Future Enhancements:
- `hooks/` sẽ chứa các custom hooks
- `components/` sẽ chứa reusable UI components
- Thêm `tests/` directory cho unit tests
- Thêm `docs/` cho documentation chi tiết

---

## 🤝 Hướng Dẫn Cho Thành Viên

### Khi thêm feature mới:
1. Định nghĩa types trong `models/`
2. Tạo service trong `services/`
3. Tạo action trong `action/`
4. Tạo page/component trong `app/`
5. Thêm utilities nếu cần trong `utils/`

### Khi sửa bug:
1. Kiểm tra flow từ UI → Action → Service → API
2. Xem xét types trong `models/`
3. Test với utilities trong `utils/`

### Khi review code:
1. Kiểm tra type safety
2. Đảm bảo separation of concerns
3. Verify error handling
4. Check code conventions

---

*Document last updated: $(date)*
*Generated for Farmer Development Team*
