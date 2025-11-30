'use client';

import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Search, X, MapPin } from 'lucide-react';
import { searchPlace, getPlaceDetail, GoongPrediction } from '@/utils/mapUtils';

interface MapSearchProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

export default function MapSearch({ onLocationSelect }: MapSearchProps) {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GoongPrediction[]>([]);
  const [showResults, setShowResults] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);

  // Debounce search input để tránh gọi API quá nhiều
  useEffect(() => {
    // Bỏ qua tìm kiếm nếu đang trong quá trình chọn địa điểm
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (query.length > 2) {
        const predictions = await searchPlace(query);
        setResults(predictions);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = async (prediction: GoongPrediction) => {
    // Đánh dấu đang chọn địa điểm TRƯỚC KHI setQuery
    isSelectingRef.current = true;
    setShowResults(false);
    setResults([]);
    setQuery(prediction.description);

    const coords = await getPlaceDetail(prediction.place_id);
    if (coords) {
      map.flyTo([coords.lat, coords.lng], 16, { animate: true });
      if (onLocationSelect) {
        onLocationSelect(coords.lat, coords.lng, prediction.description);
      }
    }
    
    // Blur input để tránh trigger search lại
    if (wrapperRef.current) {
      const input = wrapperRef.current.querySelector('input');
      input?.blur();
    }
  };

  return (
    <div className="absolute top-3 left-13 right-3 md:right-[80px] z-[1000]" ref={wrapperRef}>
      <div className="relative w-full bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center px-3 py-2">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            className="w-full outline-none text-sm text-black font-['Be_Vietnam_Pro']"
            placeholder="Tìm kiếm địa điểm (Goong Maps)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              // Chỉ hiện kết quả nếu đang có query và có results
              if (query.length > 2 && results.length > 0) {
                setShowResults(true);
              }
            }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Dropdown kết quả */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-[60vh] overflow-y-auto divide-y divide-gray-100 z-[2000]">
            {results.map((item) => (
              <button
                key={item.place_id}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 hover:bg-[#ebf5ed] flex items-start gap-3 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#2e8623] mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#191f19] font-['Be_Vietnam_Pro']">
                    {item.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500 font-['Be_Vietnam_Pro']">
                    {item.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
