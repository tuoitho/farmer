'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TFarm } from '@/models/farm';
import MapSearch from '@/components/ui/MapSearch';

interface WeatherMapProps {
    farms: TFarm[];
    selectedFarmId?: string;
    onFarmSelect: (farm: TFarm) => void;
}

// Component to handle map centering when selected farm changes
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 13);
    }, [center, map]);
    return null;
}

// Component to handle map resizing
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        // Aggressive resizing strategy
        const triggerResize = () => {
            map.invalidateSize();
        };

        // Trigger immediately
        triggerResize();

        // Trigger repeatedly for the first second to catch any layout transitions
        const interval = setInterval(triggerResize, 100);

        // Stop after 2 seconds
        const timeout = setTimeout(() => {
            clearInterval(interval);
            triggerResize(); // Final resize
        }, 2000);

        const resizeObserver = new ResizeObserver(() => {
            triggerResize();
        });

        if (map.getContainer()) {
            resizeObserver.observe(map.getContainer());
        }

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
            resizeObserver.disconnect();
        };
    }, [map]);
    return null;
}

export default function WeatherMap({ farms, selectedFarmId, onFarmSelect }: WeatherMapProps) {
    const [mounted, setMounted] = useState(false);
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    const mapTilesKey = process.env.NEXT_PUBLIC_GOONG_MAP_TILES_KEY;

    useEffect(() => {
        // Delay setting mounted to ensure client-side rendering
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />;

    // Helper to get coordinates safely
    const getCoords = (farm: TFarm): [number, number] | null => {
        if (farm.location?.coordinates && farm.location.coordinates.length === 2) {
            // GeoJSON is [long, lat], Leaflet needs [lat, long]
            return [farm.location.coordinates[1], farm.location.coordinates[0]];
        }
        return null;
    };

    // Default center (Vietnam) or first farm
    let defaultCenter: [number, number] = [16.047079, 108.206230];
    if (farms.length > 0) {
        const firstFarmCoords = getCoords(farms[0]);
        if (firstFarmCoords) {
            defaultCenter = firstFarmCoords;
        }
    }

    const selectedFarm = farms.find(f => f.id === selectedFarmId);
    let center: [number, number] = defaultCenter;

    if (selectedFarm) {
        const selectedCoords = getCoords(selectedFarm);
        if (selectedCoords) {
            center = selectedCoords;
        }
    }

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: '100%', width: '100%', borderRadius: '14px' }}
                className="h-full w-full"
                scrollWheelZoom={true}
            >
                <MapResizer />
                <MapUpdater center={center} />
                
                {/* Tích hợp tìm kiếm */}
                <MapSearch />

                {/* Base Map Layer - OpenStreetMap (Stable & Free) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=vi"
                    maxZoom={19}
                />

                {/* Weather Layer (Temperature) */}
                {apiKey && (
                    <TileLayer
                        attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                        url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`}
                        opacity={0.5}
                    />
                )}

                {/* Farm Markers */}
                {farms.map((farm) => {
                    const coords = getCoords(farm);
                    if (!coords) return null;

                    const isSelected = farm.id === selectedFarmId;

                    // Custom marker with farm name
                    const customIcon = L.divIcon({
                        className: 'custom-farm-marker',
                        html: `
                            <div class="relative">
                                <div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                                    <div class="bg-white px-3 py-1 rounded-full shadow-lg border-2 ${isSelected ? 'border-[#2e8623] z-50' : 'border-gray-300'} whitespace-nowrap font-['Be_Vietnam_Pro'] font-bold text-sm flex items-center gap-1 transition-all duration-300 ${isSelected ? 'scale-110' : 'hover:scale-105'}">
                                        <span class="${isSelected ? 'text-[#2e8623]' : 'text-gray-700'}">${farm.name}</span>
                                    </div>
                                    <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-[#2e8623]' : 'border-t-gray-300'} mt-[-1px]"></div>
                                    <div class="w-3 h-3 bg-black/20 rounded-full blur-[2px] mt-[-2px]"></div>
                                </div>
                            </div>
                        `,
                        iconSize: [0, 0],
                        iconAnchor: [0, 0],
                    });

                    return (
                        <Marker
                            key={farm.id}
                            position={coords}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => onFarmSelect(farm),
                            }}
                        />
                    );
                })}

                <MapUpdater center={center} />
            </MapContainer>

            {/* Legend for Weather Layer */}
            {apiKey && (
                <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-lg shadow-md z-[1000] text-xs font-['Be_Vietnam_Pro']">
                    <div className="font-semibold mb-1">Nhiệt độ (°C)</div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-[#9e0142]"></div> 30+
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-[#f46d43]"></div> 20-30
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-[#fdae61]"></div> 10-20
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-[#abdda4]"></div> 0-10
                    </div>
                </div>
            )}
        </div>
    );
}
