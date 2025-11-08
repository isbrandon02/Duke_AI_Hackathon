# Frontend-Backend Data Integration Guide for ASL Recognition

## Overview

This guide explains how the frontend captures hand signs using MediaPipe, formats the data, and sends it to the backend for interpretation and scoring. This system is designed to recognize and score ASL (American Sign Language) alphabet signs.

## Table of Contents

1. [Frontend Architecture](#frontend-architecture)
2. [Data Flow](#data-flow)
3. [Data Format Specifications](#data-format-specifications)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Integration Examples](#integration-examples)
6. [ASL Alphabet Implementation](#asl-alphabet-implementation)

---

## Frontend Architecture

### Key Components

#### 1. **CameraFeed Component** (`frontend/src/components/CameraFeed.jsx`)

**Purpose**: Captures video from the user's camera and detects hand landmarks using MediaPipe Hands.

**Key Features**:
- Initializes MediaPipe Hands model to detect 21 hand landmarks
- Processes video frames in real-time
- Draws hand skeleton overlay on video feed
- Extracts normalized landmark coordinates (x, y, z)

**Configuration**:
```javascript
hands.setOptions({
  maxNumHands: 1,           // Detect one hand at a time
  modelComplexity: 1,       // Balance between speed and accuracy
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

**Output**: Array of 21 landmarks, each with coordinates:
- `x`: Normalized horizontal position (0-1)
- `y`: Normalized vertical position (0-1)
- `z`: Depth information (relative to wrist)

#### 2. **useCamera Hook** (`frontend/src/hooks/useCamera.js`)

**Purpose**: Manages camera access and video stream lifecycle.

**Features**:
- Requests user camera permission
- Manages video stream state
- Handles cleanup when camera is stopped

#### 3. **useSignRecognition Hook** (`frontend/src/hooks/useSignRecognition.js`)

**Purpose**: Handles communication with backend prediction API.

**Features**:
- Throttles API requests (processes every 3rd frame, max 10 fps)
- Formats landmark data for backend
- Manages prediction state and results

---

## Data Flow

```
User's Hand
    ↓
Camera Feed (Video Stream)
    ↓
MediaPipe Hands Model
    ↓
21 Hand Landmarks (x, y, z coordinates)
    ↓
Frontend Hook (useSignRecognition)
    ↓
HTTP POST Request
    ↓
Backend API (/api/sign-language/predict or /api/attempts)
    ↓
ML Model / Scoring Algorithm
    ↓
Response (predicted sign, confidence, score)
    ↓
UI Display
```

---

## Data Format Specifications

### MediaPipe Hand Landmarks

MediaPipe detects **21 landmarks** per hand:

```
0:  WRIST
1:  THUMB_CMC
2:  THUMB_MCP
3:  THUMB_IP
4:  THUMB_TIP
5:  INDEX_FINGER_MCP
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

### Frontend Data Format (from MediaPipe)

```javascript
// Raw landmarks from MediaPipe
const landmarks = [
  { x: 0.5, y: 0.4, z: 0.0 },     // WRIST
  { x: 0.52, y: 0.38, z: -0.01 }, // THUMB_CMC
  // ... 19 more landmarks
];
```

### Backend Request Format

#### For Sign Prediction (`/api/sign-language/predict`)

```javascript
{
  "hand_landmarks": {
    "landmarks": [
      { "x": 0.5, "y": 0.4, "z": 0.0 },
      { "x": 0.52, "y": 0.38, "z": -0.01 },
      // ... 19 more landmarks (total 21)
    ]
  }
}
```

**Schema** (`backend/schemas/sign_language.py`):
```python
class Landmark(BaseModel):
    x: float  # Normalized x-coordinate (0-1)
    y: float  # Normalized y-coordinate (0-1)
    z: float  # Depth relative to wrist

class HandLandmarks(BaseModel):
    landmarks: List[Landmark]  # Must be exactly 21 landmarks

class SignLanguageRequest(BaseModel):
    hand_landmarks: HandLandmarks
```

#### For Scoring Attempts (`/api/attempts`)

```javascript
{
  "word": "hello",  // or "A", "B", "C" for alphabet
  "frames": [
    {
      "landmarks": [
        { "x": 0.5, "y": 0.4, "z": 0.0, "v": 1.0 },
        { "x": 0.52, "y": 0.38, "z": -0.01, "v": 1.0 },
        // ... 19 more landmarks (total 21)
      ]
    }
    // Can include multiple frames for averaging
  ]
}
```

**Schema** (`backend/schemas/sign_scoring.py`):
```python
class Landmark(BaseModel):
    x: float     # Normalized x-coordinate (0-1)
    y: float     # Normalized y-coordinate (0-1)
    z: float     # Depth relative to wrist
    v: float     # Visibility score (0-1, 1 = fully visible)

class Frame(BaseModel):
    landmarks: List[Landmark]  # Must be exactly 21 landmarks

class AttemptRequest(BaseModel):
    word: str           # Target sign (e.g., "A", "B", "hello")
    frames: List[Frame] # One or more frames to average
```

---

## Backend API Endpoints

### 1. Sign Language Prediction API

**Endpoint**: `POST /api/sign-language/predict`

**Purpose**: Predict which sign is being shown based on hand landmarks.

**Request**:
```json
{
  "hand_landmarks": {
    "landmarks": [
      { "x": 0.5, "y": 0.4, "z": 0.0 },
      // ... 20 more landmarks
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
    "S": 0.03,
    "T": 0.02
  }
}
```

**Implementation**: Uses a Random Forest classifier trained on ASL alphabet data. Currently uses dummy data but can be trained with real ASL datasets.

### 2. Sign Scoring API

**Endpoint**: `POST /api/attempts`

**Purpose**: Score a user's attempt at making a specific sign against a reference template.

**Request**:
```json
{
  "word": "hello",
  "frames": [
    {
      "landmarks": [
        { "x": 0.5, "y": 0.4, "z": 0.0, "v": 1.0 },
        // ... 20 more landmarks
      ]
    }
  ]
}
```

**Response**:
```json
{
  "word": "hello",
  "score": 87.5,
  "passed": true,
  "tips": [
    "Great job! Try to refine the details for a perfect score."
  ]
}
```

**Scoring Algorithm**:
- Computes weighted Mean Squared Error (MSE) between user landmarks and reference
- Weights landmarks by visibility (prioritizes visible points)
- Maps MSE to 0-100 score using exponential decay: `score = 100 * exp(-10 * MSE)`
- Passing threshold: 75 points

### 3. Get Supported Words

**Endpoint**: `GET /api/words`

**Purpose**: Get list of signs that can be scored.

**Response**:
```json
[
  {
    "id": "hello",
    "display_name": "Hello",
    "difficulty": "easy"
  },
  {
    "id": "thank_you",
    "display_name": "Thank You",
    "difficulty": "medium"
  }
]
```

---

## Integration Examples

### Example 1: Capturing and Sending Hand Landmarks

```javascript
// In a React component
import { useSignRecognition } from '../hooks/useSignRecognition';
import CameraFeed from '../components/CameraFeed';

function MyComponent() {
  const { predictSign, prediction, confidence } = useSignRecognition();
  
  const handleLandmarksDetected = (landmarks) => {
    // landmarks is an array of 21 objects with x, y, z properties
    if (landmarks && landmarks.length === 21) {
      predictSign(landmarks);
    }
  };
  
  return (
    <div>
      <CameraFeed onLandmarksDetected={handleLandmarksDetected} />
      {prediction && (
        <p>Detected: {prediction} ({(confidence * 100).toFixed(1)}%)</p>
      )}
    </div>
  );
}
```

### Example 2: Scoring a Hand Sign Attempt

```javascript
async function scoreHandSign(word, landmarks) {
  // Add visibility to landmarks (1.0 = fully visible)
  const landmarksWithVisibility = landmarks.map(lm => ({
    x: lm.x,
    y: lm.y,
    z: lm.z || 0,
    v: 1.0  // Assume all landmarks are visible
  }));
  
  const response = await fetch('http://localhost:8000/api/attempts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      word: word,  // e.g., "A", "B", "hello"
      frames: [
        {
          landmarks: landmarksWithVisibility
        }
      ]
    }),
  });
  
  const result = await response.json();
  console.log(`Score: ${result.score}/100`);
  console.log(`Passed: ${result.passed}`);
  console.log(`Tips: ${result.tips.join(', ')}`);
  
  return result;
}
```

### Example 3: Collecting Multiple Frames for Better Accuracy

```javascript
class HandSignCapture {
  constructor() {
    this.frames = [];
    this.maxFrames = 10;
  }
  
  addFrame(landmarks) {
    const landmarksWithVisibility = landmarks.map(lm => ({
      x: lm.x,
      y: lm.y,
      z: lm.z || 0,
      v: 1.0
    }));
    
    this.frames.push({ landmarks: landmarksWithVisibility });
    
    // Keep only the most recent frames
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }
  
  async submitForScoring(word) {
    if (this.frames.length === 0) {
      throw new Error('No frames captured');
    }
    
    const response = await fetch('http://localhost:8000/api/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word: word,
        frames: this.frames
      }),
    });
    
    return await response.json();
  }
  
  clear() {
    this.frames = [];
  }
}

// Usage
const capture = new HandSignCapture();

function onLandmarksDetected(landmarks) {
  if (isRecording) {
    capture.addFrame(landmarks);
  }
}

async function submitAttempt() {
  const result = await capture.submitForScoring('A');
  console.log(result);
  capture.clear();
}
```

---

## ASL Alphabet Implementation

### Current State

The system includes:
1. **Frontend**: Captures hand landmarks using MediaPipe
2. **Backend Model**: Random Forest classifier (initialized with dummy data)
3. **Scoring System**: Compares user landmarks to reference templates

### Adding ASL Alphabet Support

#### Step 1: Add Reference Templates for Each Letter

Edit `backend/routers/sign_scoring.py`:

```python
REFERENCE_TEMPLATES = {
    "A": Frame(landmarks=[...]),  # Closed fist with thumb on side
    "B": Frame(landmarks=[...]),  # Flat hand, fingers together
    "C": Frame(landmarks=[...]),  # Curved hand
    # ... Add all 26 letters
}

SUPPORTED_WORDS = [
    WordInfo(id="A", display_name="Letter A", difficulty="easy"),
    WordInfo(id="B", display_name="Letter B", difficulty="easy"),
    # ... Add all 26 letters
]
```

**How to Get Reference Templates**:

1. **Manual Collection**: Use the frontend to capture landmarks for each letter
   ```javascript
   // In browser console while showing a sign
   console.log(JSON.stringify(capturedLandmarks));
   ```

2. **From ASL Dataset**: Load from a dataset like:
   - ASL Alphabet Dataset (Kaggle)
   - MS-ASL Dataset
   - Process images through MediaPipe to extract landmarks

#### Step 2: Train the Prediction Model

```python
# backend/scripts/train_asl_model.py
from models.sign_language_model import get_model
import numpy as np

# Load your ASL dataset
# Each sample should be: [x1, y1, z1, x2, y2, z2, ..., x21, y21, z21]
X_train = np.array([...])  # Shape: (num_samples, 63)
y_train = np.array([...])  # Shape: (num_samples,) - labels like "A", "B", etc.

# Train the model
model = get_model()
model.train(X_train, y_train)
```

#### Step 3: Frontend Integration for Alphabet Learning

```javascript
// ASL Alphabet Learning Component
function ASLAlphabetLearning() {
  const [currentLetter, setCurrentLetter] = useState('A');
  const [score, setScore] = useState(null);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  async function checkSign(landmarks) {
    const result = await scoreHandSign(currentLetter, landmarks);
    setScore(result.score);
    
    if (result.passed) {
      // Move to next letter
      const nextIndex = alphabet.indexOf(currentLetter) + 1;
      if (nextIndex < alphabet.length) {
        setCurrentLetter(alphabet[nextIndex]);
      }
    }
  }
  
  return (
    <div>
      <h2>Learn Letter: {currentLetter}</h2>
      <CameraFeed onLandmarksDetected={checkSign} />
      {score && <p>Score: {score}/100</p>}
    </div>
  );
}
```

### Data Collection Workflow for ASL Alphabet

To build a complete ASL alphabet system:

1. **Collect Training Data**:
   ```javascript
   // Data collection component
   const DataCollector = ({ letter }) => {
     const [samples, setSamples] = useState([]);
     
     const collectSample = (landmarks) => {
       const sample = {
         letter: letter,
         landmarks: landmarks,
         timestamp: Date.now()
       };
       setSamples([...samples, sample]);
     };
     
     const exportData = () => {
       const json = JSON.stringify(samples);
       const blob = new Blob([json], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `asl_${letter}_samples.json`;
       a.click();
     };
     
     return (
       <div>
         <h3>Collecting data for: {letter}</h3>
         <CameraFeed onLandmarksDetected={collectSample} />
         <p>Samples collected: {samples.length}</p>
         <button onClick={exportData}>Export Data</button>
       </div>
     );
   };
   ```

2. **Train the Model**:
   - Collect 50-100 samples per letter from multiple users
   - Process and format the data
   - Train the Random Forest model
   - Save the trained model

3. **Test and Refine**:
   - Test with new users
   - Adjust reference templates based on common errors
   - Fine-tune scoring thresholds

---

## Key Considerations

### Performance Optimization

1. **Throttling**: The frontend throttles API requests to avoid overwhelming the backend
   - Processes every 3rd frame
   - Max 10 requests per second
   
2. **Batch Processing**: For scoring, submit multiple frames to average results

### Accuracy Improvements

1. **Normalize Hand Position**: Consider normalizing landmarks relative to wrist position
2. **Hand Orientation**: Handle different hand orientations (palm facing camera vs. side view)
3. **Temporal Smoothing**: Average predictions over multiple frames to reduce noise

### Error Handling

```javascript
try {
  const response = await fetch(API_URL, { /* ... */ });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  // Process data
  
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

---

## Summary

### Data Flow for ASL Recognition

1. **Frontend captures** hand landmarks (21 points with x, y, z coordinates)
2. **Format data** according to backend schema
3. **Send to backend** via POST request
4. **Backend processes** landmarks through ML model or scoring algorithm
5. **Receive results** (prediction + confidence OR score + tips)
6. **Display feedback** to user

### Key Data Formats

- **Prediction API**: Simple landmarks (x, y, z)
- **Scoring API**: Landmarks with visibility (x, y, z, v)
- **All APIs**: Require exactly 21 landmarks per hand

### Next Steps for ASL Alphabet

1. Collect training data for all 26 letters
2. Train the prediction model
3. Create reference templates for scoring
4. Build learning interface for users
5. Test and refine with real users

---

## Additional Resources

- [MediaPipe Hands Documentation](https://google.github.io/mediapipe/solutions/hands.html)
- [ASL Alphabet Reference](https://www.gallaudet.edu/asl-connect/asl-for-free)
- Backend Model: `backend/models/sign_language_model.py`
- Frontend Hooks: `frontend/src/hooks/useSignRecognition.js`
- Scoring Logic: `backend/routers/sign_scoring.py`
