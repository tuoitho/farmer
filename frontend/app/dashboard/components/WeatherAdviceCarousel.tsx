'use client';

import { useState, useEffect } from 'react';
import { CloudSun } from 'lucide-react';
import { TFarm } from '@/models/farm';
import { getWeatherAdviceAction } from '@/action/weatherAction';

interface WeatherAdviceCarouselProps {
  farms: TFarm[];
}

export default function WeatherAdviceCarousel({ farms }: WeatherAdviceCarouselProps) {
  // State variables
  const [advices, setAdvices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Auto-advance effect
  useEffect(() => {
    if (farms.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % farms.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [farms.length]);

  // Lazy loading effect
  useEffect(() => {
    const farm = farms[currentIndex];

    if (!farm || advices[farm.id] || loading[farm.id]) return;

    const fetchAdvice = async () => {
      setLoading(prev => ({ ...prev, [farm.id]: true }));

      try {
        const result = await getWeatherAdviceAction(farm.id);
        console.log(result);
        if (result.success && result.data?.advice) {
          setAdvices(prev => ({
            ...prev,
            [farm.id]: result.data.advice
          }));
        } else {
          setAdvices(prev => ({
            ...prev,
            [farm.id]: "Không có lời khuyên."
          }));
        }
      } catch (error) {
        console.error('Failed to fetch advice:', error);
        setAdvices(prev => ({
          ...prev,
          [farm.id]: "Không có lời khuyên."
        }));
      } finally {
        setLoading(prev => ({ ...prev, [farm.id]: false }));
      }
    };

    fetchAdvice();
  }, [currentIndex, farms, advices, loading]);

  // Navigation handlers
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + farms.length) % farms.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % farms.length);
  };

  const currentFarm = farms[currentIndex];

  if (!currentFarm) return null;

  return (
    <div className="bg-[#ffd2d2] box-border flex gap-[12px] md:gap-[20px] items-center px-[18px] md:px-[22px] py-[15px] md:py-[18px] relative rounded-[18px] shrink-0 w-full transition-all duration-300">
      {/* Weather Icon */}
      <div className="h-[30px] md:h-[38px] w-[32px] md:w-[40px] relative shrink-0 flex items-center justify-center">
        <CloudSun className="w-full h-full text-[#b91c1c]" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 flex-1">
        {/* Farm name and navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#b91c1c] capitalize">
              {currentFarm.name}
            </span>
            <span className="text-sm text-[#b91c1c]">
              ({currentIndex + 1}/{farms.length})
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-1">
            <button
              onClick={handlePrevious}
              className="p-1 hover:bg-white/20 rounded text-[#b91c1c]"
              aria-label="Previous farm"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-white/20 rounded text-[#b91c1c]"
              aria-label="Next farm"
            >
              →
            </button>
          </div>
        </div>

        {/* Advice text */}
        <p className="font-['Be_Vietnam_Pro'] text-[14px] md:text-[16px] leading-[1.5] text-black min-h-[48px]">
          {loading[currentFarm.id]
            ? "Đang phân tích thời tiết..."
            : advices[currentFarm.id] || "Đang tải dữ liệu..."}
        </p>
      </div>
    </div>
  );
}
