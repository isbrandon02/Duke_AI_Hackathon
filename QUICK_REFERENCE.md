# ASL Recognition Quick Reference Card

## 📊 Hand Landmarks Format

MediaPipe provides **21 landmarks per hand**:

```javascript
[
  { x: 0.5, y: 0.4, z: 0.0 },  // 0: WRIST
  { x: 0.52, y: 0.38, z: -0.01 },  // 1: THUMB_CMC
  // ... 19 more landmarks
]
```

**Coordinates**:
- `x`: Horizontal position (0-1, normalized)
- `y`: Vertical position (0-1, normalized)
- `z`: Depth relative to wrist (negative = closer to camera)
- `v`: Visibility (0-1, optional, 1 = fully visible)

---

## 🔌 API Endpoints Quick Reference

### 1. Predict Sign (ML-based)

**Endpoint**: `POST http://localhost:8000/api/sign-language/predict`

**Request**:
```json
{
  "hand_landmarks": {
    "landmarks": [
      {"x": 0.5, "y": 0.4, "z": 0.0},
      // ... 20 more (21 total)
    ]
  }
}
```

**Response**:
```json
{
  "predicted_sign": "A",
  "confidence": 0.95,
  "all_predictions": {
    "A": 0.95,
    "S": 0.03
  }
}
```

---

### 2. Score Sign Attempt (Template-based)

**Endpoint**: `POST http://localhost:8000/api/attempts`

**Request**:
```json
{
  "word": "A",
  "frames": [
    {
      "landmarks": [
        {"x": 0.5, "y": 0.4, "z": 0.0, "v": 1.0},
        // ... 20 more (21 total)
      ]
    }
  ]
}
```

**Response**:
```json
{
  "word": "A",
  "score": 87.5,
  "passed": true,
  "tips": ["Great job!"]
}
```

**Scoring**:
- 0-100 scale
- ≥75 = Pass
- <75 = Fail

---

### 3. Get Supported Words

**Endpoint**: `GET http://localhost:8000/api/words`

**Response**:
```json
[
  {
    "id": "hello",
    "display_name": "Hello",
    "difficulty": "easy"
  }
]
```

---

## 🚀 Quick Start Code Snippets

### Capture and Predict

```javascript
import { useSignRecognition } from './hooks/useSignRecognition';

const { predictSign, prediction } = useSignRecognition();

function handleLandmarks(landmarks) {
  if (landmarks && landmarks.length === 21) {
    predictSign(landmarks);
  }
}

// Display: {prediction}
```

---

### Score User's Attempt

```javascript
async function scoreAttempt(letter, landmarks) {
  const response = await fetch('http://localhost:8000/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      word: letter,
      frames: [{
        landmarks: landmarks.map(lm => ({
          x: lm.x, y: lm.y, z: lm.z || 0, v: 1.0
        }))
      }]
    })
  });
  
  return await response.json();
}

// Usage:
const result = await scoreAttempt('A', landmarks);
console.log(`Score: ${result.score}/100`);
```

---

## 🏗️ Key Frontend Components

### CameraFeed
- **Location**: `frontend/src/components/CameraFeed.jsx`
- **Purpose**: Captures video and detects hand landmarks
- **Output**: Calls `onLandmarksDetected(landmarks)` callback

### useCamera Hook
- **Location**: `frontend/src/hooks/useCamera.js`
- **Methods**: `startCamera()`, `stopCamera()`
- **State**: `isActive`, `error`, `videoRef`

### useSignRecognition Hook
- **Location**: `frontend/src/hooks/useSignRecognition.js`
- **Methods**: `predictSign(landmarks)`, `reset()`
- **State**: `prediction`, `confidence`, `isProcessing`, `error`

---

## 🧠 Backend Components

### Sign Language Model
- **Location**: `backend/models/sign_language_model.py`
- **Type**: Random Forest Classifier
- **Input**: 63 features (21 landmarks × 3 coordinates)
- **Output**: Predicted sign + confidence

### Scoring Algorithm
- **Location**: `backend/routers/sign_scoring.py`
- **Method**: `compute_score(user_frame, reference_frame)`
- **Algorithm**: Weighted MSE → Exponential mapping to 0-100

---

## 📝 Data Schemas

