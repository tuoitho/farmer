from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.exception_handlers import validation_exception_handler, general_exception_handler
from app.core.scheduler import initialize_scheduler, shutdown_scheduler
from app.api import auth, farms, weather, ai_chat, notifications
from app.models.api_response import success_response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    await connect_to_mongo()
    initialize_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Include routers
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(weather.router)
app.include_router(ai_chat.router)
app.include_router(notifications.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return success_response(
        data={
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION
        },
        message="Service is healthy"
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return success_response(
        data={
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs"
        },
        message=f"Welcome to {settings.APP_NAME}"
    )
