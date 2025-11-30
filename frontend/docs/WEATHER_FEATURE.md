# Weather Feature Documentation

## Tổng Quan
Tính năng Weather cho phép người dùng xem dự báo thời tiết 5 ngày cho các ruộng của họ.

## Cấu Trúc Files

### Models
- `farmer/models/weather.ts` - TypeScript interfaces cho weather data

### Services
- `farmer/services/weatherService.ts` - Service layer gọi Backend API (Backend gọi OpenWeatherMap)

### Actions
- `farmer/action/weatherAction.ts` - Server Actions xử lý authentication
- `farmer/action/farm.ts` - Thêm `getFarmsAction()` để lấy danh sách farms

### UI
- `farmer/app/dashboard/weather/page.tsx` - Weather page component
- `farmer/components/weather/WeatherCard.tsx` - Reusable weather card component

## API Endpoints

### 1. Get Weather by Coordinates
```
POST /api/weather/forecast
Body: { latitude: number, longitude: number }
```

### 2. Get Weather by Farm ID
```
GET /api/weather/farm/:farmId
```

## Cách Sử Dụng

### Trong Client Component
```typescript
import { getWeatherByFarmAction } from "@/action/weatherAction";

const result = await getWeatherByFarmAction(farmId);
if (result.success && result.data) {
  // Use weather data
}
```

### Trong Server Component
```typescript
import { getWeatherByFarm } from "@/services/weatherService";
import { cookies } from "next/headers";

const cookieStore = await cookies();
const token = cookieStore.get("access_token")?.value;
const weather = await getWeatherByFarm(farmId, token);
```

## Features
- ✅ Dropdown chọn ruộng
- ✅ Dự báo 5 ngày
- ✅ Navigation giữa các ngày
- ✅ Hiển thị nhiệt độ, độ ẩm, lượng mưa
- ✅ Cảnh báo thời tiết (weather alerts)
- ✅ Responsive design
- ✅ Authentication qua HTTP-only cookies