### Prediction Schema
```python
class Landmark(BaseModel):
    x: float
    y: float
    z: float

class HandLandmarks(BaseModel):
    landmarks: List[Landmark]  # 21 landmarks

class SignLanguageRequest(BaseModel):
    hand_landmarks: HandLandmarks
```

### Scoring Schema
```python
class Landmark(BaseModel):
    x: float
    y: float
    z: float
    v: float  # visibility

class Frame(BaseModel):
    landmarks: List[Landmark]  # 21 landmarks

class AttemptRequest(BaseModel):
    word: str
    frames: List[Frame]
```

---

## ⚙️ Performance Settings

### Frontend Throttling
```javascript
THROTTLE_MS = 100;     // Max 10 requests/second
FRAME_SKIP = 3;        // Process every 3rd frame
```

### MediaPipe Settings
```javascript
{
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
}
```

---

## 🎯 ASL Alphabet Implementation Checklist

- [ ] **Step 1**: Collect training data for each letter (50-100 samples)
- [ ] **Step 2**: Create reference templates in `sign_scoring.py`
- [ ] **Step 3**: Train ML model with collected data
- [ ] **Step 4**: Add alphabet letters to `SUPPORTED_WORDS`
- [ ] **Step 5**: Build learning interface component
- [ ] **Step 6**: Test and refine with users

---

## 🛠️ Development Commands

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

---

## 🔍 Debugging Tips

### Check Landmarks
```javascript
console.log('Landmarks count:', landmarks.length);
console.log('First landmark:', landmarks[0]);
```

### Test API Directly
```bash
curl -X POST http://localhost:8000/api/sign-language/predict \
  -H "Content-Type: application/json" \
  -d '{"hand_landmarks": {"landmarks": [...]}}'
```

### View API Docs
- FastAPI auto-docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

---

## 📚 Important Files

| Purpose | File Path |
|---------|-----------|
| Main documentation | `FRONTEND_BACKEND_DATA_GUIDE.md` |
| Code examples | `examples/asl_integration_examples.js` |
| Architecture diagram | `ARCHITECTURE_DIAGRAM.md` |
| Frontend camera | `frontend/src/components/CameraFeed.jsx` |
| Frontend recognition | `frontend/src/components/SignRecognition.jsx` |
| Backend prediction | `backend/routers/sign_language.py` |
| Backend scoring | `backend/routers/sign_scoring.py` |
| ML model | `backend/models/sign_language_model.py` |

---

## 🆘 Common Issues & Solutions

### Issue: No landmarks detected
**Solution**: Ensure good lighting, hand visible, camera permissions granted

### Issue: Low confidence predictions
**Solution**: Collect more training data, improve lighting, hold hand steady

### Issue: CORS errors
**Solution**: Backend already has CORS enabled for all origins in `main.py`

### Issue: Model not trained
**Solution**: Model uses dummy data initially. Collect real ASL data and train.

### Issue: Camera not starting
**Solution**: Check browser permissions, use HTTPS in production

---

## 📊 Landmark Index Reference

```
Fingers (tips to base):
- Thumb:  4, 3, 2, 1
- Index:  8, 7, 6, 5
- Middle: 12, 11, 10, 9
- Ring:   16, 15, 14, 13
- Pinky:  20, 19, 18, 17
- Wrist:  0
```

---

## 🎨 Example Use Cases

### 1. Real-time Prediction
```javascript
<CameraFeed onLandmarksDetected={(lm) => predictSign(lm)} />
```

### 2. Learning Mode
```javascript
<CameraFeed onLandmarksDetected={(lm) => scoreAttempt('A', lm)} />
```

### 3. Data Collection
```javascript
const collector = new ASLDataCollector('A');
collector.start();
// Collect samples...
collector.exportData();
```

---

## 🔐 Security Notes

- Backend uses Firebase Admin SDK for authentication
- CORS enabled for development
- No API keys stored in frontend code
- Service account credentials in `.gitignore`

---

## 📞 Need More Help?

- Full guide: `FRONTEND_BACKEND_DATA_GUIDE.md`
- Examples: `examples/asl_integration_examples.js`
- Architecture: `ARCHITECTURE_DIAGRAM.md`
- API docs: `http://localhost:8000/docs`
