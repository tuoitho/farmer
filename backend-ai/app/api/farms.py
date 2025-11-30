from fastapi import APIRouter, Depends, HTTPException, status, Query, Form, File, UploadFile
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.models.farm import (
    FarmCreate,
    FarmUpdate,
    FarmResponse,
    FarmFilters,
    CropStatus,
    GeoJSONPoint
)
from app.models.user import UserInDB
from app.models.api_response import APIResponse, success_response, error_response
from app.services.farm_service import FarmService
from app.core.dependencies import get_current_user
from app.core.database import get_database


router = APIRouter(prefix="/api/farms", tags=["Farm Management"])


def get_farm_service() -> FarmService:
    """Dependency to get FarmService instance"""
    return FarmService(get_database())


@router.post(
    "",
    response_model=APIResponse[FarmResponse],
    status_code=status.HTTP_201_CREATED
)
async def create_farm(
    name: str = Form(..., min_length=1, max_length=200),
    latitude: float = Form(...),
    longitude: float = Form(...),
    crop_type: Optional[str] = Form(None, max_length=100),
    variety: Optional[str] = Form(None, max_length=100),
    area: Optional[float] = Form(None, ge=0),
    crop_status: CropStatus = Form(CropStatus.PREPARING),
    planting_date: Optional[datetime] = Form(None),
    expected_harvest_date: Optional[datetime] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: UserInDB = Depends(get_current_user),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Create a new farm with crop information and optional image (authenticated).
    
    - **name**: Farm name
    - **latitude**: Latitude coordinate
    - **longitude**: Longitude coordinate
    - **crop_type**: Type of crop (optional)
    - **variety**: Crop variety (optional)
    - **area**: Farm area in square meters (optional)
    - **crop_status**: Current crop status (default: preparing)
    - **planting_date**: Date when crop was planted (optional)
    - **expected_harvest_date**: Expected harvest date (optional)
    - **image**: Farm image file (optional)
    """
    try:
        # Construct FarmCreate object
        location = GeoJSONPoint(coordinates=[longitude, latitude])
        farm_data = FarmCreate(
            name=name,
            location=location,
            crop_type=crop_type,
            variety=variety,
            area=area,
            crop_status=crop_status,
            planting_date=planting_date,
            expected_harvest_date=expected_harvest_date
        )
        
        farm = await farm_service.create_farm(str(current_user.id), farm_data, image)
        return success_response(
            data=farm.model_dump(),
            message="Farm created successfully"
        )
    except ValueError as e:
        return error_response(
            message=str(e),
            code="FARM_CREATION_FAILED"
        )


@router.get(
    "",
    response_model=APIResponse[List[FarmResponse]]
)
async def get_farms(
    crop_status: Optional[CropStatus] = Query(None, description="Filter by crop status"),
    search: Optional[str] = Query(None, description="Search by name, crop type, or variety"),
    start_date: Optional[datetime] = Query(None, description="Filter by planting date (start)"),
    end_date: Optional[datetime] = Query(None, description="Filter by planting date (end)"),
    current_user: UserInDB = Depends(get_current_user),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Get all farms for the authenticated user with optional crop_status filter and search.
    
    - **crop_status**: Optional filter by crop status (preparing, planted, growing, flowering, harvested, fallow)
    - **search**: Optional search term for name, crop type, or variety
    - **start_date**: Optional filter by planting date (start)
    - **end_date**: Optional filter by planting date (end)
    """
    filters = FarmFilters(
        crop_status=crop_status, 
        search=search,
        start_date=start_date,
        end_date=end_date
    ) if crop_status or search or start_date or end_date else None
    farms = await farm_service.get_user_farms(str(current_user.id), filters)
    
    return success_response(
        data=[farm.model_dump() for farm in farms],
        message=f"Retrieved {len(farms)} farm(s)"
    )


@router.get(
    "/{farm_id}",
    response_model=APIResponse[FarmResponse]
)
async def get_farm(
    farm_id: str,
    current_user: UserInDB = Depends(get_current_user),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Get a specific farm by ID with ownership verification.
    
    - **farm_id**: ID of the farm to retrieve
    """
    # Verify ownership
    is_owner = await farm_service.verify_farm_ownership(str(current_user.id), farm_id)
    
    if not is_owner:
        return error_response(
            message="You do not have permission to access this farm",
            code="FORBIDDEN"
        )
    
    try:
        farm = await farm_service.get_farm_by_id(farm_id)
        return success_response(
            data=farm.model_dump(),
            message="Farm retrieved successfully"
        )
    except HTTPException as e:
        return error_response(
            message=e.detail,
            code="FARM_NOT_FOUND"
        )


@router.put(
    "/{farm_id}",
    response_model=APIResponse[FarmResponse]
)
async def update_farm(
    farm_id: str,
    name: Optional[str] = Form(None, min_length=1, max_length=200),
    crop_type: Optional[str] = Form(None, max_length=100),
    variety: Optional[str] = Form(None, max_length=100),
    area: Optional[float] = Form(None, ge=0),
    crop_status: Optional[CropStatus] = Form(None),
    planting_date: Optional[datetime] = Form(None),
    expected_harvest_date: Optional[datetime] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: UserInDB = Depends(get_current_user),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Update farm and crop information (authenticated).
    
    - **farm_id**: ID of the farm to update
    - **name**: Updated farm name (optional)
    - **crop_type**: Updated crop type (optional)
    - **variety**: Updated crop variety (optional)
    - **area**: Updated farm area (optional)
    - **crop_status**: Updated crop status (optional)
    - **planting_date**: Updated planting date (optional)
    - **expected_harvest_date**: Updated expected harvest date (optional)
    - **image**: Updated farm image (optional)
    """
    # Verify ownership
    is_owner = await farm_service.verify_farm_ownership(str(current_user.id), farm_id)
    
    if not is_owner:
        return error_response(
            message="You do not have permission to update this farm",
            code="FORBIDDEN"
        )
    
    try:
        farm_data = FarmUpdate(
            name=name,
            crop_type=crop_type,
            variety=variety,
            area=area,
            crop_status=crop_status,
            planting_date=planting_date,
            expected_harvest_date=expected_harvest_date
        )
        
        farm = await farm_service.update_farm(farm_id, farm_data, image)
        return success_response(
            data=farm.model_dump(),
            message="Farm updated successfully"
        )
    except HTTPException as e:
        return error_response(
            message=e.detail,
            code="FARM_UPDATE_FAILED"
        )
    except ValueError as e:
        return error_response(
            message=str(e),
            code="VALIDATION_ERROR"
        )


@router.put(
    "/{farm_id}/status",
    response_model=APIResponse[FarmResponse]
)
async def update_crop_status(
    farm_id: str,
    crop_status: CropStatus,
    current_user: UserInDB = Depends(get_current_user),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Quick update for crop status only (authenticated).
    
    - **farm_id**: ID of the farm
    - **crop_status**: New crop status (preparing, planted, growing, flowering, harvested, fallow)
    """
    # Verify ownership
    is_owner = await farm_service.verify_farm_ownership(str(current_user.id), farm_id)
    
    if not is_owner:
        return error_response(
            message="You do not have permission to update this farm",
            code="FORBIDDEN"
        )
    
    try:
        farm = await farm_service.update_crop_status(farm_id, crop_status)
        return success_response(
            data=farm.model_dump(),
            message="Crop status updated successfully"
        )
    except HTTPException as e:
        return error_response(
            message=e.detail,
            code="STATUS_UPDATE_FAILED"
        )


@router.delete(
    "/{farm_id}",
    response_model=APIResponse[Dict[str, str]]
)
async def delete_farm(
    farm_id: str,
    current_user: UserInDB = Depends(get_current_user),
    farm_service: FarmService = Depends(get_farm_service)
) -> Dict[str, Any]:
    """
    Delete a farm (authenticated).
    
    - **farm_id**: ID of the farm to delete
    """
    # Verify ownership
    is_owner = await farm_service.verify_farm_ownership(str(current_user.id), farm_id)
    
    if not is_owner:
        return error_response(
            message="You do not have permission to delete this farm",
            code="FORBIDDEN"
        )
    
    try:
        await farm_service.delete_farm(farm_id)
        return success_response(
            data={"id": farm_id},
            message="Farm deleted successfully"
        )
    except HTTPException as e:
        return error_response(
            message=e.detail,
            code="FARM_DELETION_FAILED"
        )
