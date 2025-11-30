'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getAddressFromCoords } from '@/utils/mapUtils';
import MapSearch from './MapSearch';

// Fix icon mặc định của Leaflet trong Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component con để xử lý sự kiện click và hiển thị marker
function LocationMarker({
  onLocationSelect,
  externalPosition,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  externalPosition?: { lat: number; lng: number } | null;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  // Cập nhật marker khi có vị trí từ search
  useEffect(() => {
    if (externalPosition) {
      const newPosition = L.latLng(externalPosition.lat, externalPosition.lng);
      setPosition((prev) => {
        // Chỉ update nếu vị trí thực sự thay đổi
        if (!prev || prev.lat !== newPosition.lat || prev.lng !== newPosition.lng) {
          return newPosition;
        }
        return prev;
      });
    }
  }, [externalPosition]);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : <Marker position={position} icon={icon}></Marker>;
}

interface MapPickerProps {
  defaultLat?: number;
  defaultLng?: number;
  onAddressFound: (address: string, lat: number, lng: number) => void;
}

const MapPicker = ({
  defaultLat = 10.762622,
  defaultLng = 106.660172,
  onAddressFound,
}: MapPickerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationSelect = async (lat: number, lng: number) => {
    setIsLoading(true);
    const address = await getAddressFromCoords(lat, lng);
    setIsLoading(false);

    if (address) {
      setSelectedAddress(address);
      setMarkerPosition({ lat, lng });
      onAddressFound(address, lat, lng);
    }
  };

  // Hàm xử lý khi chọn từ thanh tìm kiếm
  const handleSearchSelect = (lat: number, lng: number, address: string) => {
    setSelectedAddress(address);
    setMarkerPosition({ lat, lng });
    onAddressFound(address, lat, lng);
  };

  return (
    <div className="space-y-2 w-full">
      {/* Đảm bảo div cha có chiều cao cụ thể */}
      <div className="h-[300px] w-full rounded-[18px] border-2 border-[#2e8623] overflow-hidden relative shrink-0 z-0">
        <MapContainer
          center={[defaultLat, defaultLng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          dragging={true}
          touchZoom={true}
          doubleClickZoom={true}
          zoomControl={true}
        >
          {/* Tích hợp tìm kiếm vào Picker */}
          <MapSearch onLocationSelect={handleSearchSelect} />

          {/* Base Map Layer - Google Maps với tiếng Việt */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi"
            maxZoom={19}
          />
          <LocationMarker onLocationSelect={handleLocationSelect} externalPosition={markerPosition} />
        </MapContainer>

        {/* Overlay loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[1000] pointer-events-none">
            <span className="text-white font-medium bg-black/50 px-3 py-1 rounded">
              Đang lấy địa chỉ...
            </span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 font-['Be_Vietnam_Pro']">
        Click vào bản đồ để chọn vị trí ruộng của bạn
      </p>

      {selectedAddress && (
        <div className="bg-[#ebf5ed] border border-[#2e8623] rounded-[12px] p-3">
          <p className="text-sm font-['Be_Vietnam_Pro'] text-[#191f19]">
            <span className="font-semibold">Địa chỉ đã chọn:</span> {selectedAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
