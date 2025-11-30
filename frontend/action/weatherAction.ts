/**
 * Weather Server Actions - Xử lý Weather logic trên server
 */

"use server";

import { getWeatherForecast, getWeatherByFarm, getWeatherAdvice } from "@/services/weatherService";
import type { WeatherForecast } from "@/models/weather";

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action: Get weather forecast by coordinates
 */
export async function getWeatherForecastAction(
  latitude: number,
  longitude: number
): Promise<ActionResult<WeatherForecast>> {
  try {
    const weatherData = await getWeatherForecast(latitude, longitude);

    return {
      success: true,
      data: weatherData,
    };
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể lấy dữ liệu thời tiết",
    };
  }
}

/**
 * Server Action: Get weather forecast for a farm
 */
export async function getWeatherByFarmAction(
  farmId: string
): Promise<ActionResult<WeatherForecast>> {
  try {
    const weatherData = await getWeatherByFarm(farmId);

    return {
      success: true,
      data: weatherData,
    };
  } catch (error) {
    console.error("Error fetching farm weather:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể lấy dữ liệu thời tiết cho ruộng này",
    };
  }
}

/**
 * Server Action: Get weather advice for a farm
 */
export async function getWeatherAdviceAction(
  farmId: string
): Promise<ActionResult<any>> {
  try {
    // Validate farmId parameter
    if (!farmId || typeof farmId !== "string" || farmId.trim() === "") {
      return {
        success: false,
        error: "Farm ID không hợp lệ",
      };
    }

    const adviceData = await getWeatherAdvice(farmId);

    return {
      success: true,
      data: adviceData,
    };
  } catch (error) {
    console.error("Error fetching weather advice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Không thể lấy lời khuyên thời tiết",
    };
  }
}
