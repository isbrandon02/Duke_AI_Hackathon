from ..models.sign_language_model import get_model
from ..schemas.sign_language import SignLanguageRequest, SignLanguageResponse


class SignLanguageService:
    """Service for sign language recognition"""
    
    def __init__(self):
        self.model = get_model()
    
    def predict_sign(self, request: SignLanguageRequest) -> SignLanguageResponse:
        """Predict sign from hand landmarks"""
        landmarks = request.hand_landmarks.landmarks
        
        # Validate we have 21 landmarks
        if len(landmarks) != 21:
            return SignLanguageResponse(
                predicted_sign="INVALID",
                confidence=0.0,
                all_predictions={}
            )
        
        # Get prediction from model
        predicted_sign, confidence, all_predictions = self.model.predict(landmarks)
        
        return SignLanguageResponse(
            predicted_sign=predicted_sign,
            confidence=confidence,
            all_predictions=all_predictions
        )


# Global service instance
_service_instance = None

def get_service():
    """Get or create service instance (singleton)"""
    global _service_instance
    if _service_instance is None:
        _service_instance = SignLanguageService()
    return _service_instance

