from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class WeatherRequest(BaseModel):
    """Request model for weather forecast by coordinates"""
    latitude: float = Field(..., description="Latitude coordinate", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude coordinate", ge=-180, le=180)
    
    @field_validator('latitude')
    @classmethod
    def validate_latitude(cls, v):
        """Validate latitude range"""
        if not (-90 <= v <= 90):
            raise ValueError('Latitude must be between -90 and 90')
        return v
    
    @field_validator('longitude')
    @classmethod
    def validate_longitude(cls, v):
        """Validate longitude range"""
        if not (-180 <= v <= 180):
            raise ValueError('Longitude must be between -180 and 180')
        return v


class HourlyForecast(BaseModel):
    """Hourly weather forecast data"""
    time: str = Field(..., description="Time of the forecast")
    temp_c: float = Field(..., description="Temperature in Celsius")
    condition: str = Field(..., description="Weather condition text")
    wind_kph: float = Field(..., description="Wind speed in kilometers per hour")
    wind_dir: str = Field(..., description="Wind direction")
    precip_mm: float = Field(..., description="Precipitation in millimeters")
    humidity: float = Field(..., description="Humidity percentage")
    chance_of_rain: int = Field(..., description="Chance of rain percentage")


class WeatherAlert(BaseModel):
    """Weather alert data"""
    headline: str = Field(..., description="Alert headline")
    event: str = Field(..., description="Type of alert")
    effective: str = Field(..., description="Effective time of the alert")
    expires: str = Field(..., description="Expiration time of the alert")
    description: str = Field(..., description="Full description of the alert")
    instruction: str = Field(..., description="Instructional text for the alert")


class DailyForecast(BaseModel):
    """Daily weather forecast data"""
    date: str
    max_temp: float = Field(..., description="Maximum temperature in Celsius")
    min_temp: float = Field(..., description="Minimum temperature in Celsius")
    avg_temp: float = Field(..., description="Average temperature in Celsius")
    max_humidity: float = Field(..., description="Maximum humidity percentage")
    avg_humidity: float = Field(..., description="Average humidity percentage")
    total_rainfall: float = Field(..., description="Total rainfall in mm")
    conditions: str = Field(..., description="Weather conditions description")
    hourly: List[HourlyForecast] = Field([], description="Hourly forecast for the day")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WeatherForecast(BaseModel):
    """Weather forecast response model"""
    temperature: float = Field(..., description="Current temperature in Celsius")
    humidity: float = Field(..., description="Current humidity percentage")
    rainfall: float = Field(..., description="Current rainfall in mm")
    conditions: str = Field(..., description="Current weather conditions")
    forecast_days: List[DailyForecast] = Field(..., description="Multi-day forecast")
    location: str = Field(..., description="Location name")
    alerts: List[WeatherAlert] = Field([], description="Weather alerts for the location")
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
