from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException, status, UploadFile
import cloudinary
import cloudinary.uploader

from app.core.config import settings
from app.models.farm import (
    FarmInDB,
    FarmCreate,
    FarmUpdate,
    FarmResponse,
    FarmFilters,
    CropStatus,
    FarmStatusHistoryItem
)


class FarmService:
    """Service for managing farm operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.farms
        
        # Configure Cloudinary
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
    
    async def upload_image(self, file: UploadFile) -> str:
        """
        Upload image to Cloudinary
        
        Args:
            file: File to upload
            
        Returns:
            str: URL of the uploaded image
        """
        try:
            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file.file,
                folder=settings.CLOUDINARY_FOLDER,
                resource_type="image"
            )
            return result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image"
            )

    async def create_farm(
        self, 
        user_id: str, 
        farm_data: FarmCreate, 
        image_file: Optional[UploadFile] = None
    ) -> FarmResponse:
        """
        Create a new farm with user_id association and crop information
        
        Args:
            user_id: ID of the user creating the farm (as string)
            farm_data: Farm creation data
            image_file: Optional image file to upload
            
        Returns:
            FarmResponse: Created farm data
        """
        farm_dict = farm_data.model_dump()
        # Ensure Enum values are stored as strings
        if isinstance(farm_dict.get("crop_status"), CropStatus):
            farm_dict["crop_status"] = farm_dict["crop_status"].value
            
        # Initialize status history with the initial status
        initial_status = farm_data.crop_status
        farm_dict["status_history"] = [
            FarmStatusHistoryItem(
                status=initial_status,
                date=datetime.utcnow()
            ).model_dump()
        ]
            
        farm_dict["user_id"] = ObjectId(user_id)
        farm_dict["created_at"] = datetime.utcnow()
        farm_dict["updated_at"] = datetime.utcnow()
        
        # Handle image upload if provided
        if image_file:
            image_url = await self.upload_image(image_file)
            farm_dict["image"] = image_url
        else:
            farm_dict["image"] = None
        
        # Convert location to proper GeoJSON format for MongoDB
        farm_dict["location"] = {
            "type": "Point",
            "coordinates": farm_data.location.coordinates
        }
        
        result = await self.collection.insert_one(farm_dict)
        
        # Retrieve the created farm
        created_farm = await self.collection.find_one({"_id": result.inserted_id})
        
        return self._farm_to_response(created_farm)
    
    async def get_user_farms(
        self, 
        user_id: str, 
        filters: Optional[FarmFilters] = None
    ) -> List[FarmResponse]:
        """
        Get all farms for a user with optional filtering by crop_status
        
        Args:
            user_id: ID of the user (as string)
            filters: Optional filters to apply
            
        Returns:
            List[FarmResponse]: List of user's farms
        """
        query = {"user_id": ObjectId(user_id)}
        
        # Apply crop_status filter if provided
        if filters:
            if filters.crop_status:
                query["crop_status"] = filters.crop_status.value
            
            if filters.search:
                search_regex = {"$regex": filters.search, "$options": "i"}
                query["$or"] = [
                    {"name": search_regex},
                    {"crop_type": search_regex},
                    {"variety": search_regex}
                ]
            
            if filters.start_date or filters.end_date:
                date_query = {}
                if filters.start_date:
                    date_query["$gte"] = filters.start_date
                if filters.end_date:
                    date_query["$lte"] = filters.end_date
                query["planting_date"] = date_query
        
        cursor = self.collection.find(query).sort("created_at", -1)
        farms = await cursor.to_list(length=None)
        
        return [self._farm_to_response(farm) for farm in farms]
    
    async def get_farm_by_id(self, farm_id: str) -> FarmResponse:
        """
        Get a farm by its ID
        
        Args:
            farm_id: ID of the farm
            
        Returns:
            FarmResponse: Farm data
            
        Raises:
            HTTPException: If farm not found
        """
        if not ObjectId.is_valid(farm_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        farm = await self.collection.find_one({"_id": ObjectId(farm_id)})
        
        if not farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        return self._farm_to_response(farm)
    
    async def update_farm(
        self, 
        farm_id: str, 
        farm_data: FarmUpdate,
        image_file: Optional[UploadFile] = None
    ) -> FarmResponse:
        """
        Update farm details including crop information
        
        Args:
            farm_id: ID of the farm to update
            farm_data: Updated farm data
            image_file: Optional new image file
            
        Returns:
            FarmResponse: Updated farm data
            
        Raises:
            HTTPException: If farm not found
        """
        if not ObjectId.is_valid(farm_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
            
        # Get current farm to check for status change
        current_farm = await self.collection.find_one({"_id": ObjectId(farm_id)})
        if not current_farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        # Build update dict with only provided fields
        update_dict = {}
        status_changed = False
        new_status = None
        
        for field, value in farm_data.model_dump(exclude_unset=True).items():
            if value is not None:
                if field == "crop_status":
                    if isinstance(value, CropStatus):
                        new_status = value.value
                    else:
                        new_status = value
                        
                    if new_status != current_farm.get("crop_status"):
                        status_changed = True
                        update_dict[field] = new_status
                elif isinstance(value, CropStatus):
                    update_dict[field] = value.value
                else:
                    update_dict[field] = value
                
        # Handle image upload if provided
        if image_file:
            image_url = await self.upload_image(image_file)
            update_dict["image"] = image_url
        
        if not update_dict:
            # No fields to update, return current farm
            return self._farm_to_response(current_farm)
        
        # Always update the updated_at timestamp
        update_dict["updated_at"] = datetime.utcnow()
        
        # Prepare update operation
        update_op = {"$set": update_dict}
        
        # If status changed, append to history
        if status_changed and new_status:
            history_item = FarmStatusHistoryItem(
                status=CropStatus(new_status),
                date=datetime.utcnow()
            ).model_dump()
            update_op["$push"] = {"status_history": history_item}
        
        result = await self.collection.update_one(
            {"_id": ObjectId(farm_id)},
            update_op
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        # Retrieve and return updated farm
        updated_farm = await self.collection.find_one({"_id": ObjectId(farm_id)})
        return self._farm_to_response(updated_farm)
    
    async def update_crop_status(self, farm_id: str, status: CropStatus) -> FarmResponse:
        """
        Quick update for crop status only
        
        Args:
            farm_id: ID of the farm
            status: New crop status
            
        Returns:
            FarmResponse: Updated farm data
            
        Raises:
            HTTPException: If farm not found
        """
        if not ObjectId.is_valid(farm_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
            
        # Create history item
        history_item = FarmStatusHistoryItem(
            status=status,
            date=datetime.utcnow()
        ).model_dump()
        
        result = await self.collection.update_one(
            {"_id": ObjectId(farm_id)},
            {
                "$set": {
                    "crop_status": status.value,
                    "updated_at": datetime.utcnow()
                },
                "$push": {
                    "status_history": history_item
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        # Retrieve and return updated farm
        updated_farm = await self.collection.find_one({"_id": ObjectId(farm_id)})
        return self._farm_to_response(updated_farm)
    
    async def verify_farm_ownership(self, user_id: str, farm_id: str) -> bool:
        """
        Verify that a farm belongs to a specific user
        
        Args:
            user_id: ID of the user (as string)
            farm_id: ID of the farm (as string)
            
        Returns:
            bool: True if user owns the farm, False otherwise
        """
        if not ObjectId.is_valid(farm_id):
            return False
        
        farm = await self.collection.find_one({
            "_id": ObjectId(farm_id),
            "user_id": ObjectId(user_id)
        })
        
        return farm is not None
    
    async def get_all_farms(self) -> List[FarmResponse]:
        """
        Get all farms from the database.
        
        Returns:
            List[FarmResponse]: A list of all farms.
        """
        cursor = self.collection.find({}).sort("created_at", -1)
        farms = await cursor.to_list(length=None)
        return [self._farm_to_response(farm) for farm in farms]

    async def delete_farm(self, farm_id: str) -> bool:
        """
        Delete a farm by its ID
        
        Args:
            farm_id: ID of the farm to delete
            
        Returns:
            bool: True if deleted successfully
            
        Raises:
            HTTPException: If farm not found
        """
        if not ObjectId.is_valid(farm_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        result = await self.collection.delete_one({"_id": ObjectId(farm_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
            
        return True

    def _farm_to_response(self, farm: dict) -> FarmResponse:
        """
        Convert MongoDB farm document to FarmResponse
        
        Args:
            farm: Farm document from MongoDB
            
        Returns:
            FarmResponse: Formatted farm response
        """
        # Handle status_history conversion
        status_history = []
        if "status_history" in farm:
            for item in farm["status_history"]:
                if isinstance(item, dict):
                    status_history.append(FarmStatusHistoryItem(**item))
                else:
                    # Handle legacy data or other formats if necessary
                    pass

        return FarmResponse(
            id=str(farm["_id"]),
            user_id=str(farm["user_id"]),
            name=farm["name"],
            location={
                "type": "Point",
                "coordinates": farm["location"]["coordinates"]
            },
            crop_type=farm.get("crop_type"),
            variety=farm.get("variety"),
            area=farm.get("area"),
            crop_status=CropStatus(farm["crop_status"]),
            status_history=status_history,
            planting_date=farm.get("planting_date"),
            expected_harvest_date=farm.get("expected_harvest_date"),
            image=farm.get("image"),
            created_at=farm["created_at"],
            updated_at=farm["updated_at"]
        )
