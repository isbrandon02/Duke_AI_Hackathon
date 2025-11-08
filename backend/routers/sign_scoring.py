from fastapi import APIRouter, HTTPException
from typing import List
import numpy as np
from schemas.sign_scoring import (
    Landmark,
    Frame,
    AttemptRequest,
    AttemptResult,
    WordInfo,
)

router = APIRouter(prefix="/api", tags=["sign-scoring"])

# Reference templates: each word has one Frame with 21 landmarks
# These are sample reference poses - in production, these would come from trained models
REFERENCE_TEMPLATES = {
    "hello": Frame(
        landmarks=[
            # Hand landmarks in a "hello" wave pose
            # These are normalized coordinates (0-1 range)
            Landmark(x=0.5, y=0.3, z=0.0, v=1.0),  # 0: WRIST
            Landmark(x=0.52, y=0.28, z=-0.01, v=1.0),  # 1: THUMB_CMC
            Landmark(x=0.54, y=0.26, z=-0.02, v=1.0),  # 2: THUMB_MCP
            Landmark(x=0.56, y=0.24, z=-0.03, v=1.0),  # 3: THUMB_IP
            Landmark(x=0.58, y=0.22, z=-0.04, v=1.0),  # 4: THUMB_TIP
            Landmark(x=0.48, y=0.25, z=-0.01, v=1.0),  # 5: INDEX_FINGER_MCP
            Landmark(x=0.46, y=0.20, z=-0.02, v=1.0),  # 6: INDEX_FINGER_PIP
            Landmark(x=0.44, y=0.15, z=-0.03, v=1.0),  # 7: INDEX_FINGER_DIP
            Landmark(x=0.42, y=0.10, z=-0.04, v=1.0),  # 8: INDEX_FINGER_TIP
            Landmark(x=0.50, y=0.24, z=-0.01, v=1.0),  # 9: MIDDLE_FINGER_MCP
            Landmark(x=0.48, y=0.18, z=-0.02, v=1.0),  # 10: MIDDLE_FINGER_PIP
            Landmark(x=0.46, y=0.12, z=-0.03, v=1.0),  # 11: MIDDLE_FINGER_DIP
            Landmark(x=0.44, y=0.06, z=-0.04, v=1.0),  # 12: MIDDLE_FINGER_TIP
            Landmark(x=0.52, y=0.26, z=-0.01, v=1.0),  # 13: RING_FINGER_MCP
            Landmark(x=0.54, y=0.22, z=-0.02, v=1.0),  # 14: RING_FINGER_PIP
            Landmark(x=0.56, y=0.18, z=-0.03, v=1.0),  # 15: RING_FINGER_DIP
            Landmark(x=0.58, y=0.14, z=-0.04, v=1.0),  # 16: RING_FINGER_TIP
            Landmark(x=0.54, y=0.28, z=-0.01, v=1.0),  # 17: PINKY_MCP
            Landmark(x=0.56, y=0.26, z=-0.02, v=1.0),  # 18: PINKY_PIP
            Landmark(x=0.58, y=0.24, z=-0.03, v=1.0),  # 19: PINKY_DIP
            Landmark(x=0.60, y=0.22, z=-0.04, v=1.0),  # 20: PINKY_TIP
        ]
    ),
    "thank_you": Frame(
        landmarks=[
            # Hand landmarks in a "thank you" sign pose
            Landmark(x=0.5, y=0.4, z=0.0, v=1.0),  # 0: WRIST
            Landmark(x=0.48, y=0.38, z=-0.01, v=1.0),  # 1: THUMB_CMC
            Landmark(x=0.46, y=0.36, z=-0.02, v=1.0),  # 2: THUMB_MCP
            Landmark(x=0.44, y=0.34, z=-0.03, v=1.0),  # 3: THUMB_IP
            Landmark(x=0.42, y=0.32, z=-0.04, v=1.0),  # 4: THUMB_TIP
            Landmark(x=0.52, y=0.35, z=-0.01, v=1.0),  # 5: INDEX_FINGER_MCP
            Landmark(x=0.54, y=0.30, z=-0.02, v=1.0),  # 6: INDEX_FINGER_PIP
            Landmark(x=0.56, y=0.25, z=-0.03, v=1.0),  # 7: INDEX_FINGER_DIP
            Landmark(x=0.58, y=0.20, z=-0.04, v=1.0),  # 8: INDEX_FINGER_TIP
            Landmark(x=0.54, y=0.36, z=-0.01, v=1.0),  # 9: MIDDLE_FINGER_MCP
            Landmark(x=0.56, y=0.30, z=-0.02, v=1.0),  # 10: MIDDLE_FINGER_PIP
            Landmark(x=0.58, y=0.24, z=-0.03, v=1.0),  # 11: MIDDLE_FINGER_DIP
            Landmark(x=0.60, y=0.18, z=-0.04, v=1.0),  # 12: MIDDLE_FINGER_TIP
            Landmark(x=0.56, y=0.37, z=-0.01, v=1.0),  # 13: RING_FINGER_MCP
            Landmark(x=0.58, y=0.32, z=-0.02, v=1.0),  # 14: RING_FINGER_PIP
            Landmark(x=0.60, y=0.27, z=-0.03, v=1.0),  # 15: RING_FINGER_DIP
            Landmark(x=0.62, y=0.22, z=-0.04, v=1.0),  # 16: RING_FINGER_TIP
            Landmark(x=0.58, y=0.38, z=-0.01, v=1.0),  # 17: PINKY_MCP
            Landmark(x=0.60, y=0.34, z=-0.02, v=1.0),  # 18: PINKY_PIP
            Landmark(x=0.62, y=0.30, z=-0.03, v=1.0),  # 19: PINKY_DIP
            Landmark(x=0.64, y=0.26, z=-0.04, v=1.0),  # 20: PINKY_TIP
        ]
    ),
    "yes": Frame(
        landmarks=[
            # Hand landmarks in a "yes" nod pose
            Landmark(x=0.5, y=0.5, z=0.0, v=1.0),  # 0: WRIST
            Landmark(x=0.52, y=0.48, z=-0.01, v=1.0),  # 1: THUMB_CMC
            Landmark(x=0.54, y=0.46, z=-0.02, v=1.0),  # 2: THUMB_MCP
            Landmark(x=0.56, y=0.44, z=-0.03, v=1.0),  # 3: THUMB_IP
            Landmark(x=0.58, y=0.42, z=-0.04, v=1.0),  # 4: THUMB_TIP
            Landmark(x=0.48, y=0.45, z=-0.01, v=1.0),  # 5: INDEX_FINGER_MCP
            Landmark(x=0.46, y=0.40, z=-0.02, v=1.0),  # 6: INDEX_FINGER_PIP
            Landmark(x=0.44, y=0.35, z=-0.03, v=1.0),  # 7: INDEX_FINGER_DIP
            Landmark(x=0.42, y=0.30, z=-0.04, v=1.0),  # 8: INDEX_FINGER_TIP
            Landmark(x=0.50, y=0.46, z=-0.01, v=1.0),  # 9: MIDDLE_FINGER_MCP
            Landmark(x=0.48, y=0.40, z=-0.02, v=1.0),  # 10: MIDDLE_FINGER_PIP
            Landmark(x=0.46, y=0.34, z=-0.03, v=1.0),  # 11: MIDDLE_FINGER_DIP
            Landmark(x=0.44, y=0.28, z=-0.04, v=1.0),  # 12: MIDDLE_FINGER_TIP
            Landmark(x=0.52, y=0.47, z=-0.01, v=1.0),  # 13: RING_FINGER_MCP
            Landmark(x=0.54, y=0.42, z=-0.02, v=1.0),  # 14: RING_FINGER_PIP
            Landmark(x=0.56, y=0.37, z=-0.03, v=1.0),  # 15: RING_FINGER_DIP
            Landmark(x=0.58, y=0.32, z=-0.04, v=1.0),  # 16: RING_FINGER_TIP
            Landmark(x=0.54, y=0.48, z=-0.01, v=1.0),  # 17: PINKY_MCP
            Landmark(x=0.56, y=0.44, z=-0.02, v=1.0),  # 18: PINKY_PIP
            Landmark(x=0.58, y=0.40, z=-0.03, v=1.0),  # 19: PINKY_DIP
            Landmark(x=0.60, y=0.36, z=-0.04, v=1.0),  # 20: PINKY_TIP
        ]
    ),
}

