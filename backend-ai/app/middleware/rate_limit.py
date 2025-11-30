"""Rate limiting middleware and dependencies"""
from typing import Dict, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, status, Request
from collections import defaultdict
import asyncio


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self):
        # Store: {user_id: {endpoint: [(timestamp, count)]}}
        self.requests: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))
        self.lock = asyncio.Lock()
    
    async def check_rate_limit(
        self,
        user_id: str,
        endpoint: str,
        max_requests: int,
        window_seconds: int
    ) -> bool:
        """
        Check if user has exceeded rate limit
        
        Args:
            user_id: User identifier
            endpoint: API endpoint path
            max_requests: Maximum requests allowed in time window
            window_seconds: Time window in seconds
            
        Returns:
            True if within limit, raises HTTPException if exceeded
        """
        async with self.lock:
            now = datetime.utcnow()
            cutoff_time = now - timedelta(seconds=window_seconds)
            
            # Clean old requests
            user_requests = self.requests[user_id][endpoint]
            self.requests[user_id][endpoint] = [
                req_time for req_time in user_requests
                if req_time > cutoff_time
            ]
            
            # Check current count
            current_count = len(self.requests[user_id][endpoint])
            
            if current_count >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail={
                        "error": "RATE_LIMIT_EXCEEDED",
                        "message": f"Too many requests. Maximum {max_requests} requests per {window_seconds} seconds.",
                        "retry_after": window_seconds
                    }
                )
            
            # Add current request
            self.requests[user_id][endpoint].append(now)
            
            return True
    
    async def cleanup_old_entries(self, max_age_hours: int = 24):
        """Cleanup old entries to prevent memory leak"""
        async with self.lock:
            now = datetime.utcnow()
            cutoff = now - timedelta(hours=max_age_hours)
            
            users_to_remove = []
            for user_id, endpoints in self.requests.items():
                endpoints_to_remove = []
                for endpoint, requests in endpoints.items():
                    # Remove old requests
                    endpoints[endpoint] = [
                        req_time for req_time in requests
                        if req_time > cutoff
                    ]
                    # Mark empty endpoints for removal
                    if not endpoints[endpoint]:
                        endpoints_to_remove.append(endpoint)
                
                # Remove empty endpoints
                for endpoint in endpoints_to_remove:
                    del endpoints[endpoint]
                
                # Mark empty users for removal
                if not endpoints:
                    users_to_remove.append(user_id)
            
            # Remove empty users
            for user_id in users_to_remove:
                del self.requests[user_id]


# Global rate limiter instance
rate_limiter = RateLimiter()


# Rate limit configurations for different endpoints
RATE_LIMITS = {
    "chat": {"max_requests": 30, "window_seconds": 60},  # 30 requests per minute
    "detect_disease": {"max_requests": 10, "window_seconds": 60},  # 10 requests per minute
    "chat_history": {"max_requests": 100, "window_seconds": 60},  # 100 requests per minute
}


async def apply_rate_limit(user_id: str, endpoint_key: str):
    """
    Apply rate limiting for a specific endpoint
    
    Args:
        user_id: User identifier
        endpoint_key: Key to identify endpoint rate limit config
        
    Raises:
        HTTPException: If rate limit exceeded
    """
    if endpoint_key not in RATE_LIMITS:
        return  # No rate limit configured
    
    config = RATE_LIMITS[endpoint_key]
    await rate_limiter.check_rate_limit(
        user_id=user_id,
        endpoint=endpoint_key,
        max_requests=config["max_requests"],
        window_seconds=config["window_seconds"]
    )
