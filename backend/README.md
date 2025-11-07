# Backend (FastAPI)

Quickstart

1. cd backend
2. python -m venv .venv
3. source .venv/bin/activate
4. pip install -r requirements.txt
5. cp .env.example .env (optional)
6. uvicorn main:app --reload --port 8000

API endpoints:
- GET / -> hello message
- GET /health -> {"message":"ok"}
- POST /echo {"text": "..."} -> echoes text
