"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { ChevronLeft, ChevronRight, CloudRain, Droplets } from "lucide-react";
import { getWeatherByFarmAction } from "@/action/weatherAction";
import { getFarmsAction } from "@/action/farm";
import type { WeatherForecast } from "@/models/weather";
import type { TFarm } from "@/models/farm";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// Dynamically import WeatherMap to avoid SSR issues with Leaflet
const WeatherMap = dynamic(() => import("@/components/weather/WeatherMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg" />
});

export default function WeatherPage() {
  const [farms, setFarms] = useState<TFarm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<TFarm | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCardVisible, setIsCardVisible] = useState(false);

  // Fetch farms on mount
  useEffect(() => {
    async function loadFarms() {
      try {
        const result = await getFarmsAction();
        console.log("Farms result:", result);

        if (result.success && result.data) {
          setFarms(result.data);

          // Auto-select first farm
          if (result.data.length > 0) {
            setSelectedFarm(result.data[0]);
          }
        } else {
          toast.error(result.error || "Không thể tải danh sách ruộng");
        }
      } catch (error) {
        console.error("Error loading farms:", error);
        toast.error("Không thể tải danh sách ruộng");
      } finally {
        setLoading(false);
      }
    }
    loadFarms();
  }, []);

  // Fetch weather when farm is selected
  useEffect(() => {
    if (!selectedFarm?.id) return;

    async function loadWeather() {
      setLoading(true);
      try {
        const result = await getWeatherByFarmAction(selectedFarm!.id);

        if (result.success && result.data) {
          setWeather(result.data);
        } else {
          toast.error(result.error || "Không thể tải dữ liệu thời tiết");
        }
      } catch (error) {
        console.error("Error loading weather:", error);
        toast.error("Lỗi khi tải thời tiết");
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, [selectedFarm]);

  const currentDay = weather?.forecast_days?.[selectedDayIndex];

  const handlePrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (weather && selectedDayIndex < weather.forecast_days.length - 1) {
      setSelectedDayIndex(selectedDayIndex + 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return { day, month };
  };

  return (
    <div className="bg-[#fffcf6] flex flex-col md:flex-row items-start relative min-h-screen w-full overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activePage="weather" />
      </div>

      <div className="flex flex-[1_0_0] flex-col gap-[30px] md:gap-[40px] h-full items-center min-h-px min-w-px overflow-clip relative shrink-0 w-full md:ml-[60px] lg:ml-[72px]">
        {/* Farm Selector */}
        <div className="w-full px-[25px] md:px-[35px] pt-[25px] flex justify-between items-center">
          <select
            value={selectedFarm?.id || ""}
            onChange={(e) => {
              const farm = farms.find((f) => f.id === e.target.value);
              setSelectedFarm(farm || null);
              setSelectedDayIndex(0);
            }}
            className="w-full max-w-md px-4 py-2 border-2 border-[#2e8623] rounded-lg bg-white font-['Be_Vietnam_Pro'] text-black"
          >
            <option value="">Chọn ruộng</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>

          {!process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY && (
            <div className="text-xs text-orange-600 font-['Be_Vietnam_Pro'] bg-orange-100 px-2 py-1 rounded">
              ⚠️ Thiếu API Key bản đồ nhiệt
            </div>
          )}
        </div>

        <div className="w-full px-[25px] md:px-[35px] pb-[25px]">
          <div className="relative w-full h-[calc(100vh-180px)] md:h-[80vh] rounded-[14.09px] border-2 border-[#2e8623] overflow-hidden shadow-lg">
            {/* Map Background */}
            <div className="absolute inset-0 z-0">
              <WeatherMap
                farms={farms}
                selectedFarmId={selectedFarm?.id}
                onFarmSelect={(farm) => {
                  setSelectedFarm(farm);
                  setSelectedDayIndex(0);
                }}
              />
            </div>

            {/* Toggle Button */}
            <button 
              onClick={() => setIsCardVisible(!isCardVisible)}
              className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[60] w-12 h-12 rounded-full bg-[#2e8623] text-white flex items-center justify-center shadow-lg hover:bg-[#267019] transition-colors"
              aria-label={isCardVisible ? 'Ẩn thông tin thời tiết' : 'Hiện thông tin thời tiết'}
            >
              {isCardVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M2 12h20"/>
                </svg>
              )}
            </button>

            {/* Weather Card Overlay - Only render when visible */}
            {isCardVisible && (
            <div 
              className="fixed inset-0 md:inset-auto md:bottom-0 md:right-0 p-0 md:p-[30px] z-50 w-full h-full md:w-auto md:h-auto flex items-center justify-center md:justify-end transition-all duration-300 ease-in-out"
              style={{
                pointerEvents: 'none',
                touchAction: 'none'
              }}
            >
              {/* Clickable area to close card on mobile */}
              {isCardVisible && (
                <div 
                  className="fixed inset-0 bg-black/10 md:hidden"
                  onClick={() => setIsCardVisible(false)}
                  style={{
                    pointerEvents: 'auto',
                    touchAction: 'auto'
                  }}
                />
              )}
              
              {/* The actual weather card */}
              <div 
                className="bg-[#fffcf6]/95 backdrop-blur-sm border-2 border-[#2e8623] border-solid relative rounded-[14.09px] w-full h-[90%] max-h-[600px] md:w-[360px] md:h-[420px] shadow-xl flex flex-col"
                style={{
                  pointerEvents: 'auto',
                  touchAction: 'auto',
                  maxWidth: '95%',
                  zIndex: 60
                }}
              >
                <div className="box-border flex flex-col gap-[20px] md:gap-[30px] items-center overflow-clip pb-[28px] md:pb-[35px] pt-[18px] md:pt-[23px] px-[18px] md:px-[23px] relative rounded-[inherit] h-full justify-center">
                  {loading ? (
                    <div className="py-8 text-center text-[#2e8623] font-['Be_Vietnam_Pro']">
                      Đang tải...
                    </div>
                  ) : !weather ? (
                    <div className="py-8 text-center text-gray-500 font-['Be_Vietnam_Pro']">
                      Chọn ruộng trên bản đồ để xem thời tiết
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-[14px] md:gap-[18px] items-start relative shrink-0 w-full">
                        {/* Date Selector */}
                        <div className="flex gap-[6px] items-center justify-center relative shrink-0 w-full">
                          <button
                            onClick={handlePrevDay}
                            disabled={selectedDayIndex === 0}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2e8623]/10 hover:bg-[#2e8623]/20 text-[#2e8623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>

                          {currentDay && (
                            <div className="flex flex-[1_0_0] flex-col font-['Be_Vietnam_Pro'] font-semibold items-center leading-[normal] min-h-px min-w-px relative shrink-0 text-black text-center">
                              <p className="relative shrink-0 text-[40px] md:text-[48px] w-full">
                                {formatDate(currentDay.date).day}
                              </p>
                              <p className="relative shrink-0 text-[17px] md:text-[20px] w-full text-gray-600">
                                Tháng {formatDate(currentDay.date).month}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={handleNextDay}
                            disabled={!weather || selectedDayIndex >= weather.forecast_days.length - 1}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#2e8623]/10 hover:bg-[#2e8623]/20 text-[#2e8623] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Weather Info */}
                        {currentDay && (
                          <div className="flex flex-col gap-[12px] items-start leading-[normal] relative shrink-0 text-black w-full">
                            <p
                              className="font-['Be_Vietnam_Pro'] font-semibold relative shrink-0 text-[20px] md:text-[24px] w-full truncate"
                              title={`${Math.round(currentDay.avg_temp)}° - ${currentDay.conditions}`}
                            >
                              {Math.round(currentDay.avg_temp)}° - {currentDay.conditions}
                            </p>

                            {/* Weather Details */}
                            <div className="flex flex-col gap-[8px] w-full text-[13px] md:text-[15px] font-['Be_Vietnam_Pro']">
                              <div className="flex items-center gap-2">
                                <CloudRain className="w-4 h-4 text-[#2e8623]" />
                                <span>Mưa: {currentDay.total_rainfall} mm</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplets className="w-4 h-4 text-[#2e8623]" />
                                <span>Độ ẩm: {Math.round(currentDay.avg_humidity)}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#2e8623]">🌡️</span>
                                <span>
                                  {Math.round(currentDay.min_temp)}° - {Math.round(currentDay.max_temp)}°
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Weather Alerts */}
                      {weather.alerts && weather.alerts.length > 0 && (
                        <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 overflow-y-auto max-h-[80px]">
                          <p className="font-['Be_Vietnam_Pro'] font-semibold text-red-700 text-sm mb-1 sticky top-0 bg-red-50">
                            ⚠️ Cảnh báo thời tiết
                          </p>
                          {weather.alerts.map((alert, idx) => (
                            <p key={idx} className="font-['Be_Vietnam_Pro'] text-red-600 text-xs">
                              {alert.headline}
                            </p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <Sidebar activePage="weather" />
      </div>
    </div>
  );
}
