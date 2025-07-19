from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from ..services.malicious_message_detector import detect_malicious_message
from ..auth import get_current_user

router = APIRouter()

class MessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    is_malicious: bool
    confidence_score: float
    threat_level: str
    detected_threats: list
    analysis: dict
    alert_message: str
    error: Optional[str] = None

@router.post("/detect-malicious", response_model=MessageResponse)
async def detect_malicious(request: MessageRequest, current_user: dict = Depends(get_current_user)):
    """
    Analyze a message for malicious content, scams, or phishing attempts.
    """
    try:
        # Validate input
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if len(request.message) > 10000:  # Limit message length
            raise HTTPException(status_code=400, detail="Message too long. Maximum 10,000 characters allowed.")
        
        # Detect malicious content
        result = detect_malicious_message(request.message.strip())
        
        return MessageResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}") 