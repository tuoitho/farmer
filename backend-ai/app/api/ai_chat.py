from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Dict, Any, Optional

from app.models.ai_chat import (
    DiseaseAnalysisResponse,
    DiseaseDetectionResult,
    ChatRequest,
    ChatResponse,
    AIAdviceResponse,
    DiseasePrediction,
    ChatWithImageRequest
)
from app.models.user import UserInDB
from app.models.api_response import APIResponse, success_response, error_response
from app.services.disease_detection_service import DiseaseDetectionService
from app.services.clova_service import ClovaStudioService
from app.services.chat_history_service import ChatHistoryService
from app.core.dependencies import get_current_user
from app.middleware.rate_limit import apply_rate_limit


router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

# Initialize services
disease_service = DiseaseDetectionService()
clova_service = ClovaStudioService()
chat_history_service = ChatHistoryService()


@router.post(
    "/detect-disease",
    response_model=APIResponse[DiseaseAnalysisResponse],
    status_code=status.HTTP_200_OK
)
async def detect_disease(
    image: UploadFile = File(..., description="Plant image for disease detection"),
    additional_context: Optional[str] = Form(None, description="Additional context or question"),
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Detect plant disease from uploaded image and get AI advice.
    
    Workflow:
    1. Upload plant image
    2. AI detects disease from image
    3. Disease name is sent to Clova Studio
    4. Clova Studio returns advice and treatment information
    
    - **image**: Plant image file (JPG, PNG)
    - **additional_context**: Optional additional questions or context
    
    Rate limit: 10 requests per minute
    """
    try:
        # Apply rate limiting
        await apply_rate_limit(str(current_user.id), "detect_disease")
        # Validate file type
        if not image.content_type or not image.content_type.startswith("image/"):
            return error_response(
                message="File must be an image (JPG, PNG, etc.)",
                code="INVALID_FILE_TYPE"
            )
        
        # Read image bytes
        image_bytes = await image.read()
        
        # Check file size (max 10MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            return error_response(
                message="Image file too large. Maximum size is 10MB",
                code="FILE_TOO_LARGE"
            )
        
        # Step 1: Detect disease from image
        try:
            detection_result = disease_service.predict_disease(image_bytes)
        except Exception as e:
            return error_response(
                message=f"Disease detection failed: {str(e)}",
                code="DETECTION_FAILED"
            )
        
        # Step 2: Get AI advice from Clova Studio
        ai_advice = None
        clova_error = None
        
        try:
            clova_response = await clova_service.get_disease_advice(
                disease_name=detection_result["disease_name"],
                confidence=detection_result["confidence"],
                request_id=current_user.clova_request_id,
                additional_context=additional_context
            )
            
            if clova_response.get("success"):
                ai_advice = clova_response.get("advice", "")
            else:
                clova_error = clova_response.get("error", "Unknown error")
                
        except Exception as e:
            clova_error = str(e)
        
        # Build response
        response_data = DiseaseAnalysisResponse(
            detection=DiseaseDetectionResult(
                disease_name=detection_result["disease_name"],
                confidence=detection_result["confidence"],
                top_predictions=[
                    DiseasePrediction(**pred) 
                    for pred in detection_result.get("top_predictions", [])
                ]
            ),
            ai_advice=ai_advice,
            success=ai_advice is not None,
            error=clova_error
        )
        
        return success_response(
            data=response_data.model_dump(),
            message="Disease analysis completed successfully" if ai_advice else "Disease detected but AI advice unavailable"
        )
        
    except Exception as e:
        return error_response(
            message=f"Error processing request: {str(e)}",
            code="PROCESSING_ERROR"
        )


@router.post(
    "/chat",
    response_model=APIResponse[ChatResponse],
    status_code=status.HTTP_200_OK
)
async def chat_with_ai(
    chat_request: ChatRequest,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    General chat with AI assistant about agriculture and plant diseases.
    User's chat history is automatically loaded and saved.
    
    - **message**: User's question or message
    - **conversation_history**: Optional previous conversation for context (if not provided, uses saved history)
    
    Rate limit: 30 requests per minute
    """
    try:
        # Apply rate limiting
        await apply_rate_limit(str(current_user.id), "chat")
        
        user_id = str(current_user.id)
        
        # Load conversation history from database if not provided
        if chat_request.conversation_history:
            # Use provided history with max limit validation
            # Limit to last 30 messages to prevent token overflow
            conversation = chat_request.conversation_history[-30:] if len(chat_request.conversation_history) > 30 else chat_request.conversation_history
            history = [
                {"role": msg.role, "content": msg.content}
                for msg in conversation
            ]
        else:
            # Load from database with conservative limit
            history = await chat_history_service.get_conversation_for_api(user_id, max_messages=30)
        
        # Get response from Clova Studio with user's request_id
        response = await clova_service.chat(
            message=chat_request.message,
            request_id=current_user.clova_request_id,
            conversation_history=history
        )
        
        if response.get("success"):
            ai_message = response.get("content", "")
            
            # Save conversation to database
            await chat_history_service.add_conversation(
                user_id=user_id,
                user_message=chat_request.message,
                assistant_message=ai_message
            )
            
            chat_response = ChatResponse(
                message=ai_message,
                success=True,
                error=None
            )
            
            return success_response(
                data=chat_response.model_dump(),
                message="Chat response generated successfully"
            )
        else:
            return error_response(
                message=response.get("error", "Failed to get AI response"),
                code="CHAT_FAILED"
            )
            
    except Exception as e:
        return error_response(
            message=f"Error in chat: {str(e)}",
            code="CHAT_ERROR"
        )


@router.post(
    "/chat-with-image",
    response_model=APIResponse[ChatResponse],
    status_code=status.HTTP_200_OK
)
async def chat_with_image(
    message: str = Form(..., description="User's message or question"),
    image: Optional[UploadFile] = File(None, description="Optional plant image for disease detection"),
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Chat with AI assistant with optional image for disease detection.
    Can be used for text-only chat or chat with image analysis.
    
    Workflow (with image):
    1. User uploads image with a question/message
    2. System detects disease from image
    3. AI generates response based on both the image analysis and user's message
    4. Conversation is saved to chat history
    
    Workflow (without image):
    1. User sends text message only
    2. AI generates response based on user's message and chat history
    3. Conversation is saved to chat history
    
    - **message**: User's question or comment (required)
    - **image**: Plant image file (JPG, PNG) - optional
    
    Rate limit: 20 requests per minute
    
    Examples:
    - With image: message="Cây cà chua của tôi bị sao vậy?" + image file
    - Without image: message="Cách chăm sóc cây lúa vào mùa khô?"
    """
    try:
        # Apply rate limiting
        await apply_rate_limit(str(current_user.id), "chat_with_image")
        
        user_id = str(current_user.id)
        detection_result = None
        detection_error = None
        
        # Process image if provided
        if image is not None:
            # Validate file type
            if not image.content_type or not image.content_type.startswith("image/"):
                return error_response(
                    message="File must be an image (JPG, PNG, etc.)",
                    code="INVALID_FILE_TYPE"
                )
            
            # Read image bytes
            image_bytes = await image.read()
            
            # Check file size (max 10MB)
            if len(image_bytes) > 10 * 1024 * 1024:
                return error_response(
                    message="Image file too large. Maximum size is 10MB",
                    code="FILE_TOO_LARGE"
                )
            
            # Detect disease from image
            try:
                detection_result = disease_service.predict_disease(image_bytes)
            except Exception as e:
                detection_error = str(e)
        
        # Build message with detection results if image was provided
        if image is not None and detection_result:
            disease_info = f"\n\n[Kết quả phân tích ảnh: Phát hiện {detection_result['disease_name']} với độ tin cậy {detection_result['confidence']*100:.1f}%]"
            enhanced_message = message + disease_info
        elif image is not None and detection_error:
            enhanced_message = message + f"\n\n[Không thể phân tích ảnh: {detection_error}]"
        else:
            enhanced_message = message
        
        # Step 3: Load conversation history
        history = await chat_history_service.get_conversation_for_api(user_id, max_messages=20)
        
        # Step 4: Get AI response with enhanced context
        response = await clova_service.chat(
            message=enhanced_message,
            request_id=current_user.clova_request_id,
            conversation_history=history
        )
        
        if response.get("success"):
            ai_message = response.get("content", "")
            
            # Save conversation to database (mark if image was sent)
            user_message_to_save = f"{message} [đã gửi ảnh]" if image is not None else message
            await chat_history_service.add_conversation(
                user_id=user_id,
                user_message=user_message_to_save,
                assistant_message=ai_message
            )
            
            # Build response with detection results
            chat_response = ChatResponse(
                message=ai_message,
                success=True,
                error=None,
                has_image_analysis=detection_result is not None,
                disease_detection=DiseaseDetectionResult(
                    disease_name=detection_result["disease_name"],
                    confidence=detection_result["confidence"],
                    top_predictions=[
                        DiseasePrediction(**pred) 
                        for pred in detection_result.get("top_predictions", [])
                    ]
                ) if detection_result else None
            )
            
            return success_response(
                data=chat_response.model_dump(),
                message="Chat with image analysis completed successfully"
            )
        else:
            return error_response(
                message=response.get("error", "Failed to get AI response"),
                code="CHAT_FAILED"
            )
            
    except Exception as e:
        return error_response(
            message=f"Error in chat with image: {str(e)}",
            code="CHAT_WITH_IMAGE_ERROR"
        )


@router.get(
    "/chat-history",
    response_model=APIResponse[Dict[str, Any]],
    status_code=status.HTTP_200_OK
)
async def get_chat_history(
    limit: Optional[int] = 50,
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get user's chat history.
    
    - **limit**: Maximum number of messages to return (default 50)
    
    Rate limit: 100 requests per minute
    """
    try:
        # Apply rate limiting
        await apply_rate_limit(str(current_user.id), "chat_history")
        
        user_id = str(current_user.id)
        history = await chat_history_service.get_user_chat_history(user_id, limit=limit)
        
        if history:
            response_data = {
                "messages": [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "timestamp": msg.timestamp.isoformat()
                    }
                    for msg in history.messages
                ],
                "total_messages": len(history.messages),
                "last_updated": history.updated_at.isoformat()
            }
            return success_response(
                data=response_data,
                message="Chat history retrieved successfully"
            )
        else:
            return success_response(
                data={"messages": [], "total_messages": 0},
                message="No chat history found"
            )
            
    except Exception as e:
        return error_response(
            message=f"Error retrieving chat history: {str(e)}",
            code="HISTORY_ERROR"
        )


@router.delete(
    "/chat-history",
    response_model=APIResponse[Dict[str, bool]],
    status_code=status.HTTP_200_OK
)
async def clear_chat_history(
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Clear all chat history for the current user.
    """
    try:
        user_id = str(current_user.id)
        success = await chat_history_service.clear_user_history(user_id)
        
        if success:
            return success_response(
                data={"cleared": True},
                message="Chat history cleared successfully"
            )
        else:
            return error_response(
                message="Failed to clear chat history",
                code="CLEAR_FAILED"
            )
            
    except Exception as e:
        return error_response(
            message=f"Error clearing chat history: {str(e)}",
            code="CLEAR_ERROR"
        )


@router.get(
    "/health",
    response_model=APIResponse[Dict[str, bool]],
    status_code=status.HTTP_200_OK
)
async def check_ai_health(
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Check if AI services are available and healthy.
    
    Returns status of:
    - Disease detection model
    - Clova Studio API connection
    """
    health_status = {
        "disease_detection_model": disease_service.model is not None,
        "clova_studio_configured": bool(clova_service.api_key)
    }
    
    all_healthy = all(health_status.values())
    
    return success_response(
        data=health_status,
        message="All AI services are healthy" if all_healthy else "Some AI services are unavailable"
    )
