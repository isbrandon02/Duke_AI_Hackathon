# Duke AI Hackathon - Vite + FastAPI skeleton

This repository contains a minimal skeleton for a React frontend (Vite) and a FastAPI backend.

## Structure

- frontend/ - Vite + React app
- backend/ - FastAPI app

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
