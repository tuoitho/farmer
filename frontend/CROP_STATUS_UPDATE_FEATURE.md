# Tính Năng Cập Nhật Trạng Thái Cây Trồng

## Tổng Quan
Tính năng cho phép người dùng cập nhật trạng thái cây trồng của ruộng thông qua giao diện dropdown với các trạng thái được định nghĩa sẵn.

## Các File Đã Triển Khai

### 1. Models (`farmer/models/farm/index.ts`)
- **TUpdateCropStatusRequest**: Interface cho request update crop status
- **CropStatus**: Type union cho các trạng thái cây trồng
- **CROP_STATUS_LABELS**: Mapping từ status code sang label tiếng Việt

**Các trạng thái hỗ trợ (theo backend):**
- `preparing` - Chuẩn bị
- `planted` - Đã trồng
- `growing` - Đang phát triển
- `flowering` - Ra hoa
- `harvested` - Đã thu hoạch
- `fallow` - Bỏ hoang

### 2. Server Action (`farmer/action/farm.ts`)
- **updateCropStatusAction**: Server action xử lý update crop status
  - Input: `farmId` (string), `cropStatus` (string)
  - Output: `{ success: boolean; error?: string; data?: TFarm }`
  - Xử lý auth thông qua cookies (server-side)
  - Error handling với thông báo tiếng Việt

### 3. UI Component (`farmer/app/dashboard/fields/[id]/components/CropStatusSelector.tsx`)
- Dropdown selector với các tính năng:
  - Hiển thị trạng thái hiện tại với màu sắc phù hợp
  - Dropdown menu với tất cả các trạng thái
  - Loading state khi đang cập nhật
  - Toast notification khi thành công/thất bại
  - Auto-close dropdown sau khi chọn
  - Responsive design

**Màu sắc theo trạng thái:**
- Xám: `fallow` (Bỏ hoang)
- Xanh lá: `harvested` (Đã thu hoạch)
- Xanh dương: `flowering`, `growing` (Đang phát triển)
- Vàng: `preparing`, `planted` (Chuẩn bị/Đã trồng)

### 4. Integration (`farmer/app/dashboard/fields/[id]/FieldDetailClient.tsx`)
- Thay thế input text cũ bằng CropStatusSelector
- State management với `currentFarm` để cập nhật UI real-time
- Callback `handleStatusUpdated` để sync state sau khi update

## Luồng Hoạt Động

1. User click vào trạng thái hiện tại → Dropdown mở
2. User chọn trạng thái mới → Loading state
3. Server Action gọi API backend với auth từ cookies
4. Backend xử lý và trả về kết quả
5. Frontend cập nhật UI + hiển thị toast notification
6. Dropdown đóng tự động

## API Endpoint
```
PUT /api/v1/farms/:farmId/status?crop_status=growing
Body: {} (empty body, crop_status is passed as query parameter)
```

**Important:** Backend expects `crop_status` as a **query parameter**, not in the request body.

## Testing
1. Mở trang chi tiết ruộng: `/dashboard/fields/[id]`
2. Click vào dropdown trạng thái
3. Chọn trạng thái mới
4. Kiểm tra toast notification
5. Verify trạng thái đã được cập nhật

## Notes
- Service layer (`farmer/services/farm/index.ts`) đã có sẵn `updateCropStatus` method
- API endpoint đã được define trong `farmer/common/config/api.ts`
- Auth được xử lý tự động qua `fetchJsonWithAuth` và `getTokenUser()`
