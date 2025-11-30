from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId

from app.core.database import get_database
from app.models.chat_history import ChatHistoryInDB, ChatMessage


class ChatHistoryService:
    """Service for managing user chat history"""
    
    def __init__(self):
        """Initialize chat history service"""
        pass
    
    def _get_collection(self):
        """Get chat history collection from database"""
        db = get_database()
        return db["chat_history"]
    
    async def get_user_chat_history(
        self,
        user_id: str,
        limit: Optional[int] = 50
    ) -> Optional[ChatHistoryInDB]:
        """
        Get chat history for a specific user
        
        Args:
            user_id: User ID
            limit: Maximum number of messages to return (default 50)
            
        Returns:
            ChatHistoryInDB object or None if not found
        """
        try:
            collection = self._get_collection()
            user_oid = ObjectId(user_id)
            history_doc = await collection.find_one({"user_id": user_oid})
            
            if history_doc:
                # Limit messages if specified
                if limit and len(history_doc.get("messages", [])) > limit:
                    history_doc["messages"] = history_doc["messages"][-limit:]
                
                return ChatHistoryInDB(**history_doc)
            return None
            
        except Exception as e:
            print(f"Error getting chat history: {e}")
            return None
    
    async def add_message(
        self,
        user_id: str,
        role: str,
        content: str
    ) -> bool:
        """
        Add a message to user's chat history
        
        Args:
            user_id: User ID
            role: Message role ('user' or 'assistant')
            content: Message content
            
        Returns:
            True if successful, False otherwise
        """
        try:
            collection = self._get_collection()
            user_oid = ObjectId(user_id)
            message = ChatMessage(
                role=role,
                content=content,
                timestamp=datetime.utcnow()
            )
            
            # Update or create chat history
            result = await collection.update_one(
                {"user_id": user_oid},
                {
                    "$push": {"messages": message.model_dump()},
                    "$set": {"updated_at": datetime.utcnow()},
                    "$setOnInsert": {
                        "user_id": user_oid,
                        "created_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            return result.acknowledged
            
        except Exception as e:
            print(f"Error adding message: {e}")
            return False
    
    async def add_conversation(
        self,
        user_id: str,
        user_message: str,
        assistant_message: str
    ) -> bool:
        """
        Add a complete conversation (user message + AI response) atomically
        
        Args:
            user_id: User ID
            user_message: User's message
            assistant_message: AI assistant's response
            
        Returns:
            True if successful, False otherwise
        """
        try:
            collection = self._get_collection()
            user_oid = ObjectId(user_id)
            
            # Create both messages with timestamps
            user_msg = ChatMessage(
                role="user",
                content=user_message,
                timestamp=datetime.utcnow()
            )
            assistant_msg = ChatMessage(
                role="assistant",
                content=assistant_message,
                timestamp=datetime.utcnow()
            )
            
            # Add both messages atomically in a single operation to prevent race condition
            result = await collection.update_one(
                {"user_id": user_oid},
                {
                    "$push": {
                        "messages": {
                            "$each": [
                                user_msg.model_dump(),
                                assistant_msg.model_dump()
                            ]
                        }
                    },
                    "$set": {"updated_at": datetime.utcnow()},
                    "$setOnInsert": {
                        "user_id": user_oid,
                        "created_at": datetime.utcnow()
                    }
                },
                upsert=True
            )
            
            return result.acknowledged
            
        except Exception as e:
            print(f"Error adding conversation: {e}")
            return False
    
    async def clear_user_history(
        self,
        user_id: str
    ) -> bool:
        """
        Clear all chat history for a user
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            collection = self._get_collection()
            user_oid = ObjectId(user_id)
            result = await collection.delete_one({"user_id": user_oid})
            return result.acknowledged
            
        except Exception as e:
            print(f"Error clearing history: {e}")
            return False
    
    async def get_conversation_for_api(
        self,
        user_id: str,
        max_messages: int = 20
    ) -> List[Dict[str, str]]:
        """
        Get conversation history formatted for Clova API
        
        Args:
            user_id: User ID
            max_messages: Maximum number of messages to include (capped at 50 to prevent token overflow)
            
        Returns:
            List of message dicts with 'role' and 'content' keys
        """
        try:
            # Enforce maximum limit to prevent token overflow
            safe_limit = min(max_messages, 50)
            
            history = await self.get_user_chat_history(user_id, limit=safe_limit)
            
            if not history or not history.messages:
                return []
            
            # Convert to API format
            messages = []
            for msg in history.messages:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            return messages
            
        except Exception as e:
            print(f"Error getting conversation for API: {e}")
            return []
