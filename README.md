# Duke AI Hackathon - ASL Recognition System

This repository contains an ASL (American Sign Language) recognition system with a React frontend (Vite) and FastAPI backend. The system uses MediaPipe for hand tracking and provides real-time sign recognition and scoring.

## 📚 Documentation

**New to the project? Start here:**

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference card with essential info
- **[FRONTEND_BACKEND_DATA_GUIDE.md](FRONTEND_BACKEND_DATA_GUIDE.md)** - Complete guide to data formats and integration
- **[ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md)** - System architecture and diagrams
- **[examples/](examples/)** - Code examples and integration patterns

## Structure

- **frontend/** - Vite + React app with MediaPipe hand tracking
- **backend/** - FastAPI app with ML model and scoring endpoints
- **examples/** - Integration examples and code snippets

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The frontend dev server runs on http://localhost:5173 and the backend on http://localhost:8000 by default.

## Firebase Authentication Setup

**Important for team members**: Each person needs to set up their own Firebase service account key.

👉 **See [backend/TEAM_SETUP.md](backend/TEAM_SETUP.md) for setup instructions**

Quick steps:

1. Get Firebase service account key from Firebase Console
2. Save it as `backend/firebase-service-account.json`
3. Create `backend/.env` with: `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`

**Note**: These files are in `.gitignore` and won't be committed to Git. Each team member needs their own copy.

## Features

### Frontend
- **Camera Feed**: Real-time webcam capture
- **Hand Tracking**: MediaPipe Hands detects 21 hand landmarks
- **Sign Recognition**: Send landmarks to backend for prediction
- **Visual Feedback**: Overlay hand skeleton on video

### Backend
- **Prediction API**: ML-based sign recognition (Random Forest)
- **Scoring API**: Compare user signs to reference templates
- **Firebase Auth**: Secure user authentication
- **CORS Enabled**: Ready for browser integration

## ASL Alphabet Integration

The system is designed to recognize ASL alphabet signs. See the documentation for:
- How hand landmarks are captured and formatted
- How to send data to the backend for interpretation
- How to score user attempts against reference signs
- Example code for building a learning interface

**Quick example:**
```javascript
// Capture landmarks from MediaPipe
const landmarks = [
  { x: 0.5, y: 0.4, z: 0.0 },  // 21 total landmarks
  // ...
];

// Send to backend for prediction
const result = await predictSign(landmarks);
console.log(`Detected: ${result.sign} (${result.confidence * 100}%)`);
```

See [examples/asl_integration_examples.js](examples/asl_integration_examples.js) for complete code.

## API Endpoints

- `POST /api/sign-language/predict` - Predict sign from landmarks
- `POST /api/attempts` - Score sign attempt (0-100)
- `GET /api/words` - Get supported signs

API documentation available at: `http://localhost:8000/docs`

## Development Workflow

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. Allow camera permissions
5. Show hand signs to camera
6. See real-time recognition results

## Contributing

When adding new ASL signs:
1. Collect training data using `ASLDataCollector` (see examples)
2. Add reference templates to `backend/routers/sign_scoring.py`
3. Train model with collected data
4. Test and refine

See [FRONTEND_BACKEND_DATA_GUIDE.md](FRONTEND_BACKEND_DATA_GUIDE.md) for detailed instructions.
