"""
Cloudinary Service for image upload and management
"""
import os
from typing import Optional, Dict, Any
import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status


class CloudinaryService:
    """Service for handling Cloudinary operations"""
    
    def __init__(self):
        """Initialize Cloudinary configuration"""
        cloudinary.config(
            cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
            api_key=os.getenv("CLOUDINARY_API_KEY"),
            api_secret=os.getenv("CLOUDINARY_API_SECRET"),
            secure=True
        )
        self.folder = os.getenv("CLOUDINARY_FOLDER", "nong-dan-ai/farms")
    
    async def upload_image(
        self, 
        file: UploadFile,
        public_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload an image to Cloudinary
        
        Args:
            file: The uploaded file
            public_id: Optional custom public ID for the image
            
        Returns:
            Dict containing upload result with secure_url, public_id, etc.
            
        Raises:
            HTTPException: If upload fails
        """
        try:
            # Validate file type
            if not file.content_type or not file.content_type.startswith("image/"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File must be an image"
                )
            
            # Read file content
            contents = await file.read()
            
            # Upload to Cloudinary
            upload_options = {
                "folder": self.folder,
                "resource_type": "image",
                "transformation": [
                    {"width": 1200, "height": 800, "crop": "limit"},
                    {"quality": "auto:good"}
                ]
            }
            
            if public_id:
                upload_options["public_id"] = public_id
            
            result = cloudinary.uploader.upload(contents, **upload_options)
            
            return {
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "width": result.get("width"),
                "height": result.get("height"),
                "format": result.get("format")
            }
            
        except cloudinary.exceptions.Error as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Cloudinary upload failed: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Image upload failed: {str(e)}"
            )
    
    async def delete_image(self, public_id: str) -> bool:
        """
        Delete an image from Cloudinary
        
        Args:
            public_id: The public ID of the image to delete
            
        Returns:
            bool: True if deletion was successful
        """
        try:
            result = cloudinary.uploader.destroy(public_id)
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Failed to delete image {public_id}: {str(e)}")
            return False
    
    def extract_public_id(self, url: str) -> Optional[str]:
        """
        Extract public_id from Cloudinary URL
        
        Args:
            url: Cloudinary image URL
            
        Returns:
            Optional[str]: The public_id or None if extraction fails
        """
        try:
            # Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
            parts = url.split("/upload/")
            if len(parts) == 2:
                # Get everything after /upload/ and remove version
                path = parts[1]
                # Remove version (v1234567890/)
                if path.startswith("v"):
                    path = "/".join(path.split("/")[1:])
                # Remove file extension
                public_id = path.rsplit(".", 1)[0]
                return public_id
        except Exception as e:
            print(f"Failed to extract public_id from URL {url}: {str(e)}")
        
        return None


# Singleton instance
cloudinary_service = CloudinaryService()
