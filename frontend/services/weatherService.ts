/**
 * Weather Service - Gọi Weather API
 */

import useApiGet from "./useApiGet";
import useApiPost from "./useApiPost";
import { API_ROUTE } from "@/common/config";
import type { WeatherForecast, WeatherRequest } from "@/models/weather";
import type { TResponseData } from "@/models/global";

/**
 * Get weather forecast by coordinates
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast> {
  const body: WeatherRequest = {
    latitude,
    longitude,
  };

  const response = await useApiPost<WeatherRequest>(API_ROUTE.Weather.getWeather, body) as TResponseData<WeatherForecast> | undefined;

  if (!response || !response.data) {
    throw new Error(response?.message || "Failed to get weather forecast");
  }

  return response.data;
}

/**
 * Get weather forecast for a specific farm
 */
export async function getWeatherByFarm(farmId: string): Promise<WeatherForecast> {
  const url = API_ROUTE.Weather.getWeatherByFarm.replace(":farmId", farmId);

  const response = await useApiGet<WeatherForecast>(url);

  if (!response || !response.data) {
    throw new Error(response?.message || "Failed to get farm weather forecast");
  }

  return response.data;
}

/**
 * Get weather advice for a specific farm
 */
export async function getWeatherAdvice(farmId: string): Promise<any> {
  const url = API_ROUTE.Weather.getWeatherAdvice.replace(":farmId", farmId);

  // Cast response to include success property which exists in backend response
  const response = await useApiGet<any>(url) as (TResponseData<any> & { success: boolean }) | undefined;

  if (!response || !response.success) {
    throw new Error(response?.message || "Failed to get weather advice");
  }

  return response.data;
}