# Sample words list
SUPPORTED_WORDS = [
    WordInfo(id="hello", display_name="Hello", difficulty="easy"),
    WordInfo(id="thank_you", display_name="Thank You", difficulty="medium"),
    WordInfo(id="yes", display_name="Yes", difficulty="easy"),
]


def compute_score(user_frame: Frame, reference_frame: Frame) -> float:
    """
    Compute similarity score between user frame and reference frame.
    Uses Mean Squared Error (MSE) and maps it to a 0-100 score.
    Weights landmarks by visibility to prioritize visible points.
    """
    # Ensure both frames have the same number of landmarks
    if len(user_frame.landmarks) != len(reference_frame.landmarks):
        return 0.0

    # Compute weighted MSE (weight by visibility)
    squared_errors = []
    total_weight = 0.0

    for user_lm, ref_lm in zip(user_frame.landmarks, reference_frame.landmarks):
        # Weight by minimum visibility (if either is not visible, reduce weight)
        weight = min(user_lm.v, ref_lm.v)
        if weight > 0.1:  # Only consider landmarks with some visibility
            error = (
                (user_lm.x - ref_lm.x) ** 2
                + (user_lm.y - ref_lm.y) ** 2
                + (user_lm.z - ref_lm.z) ** 2
            )
            squared_errors.append(error * weight)
            total_weight += weight

    if total_weight == 0.0:
        return 0.0

    # Compute weighted MSE
    weighted_mse = sum(squared_errors) / total_weight if total_weight > 0 else 1.0

    # Map MSE to 0-100 score using exponential decay
    # Lower MSE = higher score
    # MSE of 0.0 -> 100, MSE of 0.01 -> ~90, MSE of 0.1 -> ~37, MSE of 0.5 -> ~0
    score = max(0.0, min(100.0, 100 * np.exp(-10 * weighted_mse)))

    return float(score)


