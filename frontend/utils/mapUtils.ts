// Goong API utilities for reverse geocoding and place search
const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

interface GoongResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: { lat: number; lng: number };
    };
  }>;
  status: string;
}

export interface GoongPrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const getAddressFromCoords = async (
  lat: number,
  lng: number
): Promise<string | null> => {
  if (!GOONG_API_KEY) {
    console.warn('GOONG_API_KEY not configured');
    return `Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  try {
    const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}&language=vi`;
    const res = await fetch(url);
    const data: GoongResponse = await res.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    return `Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Lỗi lấy địa chỉ:', error);
    return `Tọa độ: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export const searchPlace = async (query: string): Promise<GoongPrediction[]> => {
  if (!GOONG_API_KEY || !query.trim()) return [];

  try {
    const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(query)}&language=vi`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK') {
      return data.predictions;
    }
    return [];
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error);
    return [];
  }
};

export const getPlaceDetail = async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
  if (!GOONG_API_KEY) return null;

  try {
    const url = `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}&language=vi`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === 'OK' && data.result?.geometry?.location) {
      return data.result.geometry.location;
    }
    return null;
  } catch (error) {
    console.error('Lỗi lấy chi tiết địa điểm:', error);
    return null;
  }
};
