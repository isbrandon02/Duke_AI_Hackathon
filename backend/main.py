from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Duke AI Hackathon API")

# Allow all origins for browser testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Initialize Firebase Admin SDK
from services.firebase import initialize_firebase
initialize_firebase()
# Include routers
from routers import api as api_router
from routers import sign_scoring
from routers import sign_language as sign_language_router
from routers import auth as auth_router
app.include_router(api_router.router, prefix="")
app.include_router(sign_scoring.router)
app.include_router(sign_language_router.router)
app.include_router(auth_router.router)



if __name__ == "__main__":
    import uvicorn
    # Use import string format for reload to work properly
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
