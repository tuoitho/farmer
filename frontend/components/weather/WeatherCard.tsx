/**
 * WeatherCard Component - Hiển thị thông tin thời tiết chi tiết
 */

import { CloudRain, Droplets, Wind } from "lucide-react";
import type { DailyForecast, HourlyForecast } from "@/models/weather";

interface WeatherCardProps {
  dailyForecast: DailyForecast;
  showHourly?: boolean;
}

export default function WeatherCard({ dailyForecast, showHourly = false }: WeatherCardProps) {
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full">
      {/* Daily Summary */}
      <div className="flex flex-col gap-[12px] items-start leading-[normal] text-black w-full">
        <p className="font-['Be_Vietnam_Pro'] font-semibold text-[20px] md:text-[24px] w-full">
          {Math.round(dailyForecast.avg_temp)}° - {dailyForecast.conditions}
        </p>
        
        {/* Weather Details */}
        <div className="flex flex-col gap-[8px] w-full text-[13px] md:text-[15px] font-['Be_Vietnam_Pro']">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-[#2e8623]" />
            <span>Mưa: {dailyForecast.total_rainfall} mm</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#2e8623]" />
            <span>Độ ẩm: {Math.round(dailyForecast.avg_humidity)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#2e8623]">🌡️</span>
            <span>
              {Math.round(dailyForecast.min_temp)}° - {Math.round(dailyForecast.max_temp)}°
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Forecast (Optional) */}
      {showHourly && dailyForecast.hourly && dailyForecast.hourly.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="font-['Be_Vietnam_Pro'] font-semibold text-sm mb-3 text-[#2e8623]">
            Dự báo theo giờ
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {dailyForecast.hourly.slice(0, 8).map((hour, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-1 min-w-[60px] p-2 bg-gray-50 rounded-lg"
              >
                <p className="text-xs font-['Be_Vietnam_Pro'] text-gray-600">
                  {formatTime(hour.time)}
                </p>
                <p className="text-sm font-['Be_Vietnam_Pro'] font-semibold">
                  {Math.round(hour.temp_c)}°
                </p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <CloudRain className="w-3 h-3" />
                  <span>{hour.chance_of_rain}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
