"""
Migration script to add clova_request_id to existing users
Run this script once to update all existing users with unique request IDs
"""
import asyncio
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


async def migrate_users():
    """Add clova_request_id to all users who don't have it"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.MONGODB_DB_NAME]
    users_collection = db["users"]
    
    print("Starting migration: Adding clova_request_id to users...")
    
    # Find all users without clova_request_id
    users_without_id = await users_collection.count_documents({
        "clova_request_id": {"$exists": False}
    })
    
    print(f"Found {users_without_id} users without clova_request_id")
    
    if users_without_id == 0:
        print("No users to migrate.")
        client.close()
        return
    
    # Update all users
    cursor = users_collection.find({"clova_request_id": {"$exists": False}})
    updated_count = 0
    
    async for user in cursor:
        # Generate unique request ID
        request_id = str(uuid.uuid4()).replace("-", "")
        
        # Update user
        result = await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"clova_request_id": request_id}}
        )
        
        if result.modified_count > 0:
            updated_count += 1
            print(f"Updated user {user.get('phone', user['_id'])}: {request_id}")
    
    print(f"\nMigration completed: {updated_count} users updated")
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate_users())
