from pydantic import BaseModel
from typing import List


class Landmark(BaseModel):
    """Single hand landmark point"""
    x: float
    y: float
    z: float


class HandLandmarks(BaseModel):
    """Array of 21 hand landmarks"""
    landmarks: List[Landmark]


class SignLanguageRequest(BaseModel):
    """Request body for sign language prediction"""
    hand_landmarks: HandLandmarks


class SignLanguageResponse(BaseModel):
    """Response with predicted sign and confidence"""
    predicted_sign: str
    confidence: float
    all_predictions: dict = None  # Optional: return all class probabilities

