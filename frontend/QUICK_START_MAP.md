# 🗺️ MapPicker - Hướng Dẫn Nhanh

## ✅ Đã Hoàn Thành

- ✅ Cài đặt `leaflet`, `react-leaflet`, `@types/leaflet`
- ✅ Tạo component `MapPicker` 
- ✅ Tích hợp vào `AddFieldModal`
- ✅ Thêm utility `getAddressFromCoords` (Goong API)

## 🚀 Bước Tiếp Theo

### 1. Lấy Goong API Key (BẮT BUỘC)

Truy cập: **https://account.goong.io/**
- Đăng ký/Đăng nhập
- Tạo API Key (chọn "Geocoding API")
- Copy API Key

### 2. Cập nhật file `.env`

Mở `farmer/.env` và thay thế:

```env
NEXT_PUBLIC_GOONG_API_KEY=your_goong_api_key_here
```

Bằng API Key thực của bạn:

```env
NEXT_PUBLIC_GOONG_API_KEY=abcxyz123456...
```

### 3. Chạy thử

```bash
pnpm dev
```

Vào: **Dashboard → Ruộng Của Bạn → Thêm Ruộng**

Bạn sẽ thấy bản đồ thay vì 2 ô input Latitude/Longitude!

## 🎯 Cách Sử dụng

1. Click vào bản đồ để chọn vị trí ruộng
2. Hệ thống tự động:
   - Lấy tọa độ (lat, lng)
   - Gọi Goong API để lấy địa chỉ
   - Điền vào form
3. Nhấn "Xác Nhận" để tạo ruộng

## 📁 Files Đã Tạo/Sửa

```
farmer/
├── components/ui/MapPicker.tsx          ← Component bản đồ
├── utils/mapUtils.ts                    ← Goong API helper
├── app/dashboard/fields/components/
│   └── AddFieldModal.tsx                ← Đã tích hợp MapPicker
└── .env                                 ← Thêm GOONG_API_KEY
```

## 💡 Lưu Ý

- Nếu chưa có API Key, bản đồ vẫn hoạt động nhưng sẽ hiển thị tọa độ thay vì địa chỉ
- Bản đồ sử dụng OpenStreetMap (miễn phí, không cần key)
- Component tự động xử lý SSR (Next.js 16 App Router)
