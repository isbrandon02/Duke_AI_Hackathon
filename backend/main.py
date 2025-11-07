from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Duke AI Hackathon API")

# Allow local frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PingResponse(BaseModel):
    message: str

@app.get("/", response_model=PingResponse)
async def read_root():
    return {"message": "Hello from FastAPI backend"}

@app.get("/health", response_model=PingResponse)
async def health():
    return {"message": "ok"}

# Example POST endpoint
class EchoRequest(BaseModel):
    text: str

class EchoResponse(BaseModel):
    text: str

@app.post("/echo", response_model=EchoResponse)
async def echo(req: EchoRequest):
    return {"text": req.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
