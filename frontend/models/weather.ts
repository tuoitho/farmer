/**
 * Weather Models - Frontend TypeScript interfaces
 * Khớp với Backend Pydantic models
 */

export interface WeatherRequest {
  latitude: number;
  longitude: number;
}

export interface HourlyForecast {
  time: string;
  temp_c: number;
  condition: string;
  wind_kph: number;
  wind_dir: string;
  precip_mm: number;
  humidity: number;
  chance_of_rain: number;
}

export interface WeatherAlert {
  headline: string;
  event: string;
  effective: string;
  expires: string;
  description: string;
  instruction: string;
}

export interface DailyForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  avg_temp: number;
  max_humidity: number;
  avg_humidity: number;
  total_rainfall: number;
  conditions: string;
  hourly: HourlyForecast[];
}

export interface WeatherForecast {
  temperature: number;
  humidity: number;
  rainfall: number;
  conditions: string;
  forecast_days: DailyForecast[];
  location: string;
  alerts: WeatherAlert[];
}

export interface WeatherResponse {
  success: boolean;
  message: string;
  data: WeatherForecast;
  error?: string;
}
