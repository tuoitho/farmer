from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any

from app.models.weather import WeatherForecast, WeatherRequest
from app.models.farm import GeoJSONPoint
from app.models.user import UserInDB
from app.models.api_response import APIResponse, success_response, error_response
from app.services.weather_service import WeatherService
from app.services.farm_service import FarmService
from app.services.clova_service import ClovaStudioService
from app.core.dependencies import get_current_user
from app.core.database import get_database


router = APIRouter(prefix="/api/weather", tags=["Weather Forecast"])


def get_weather_service() -> WeatherService:
    """Dependency to get WeatherService instance"""
    return WeatherService()


def get_farm_service() -> FarmService:
    """Dependency to get FarmService instance"""
    return FarmService(get_database())


def get_clova_service() -> ClovaStudioService:
    """Dependency to get ClovaStudioService instance"""
    return ClovaStudioService()


@router.post(
    "/forecast",
    response_model=APIResponse[WeatherForecast],
    status_code=status.HTTP_200_OK
)
async def get_weather_forecast(
    weather_request: WeatherRequest,
    current_user: UserInDB = Depends(get_current_user),
    weather_service: WeatherService = Depends(get_weather_service)
) -> Dict[str, Any]:
    """
    Get 5-day weather forecast for specific coordinates (authenticated).
    
    Send latitude and longitude in request body to get weather forecast
    including temperature, humidity, rainfall, and conditions.
    
    Request body:
    - **latitude**: Latitude coordinate (-90 to 90)
    - **longitude**: Longitude coordinate (-180 to 180)
    
    Returns weather forecast with:
    - Current weather conditions
    - 5-day forecast with daily details
    - Temperature, humidity, and rainfall data
    """
    try:
        # Create GeoJSON Point from coordinates
        location = GeoJSONPoint(
            type="Point",
            coordinates=[weather_request.longitude, weather_request.latitude]
        )
        
        # Fetch weather forecast
        weather = await weather_service.get_weather_forecast(location)
        
        return success_response(
            data=weather.model_dump(),
            message="Weather forecast retrieved successfully"
        )
        
    except HTTPException as e:
        # Handle timeout and service unavailable errors
        if e.status_code == status.HTTP_504_GATEWAY_TIMEOUT:
            return error_response(
                message=e.detail,
                code="WEATHER_TIMEOUT"
            )
        elif e.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
            return error_response(
                message=e.detail,
                code="WEATHER_SERVICE_UNAVAILABLE"
            )
        else:
            return error_response(
                message=str(e.detail),
                code="WEATHER_ERROR"
            )
    except ValueError as e:
        return error_response(
            message=str(e),
            code="VALIDATION_ERROR"
        )
    except Exception as e:
        return error_response(
            message=f"Failed to retrieve weather forecast: {str(e)}",
            code="INTERNAL_ERROR"
        )


@router.get(
    "/farm/{farm_id}",
    response_model=APIResponse[WeatherForecast]
)
async def get_farm_weather(
    farm_id: str,
    current_user: UserInDB = Depends(get_current_user),
    weather_service: WeatherService = Depends(get_weather_service),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Get weather forecast for a specific farm location (authenticated).
    
    Retrieves the farm's location and fetches a 5-day weather forecast
    including temperature, humidity, rainfall, and conditions.
    
    - **farm_id**: ID of the farm to get weather forecast for
    
    Returns weather forecast with:
    - Current weather conditions
    - 5-day forecast with daily details
    - Temperature, humidity, and rainfall data
    """
    try:
        # Verify farm ownership
        is_owner = await farm_service.verify_farm_ownership(str(current_user.id), farm_id)
        
        if not is_owner:
            return error_response(
                message="You do not have permission to access this farm",
                code="FORBIDDEN"
            )
        
        # Get farm location
        farm = await farm_service.get_farm_by_id(farm_id)
        
        # Fetch weather forecast
        weather = await weather_service.get_weather_forecast(farm.location)
        
        return success_response(
            data=weather.model_dump(),
            message="Weather forecast retrieved successfully"
        )
        
    except HTTPException as e:
        # Handle timeout and service unavailable errors
        if e.status_code == status.HTTP_504_GATEWAY_TIMEOUT:
            return error_response(
                message=e.detail,
                code="WEATHER_TIMEOUT"
            )
        elif e.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
            return error_response(
                message=e.detail,
                code="WEATHER_SERVICE_UNAVAILABLE"
            )
        elif e.status_code == status.HTTP_404_NOT_FOUND:
            return error_response(
                message=e.detail,
                code="FARM_NOT_FOUND"
            )
        else:
            return error_response(
                message=str(e.detail),
                code="WEATHER_ERROR"
            )
    except Exception as e:
        return error_response(
            message=f"Failed to retrieve weather forecast: {str(e)}",
            code="INTERNAL_ERROR"
        )


@router.get(
    "/advice/farm/{farm_id}",
    response_model=APIResponse[Dict[str, Any]]
)
async def get_weather_advice(
    farm_id: str,
    current_user: UserInDB = Depends(get_current_user),
    weather_service: WeatherService = Depends(get_weather_service),
    farm_service: FarmService = Depends(get_farm_service),
    clova_service: ClovaStudioService = Depends(get_clova_service)
) -> Dict[str, Any]:
    """
    Get AI-generated weather advice for a specific farm.
    """
    try:
        # Verify farm ownership
        is_owner = await farm_service.verify_farm_ownership(str(current_user.id), farm_id)
        
        if not is_owner:
            return error_response(
                message="You do not have permission to access this farm",
                code="FORBIDDEN"
            )
        
        # Get farm location
        farm = await farm_service.get_farm_by_id(farm_id)
        
        # Fetch weather forecast
        weather = await weather_service.get_weather_forecast(farm.location)
        
        # Get advice from Clova with user's request_id
        advice_result = await clova_service.get_weather_advice(
            weather.model_dump(),
            farm.name,
            current_user.clova_request_id,
            str(farm.id)
        )
        
        if advice_result["success"]:
            return success_response(
                data=advice_result,
                message="Weather advice retrieved successfully"
            )
        else:
            return error_response(
                message=advice_result.get("error", "Failed to generate advice"),
                code="ADVICE_GENERATION_ERROR"
            )

    except Exception as e:
        return error_response(
            message=f"Failed to retrieve weather advice: {str(e)}",
            code="INTERNAL_ERROR"
        )