def get_tips(score: float, user_frame: Frame, reference_frame: Frame) -> List[str]:
    """
    Generate tips based on score and landmark differences.
    """
    tips = []

    if score < 75:
        if score < 50:
            tips.append("Keep practicing! Focus on the overall hand shape.")
        elif score < 75:
            tips.append("Almost there—slightly adjust finger positioning.")
        
        # Analyze specific landmark differences
        user_wrist = user_frame.landmarks[0]
        ref_wrist = reference_frame.landmarks[0]
        
        if abs(user_wrist.y - ref_wrist.y) > 0.1:
            tips.append("Adjust the vertical position of your hand.")
        
        if abs(user_wrist.x - ref_wrist.x) > 0.1:
            tips.append("Adjust the horizontal position of your hand.")

    if score >= 75 and score < 90:
        tips.append("Great job! Try to refine the details for a perfect score.")

    return tips


@router.get("/words", response_model=List[WordInfo])
async def get_words():
    """
    Get list of supported words for sign language practice.
    """
    return SUPPORTED_WORDS


@router.post("/attempts", response_model=AttemptResult)
async def evaluate_attempt(request: AttemptRequest):
    """
    Evaluate a user's sign language attempt against a reference template.
    """
    # Validate word exists
    if request.word not in REFERENCE_TEMPLATES:
        raise HTTPException(
            status_code=404,
            detail=f"Word '{request.word}' not found. Supported words: {list(REFERENCE_TEMPLATES.keys())}",
        )

    # Validate frames
    if not request.frames:
        raise HTTPException(status_code=400, detail="At least one frame is required")

    # Validate landmarks
    for i, frame in enumerate(request.frames):
        if len(frame.landmarks) != 21:
            raise HTTPException(
                status_code=400,
                detail=f"Frame {i} must have exactly 21 landmarks, got {len(frame.landmarks)}",
            )

    # Get reference template
    reference_frame = REFERENCE_TEMPLATES[request.word]

    # Average score across all frames
    scores = []
    for frame in request.frames:
        score = compute_score(frame, reference_frame)
        scores.append(score)

    avg_score = float(np.mean(scores))

    # Determine pass/fail (>=75 passes)
    passed = avg_score >= 75.0

    # Generate tips
    # Use the frame closest to reference for detailed tips
    best_frame_idx = int(np.argmax(scores))
    tips = get_tips(avg_score, request.frames[best_frame_idx], reference_frame)

    if passed and avg_score < 90:
        tips.append("Excellent work! Your sign is recognizable.")

    return AttemptResult(
        word=request.word,
        score=round(avg_score, 1),
        passed=passed,
        tips=tips,
    )

