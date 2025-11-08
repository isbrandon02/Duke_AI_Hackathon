# ASL Recognition System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  (Browser - React Frontend)                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CAMERA & MEDIAPIPE                           │
│  • Access webcam (getUserMedia)                                  │
│  • MediaPipe Hands detects 21 landmarks                          │
│  • Output: Array of {x, y, z} coordinates                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FRONTEND DATA PROCESSING                       │
│  • Throttle requests (10 fps)                                    │
│  • Format landmarks for API                                      │
│  • Add visibility scores                                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ENDPOINTS                               │
│  Two options:                                                    │
│  1. POST /api/sign-language/predict → Predict sign              │
│  2. POST /api/attempts → Score against reference                │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
         ┌─────────────────┐  ┌─────────────────┐
         │   ML MODEL      │  │  SCORING ENGINE │
         │ (Random Forest) │  │ (MSE Algorithm) │
         └─────────────────┘  └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API RESPONSE                                │
│  • Predicted sign + confidence                                   │
│  • OR Score (0-100) + tips                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DISPLAY RESULTS                             │
│  • Show prediction/score                                         │
│  • Provide feedback                                              │
│  • Progress to next letter                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Details

### 1. Hand Landmark Detection (Frontend)

```
Camera Stream → MediaPipe Hands Model → 21 Landmarks

Each landmark:
┌──────────────────────┐
│ x: 0.5  (normalized) │
│ y: 0.4  (normalized) │
│ z: 0.0  (depth)      │
└──────────────────────┘
```

### 2. API Request Formats

#### Prediction API Request

```json
POST /api/sign-language/predict

{
  "hand_landmarks": {
    "landmarks": [
      {"x": 0.5, "y": 0.4, "z": 0.0},
      {"x": 0.52, "y": 0.38, "z": -0.01},
      ... (21 total)
    ]
  }
}
```

#### Scoring API Request

```json
POST /api/attempts

{
  "word": "A",
  "frames": [
    {
      "landmarks": [
        {"x": 0.5, "y": 0.4, "z": 0.0, "v": 1.0},
        {"x": 0.52, "y": 0.38, "z": -0.01, "v": 1.0},
        ... (21 total)
      ]
    }
  ]
}
```

### 3. Backend Processing

#### For Prediction:
```
Landmarks → Preprocess → Scale Features → ML Model → Prediction
                                                         ↓
                                              Sign + Confidence
```

#### For Scoring:
```
User Landmarks + Reference Template → Compute MSE → Map to Score
                                                         ↓
                                            Score + Pass/Fail + Tips
```

## MediaPipe Hand Landmarks Map

```
         8   12  16  20    (fingertips)
         │   │   │   │
         7   11  15  19
         │   │   │   │
         6   10  14  18
         │   │   │   │
    4    5   9   13  17    (knuckles)
    │    └───┴───┴───┘
    3         │
    │         │
    2         │
    │         │
    1         │
    └─────────0           (wrist)
   (thumb)
```

Landmark indices:
```
0:  WRIST
1:  THUMB_CMC (base)
2:  THUMB_MCP
3:  THUMB_IP
4:  THUMB_TIP

5:  INDEX_FINGER_MCP (knuckle)
6:  INDEX_FINGER_PIP
7:  INDEX_FINGER_DIP
8:  INDEX_FINGER_TIP

9:  MIDDLE_FINGER_MCP
10: MIDDLE_FINGER_PIP
11: MIDDLE_FINGER_DIP
12: MIDDLE_FINGER_TIP

13: RING_FINGER_MCP
14: RING_FINGER_PIP
15: RING_FINGER_DIP
16: RING_FINGER_TIP

17: PINKY_MCP
18: PINKY_PIP
19: PINKY_DIP
20: PINKY_TIP
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     App.jsx (Main)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SignRecognition Component                       │
│  • Manages camera state                                      │
│  • Handles start/stop                                        │
│  • Coordinates detection & display                           │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    ┌──────────────────┐          ┌──────────────────┐
    │  CameraFeed      │          │  Custom Hooks    │
    │  Component       │          │                  │
    │                  │          │  • useCamera     │
    │  • Video stream  │          │  • useSignRec... │
    │  • MediaPipe     │          └──────────────────┘
    │  • Draw overlay  │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │  Landmarks       │
    │  (x, y, z) * 21  │
    └──────────────────┘
```

## Backend API Structure

