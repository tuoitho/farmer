import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional
from collections import defaultdict, Counter

import httpx
from deep_translator import GoogleTranslator
from fastapi import HTTPException, status

from app.core.config import settings
from app.models.farm import GeoJSONPoint
from app.models.weather import (
    DailyForecast,
    HourlyForecast,
    WeatherAlert,
    WeatherForecast,
    WeatherRequest,
)


class WeatherService:
    """Service for fetching weather forecast data from OpenWeatherMap"""

    def __init__(self):
        self.api_key = settings.OPENWEATHERMAP_API_KEY
        self.base_url = settings.OPENWEATHERMAP_API_URL
        self.timeout = 10.0
        self.max_retries = 2
        self.lang = "vi"  # Request Vietnamese response directly

    async def get_weather_forecast(self, location: GeoJSONPoint) -> WeatherForecast:
        """
        Get current weather and 5-day forecast for a specific location.
        """
        longitude, latitude = location.coordinates
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                # Fetch current weather and forecast in parallel
                current_task = self._fetch_current_weather(client, latitude, longitude)
                forecast_task = self._fetch_forecast(client, latitude, longitude)
                
                current_data, forecast_data = await asyncio.gather(current_task, forecast_task)
                
                return self.format_weather_data(current_data, forecast_data)

            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Weather service error: {e.response.text}"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Weather service unavailable: {str(e)}"
                )

    async def _fetch_current_weather(self, client: httpx.AsyncClient, lat: float, lon: float) -> Dict[str, Any]:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
            "lang": self.lang
        }
        response = await client.get(f"{self.base_url}/weather", params=params)
        response.raise_for_status()
        return response.json()

    async def _fetch_forecast(self, client: httpx.AsyncClient, lat: float, lon: float) -> Dict[str, Any]:
        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "metric",
            "lang": self.lang
        }
        response = await client.get(f"{self.base_url}/forecast", params=params)
        response.raise_for_status()
        return response.json()

    def format_weather_data(self, current: Dict[str, Any], forecast: Dict[str, Any]) -> WeatherForecast:
        """
        Transforms OpenWeatherMap response to WeatherForecast model.
        """
        # Process Current Weather
        current_temp = current.get("main", {}).get("temp", 0.0)
        current_humidity = current.get("main", {}).get("humidity", 0.0)
        # OWM puts rain in "rain" object (1h or 3h)
        current_rain = current.get("rain", {}).get("1h", 0.0)
        current_condition = current.get("weather", [{}])[0].get("description", "Unknown").capitalize()
        location_name = current.get("name", "Unknown")

        # Process Forecast (Aggregate 3h data into days)
        daily_forecasts = self._aggregate_daily_forecasts(forecast.get("list", []))

        return WeatherForecast(
            temperature=current_temp,
            humidity=current_humidity,
            rainfall=current_rain,
            conditions=current_condition,
            forecast_days=daily_forecasts,
            location=location_name,
            alerts=[] # OWM Standard API does not provide alerts
        )

    def _aggregate_daily_forecasts(self, forecast_list: List[Dict[str, Any]]) -> List[DailyForecast]:
        """
        Aggregates 3-hour forecast items into daily summaries.
        """
        daily_groups = defaultdict(list)
        
        for item in forecast_list:
            dt_txt = item.get("dt_txt", "")
            date_str = dt_txt.split(" ")[0] if dt_txt else ""
            if date_str:
                daily_groups[date_str].append(item)

        daily_forecasts = []
        
        # Sort dates to ensure order
        sorted_dates = sorted(daily_groups.keys())
        
        # Limit to 5 days
        for date_str in sorted_dates[:5]:
            items = daily_groups[date_str]
            
            # Calculate aggregates
            temps = [i["main"]["temp"] for i in items]
            min_temp = min([i["main"]["temp_min"] for i in items])
            max_temp = max([i["main"]["temp_max"] for i in items])
            avg_temp = sum(temps) / len(temps)
            
            humidities = [i["main"]["humidity"] for i in items]
            avg_humidity = sum(humidities) / len(humidities)
            
            # Rain is often missing if no rain
            rainfall = sum([i.get("rain", {}).get("3h", 0.0) for i in items])
            
            # Most frequent condition
            conditions = [i["weather"][0]["description"] for i in items if i.get("weather")]
            most_common_condition = Counter(conditions).most_common(1)[0][0].capitalize() if conditions else "Unknown"

            # Hourly data (mapped from 3h intervals)
            hourly_forecasts = self._format_hourly_forecasts(items)

            daily_forecasts.append(DailyForecast(
                date=date_str,
                max_temp=max_temp,
                min_temp=min_temp,
                avg_temp=avg_temp,
                max_humidity=max(humidities) if humidities else 0,
                avg_humidity=avg_humidity,
                total_rainfall=rainfall,
                conditions=most_common_condition,
                hourly=hourly_forecasts
            ))
            
        return daily_forecasts

    def _format_hourly_forecasts(self, items: List[Dict[str, Any]]) -> List[HourlyForecast]:
        """
        Maps OWM 3h forecast items to HourlyForecast model.
        """
        hourly_forecasts = []
        for item in items:
            dt_txt = item.get("dt_txt", "")
            time_str = dt_txt.split(" ")[1][:5] if len(dt_txt.split(" ")) > 1 else ""
            
            hourly_forecasts.append(HourlyForecast(
                time=time_str,
                temp_c=item["main"]["temp"],
                condition=item["weather"][0]["description"].capitalize() if item.get("weather") else "Unknown",
                wind_kph=item.get("wind", {}).get("speed", 0) * 3.6, # m/s to kph
                wind_dir=str(item.get("wind", {}).get("deg", 0)),
                precip_mm=item.get("rain", {}).get("3h", 0.0),
                humidity=item["main"]["humidity"],
                chance_of_rain=int(item.get("pop", 0) * 100) # Probability of precipitation
            ))
        return hourly_forecasts
