# Hướng Dẫn Cài Đặt MapPicker Component

## 1. Cài đặt Dependencies

Chạy lệnh sau trong thư mục `farmer`:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

Hoặc nếu dùng pnpm:

```bash
pnpm add leaflet react-leaflet
pnpm add -D @types/leaflet
```

## 2. Lấy Goong API Key

1. Truy cập: https://account.goong.io/
2. Đăng ký/Đăng nhập tài khoản
3. Tạo API Key mới (chọn loại "Geocoding API")
4. Copy API Key

## 3. Cấu hình Environment Variable

Mở file `farmer/.env` và thay thế `your_goong_api_key_here` bằng API Key thực:

```env
NEXT_PUBLIC_GOONG_API_KEY=YOUR_ACTUAL_API_KEY
```

## 4. Import CSS Leaflet vào Layout (Nếu cần)

Nếu bản đồ không hiển thị đúng, thêm import CSS vào `farmer/app/layout.tsx`:

```tsx
import 'leaflet/dist/leaflet.css';
```

## 5. Kiểm tra

1. Chạy dev server: `npm run dev`
2. Vào trang "Ruộng Của Bạn"
3. Click "Thêm Ruộng"
4. Bạn sẽ thấy bản đồ thay vì 2 ô input Latitude/Longitude
5. Click vào bản đồ để chọn vị trí
6. Địa chỉ sẽ tự động được lấy từ Goong API

## Cấu trúc File Đã Tạo

```
farmer/
├── components/
│   └── ui/
│       └── MapPicker.tsx          # Component bản đồ chính
├── utils/
│   └── mapUtils.ts                # Utility gọi Goong API
├── app/
│   └── dashboard/
│       └── fields/
│           └── components/
│               └── AddFieldModal.tsx  # Đã cập nhật để dùng MapPicker
└── .env                           # Đã thêm GOONG_API_KEY
```

## Tính năng

- ✅ Click vào bản đồ để chọn vị trí
- ✅ Tự động lấy địa chỉ từ tọa độ (Reverse Geocoding)
- ✅ Hiển thị loading state khi đang gọi API
- ✅ Tự động điền latitude/longitude vào form
- ✅ Responsive design khớp với giao diện hiện tại
- ✅ Sử dụng OpenStreetMap tiles (miễn phí)

## Lưu ý

- Nếu không có GOONG_API_KEY, component vẫn hoạt động nhưng sẽ hiển thị tọa độ thay vì địa chỉ
- Có thể thay OpenStreetMap bằng Goong Map Tiles nếu muốn (cần Map Tiles Key riêng)
- Component sử dụng dynamic import để tránh lỗi SSR với Leaflet