```
main.py (FastAPI)
│
├── /api/sign-language/predict
│   ├── Router: sign_language.py
│   ├── Service: sign_language_service.py
│   └── Model: sign_language_model.py (Random Forest)
│
├── /api/attempts
│   ├── Router: sign_scoring.py
│   └── Scoring Algorithm: compute_score()
│
└── /api/words
    └── Returns list of supported signs
```

## Key Files Reference

### Frontend Files
```
frontend/
├── src/
│   ├── components/
│   │   ├── CameraFeed.jsx         # Video + MediaPipe
│   │   └── SignRecognition.jsx    # Main component
│   └── hooks/
│       ├── useCamera.js           # Camera management
│       └── useSignRecognition.js  # API communication
```

### Backend Files
```
backend/
├── routers/
│   ├── sign_language.py           # Prediction endpoint
│   └── sign_scoring.py            # Scoring endpoint
├── services/
│   └── sign_language_service.py   # Business logic
├── models/
│   └── sign_language_model.py     # ML model
└── schemas/
    ├── sign_language.py           # Prediction schemas
    └── sign_scoring.py            # Scoring schemas
```

## Workflow Example: ASL Alphabet Learning

```
Step 1: Start
┌────────────────────┐
│ User clicks        │
│ "Start Camera"     │
└────────────────────┘
          ↓
Step 2: Capture
┌────────────────────┐
│ Camera activates   │
│ MediaPipe detects  │
│ hand landmarks     │
└────────────────────┘
          ↓
Step 3: Display Target
┌────────────────────┐
│ Show target letter │
│ (e.g., "A")        │
└────────────────────┘
          ↓
Step 4: Collect Frames
┌────────────────────┐
│ Collect 5-10       │
│ frames of user's   │
│ hand sign          │
└────────────────────┘
          ↓
Step 5: Score
┌────────────────────┐
│ POST /api/attempts │
│ with frames        │
└────────────────────┘
          ↓
Step 6: Feedback
┌────────────────────┐
│ Show score & tips  │
│ If pass: next      │
│ If fail: retry     │
└────────────────────┘
          ↓
Step 7: Progress
┌────────────────────┐
│ Move to next       │
│ letter (B, C, ...) │
└────────────────────┘
```

## Scoring Algorithm Details

```
Input: User Landmarks + Reference Landmarks

Step 1: For each landmark pair:
        error = (x_user - x_ref)² + (y_user - y_ref)² + (z_user - z_ref)²
        weighted_error = error × min(visibility_user, visibility_ref)

Step 2: weighted_MSE = sum(weighted_errors) / sum(weights)

Step 3: score = 100 × exp(-10 × weighted_MSE)

Result: Score between 0-100
        ≥75 = Pass
        <75 = Fail
```

## Performance Optimizations

### Throttling Strategy
```
MediaPipe: 30 fps detection
     ↓
Frame Skip: Process every 3rd frame
     ↓
Time Throttle: Max 10 requests/second
     ↓
Backend: Processes ~10 fps effectively
```

### Multi-Frame Averaging
```
Collect frames: [F1, F2, F3, ..., F10]
     ↓
Score each: [S1, S2, S3, ..., S10]
     ↓
Average: Final_Score = mean([S1, S2, ..., S10])
     ↓
Result: More stable, accurate scoring
```

## Extension Points for ASL Alphabet

### 1. Add Reference Templates
```python
# In sign_scoring.py
REFERENCE_TEMPLATES = {
    "A": Frame(landmarks=[...]),  # Fist, thumb on side
    "B": Frame(landmarks=[...]),  # Flat hand
    "C": Frame(landmarks=[...]),  # Curved hand
    # ... add all 26 letters
}
```

### 2. Train ML Model
```python
# Collect data for each letter
# Train model with real ASL dataset
model.train(X_train, y_train)  # X: landmarks, y: letters
model.save()
```

### 3. Add Learning Interface
```javascript
// Frontend component
<ASLAlphabetLearning
  letters={['A', 'B', 'C', ..., 'Z']}
  onComplete={handleCompletion}
/>
```

## Data Validation

### Frontend Validation
```javascript
if (landmarks.length !== 21) {
  console.error('Invalid: Expected 21 landmarks');
  return;
}
```

### Backend Validation
```python
if len(frame.landmarks) != 21:
    raise HTTPException(
        status_code=400,
        detail="Must have exactly 21 landmarks"
    )
```

## Error Handling Flow

```
Request → Validation → Processing → Response
            │             │
            ├─ Invalid ───┤
            │             │
            └─ Error ─────┴→ HTTP Error Response
                             (400, 404, 500)
                                  ↓
                          Frontend catches error
                                  ↓
                          Display user message
```
