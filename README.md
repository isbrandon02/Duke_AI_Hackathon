# Duke AI Hackathon - Vite + FastAPI skeleton

This repository contains a minimal skeleton for a React frontend (Vite) and a FastAPI backend.

Structure

- frontend/ - Vite + React app
- backend/ - FastAPI app

Run locally

Frontend

```bash
cd frontend
npm install
npm run dev
```

Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The frontend dev server runs on http://localhost:5173 and the backend on http://localhost:8000 by default.
