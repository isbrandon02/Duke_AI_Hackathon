from fastapi import APIRouter, HTTPException
from ..schemas.sign_language import SignLanguageRequest, SignLanguageResponse
from ..services.sign_language_service import get_service

router = APIRouter(prefix="/api/sign-language", tags=["sign-language"])


@router.post("/predict", response_model=SignLanguageResponse)
async def predict_sign(request: SignLanguageRequest):
    """
    Predict sign language from hand landmarks.
    
    Accepts 21 hand landmarks (MediaPipe format) and returns
    the predicted sign with confidence score.
    """
    try:
        service = get_service()
        response = service.predict_sign(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

