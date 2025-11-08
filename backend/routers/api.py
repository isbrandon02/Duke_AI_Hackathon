from fastapi import APIRouter
from schemas import health as health_schema

router = APIRouter()

@router.get("/", response_model=health_schema.PingResponse)
async def read_root():
    return {"message": "Hello from FastAPI backend (router)"}

@router.get("/health", response_model=health_schema.PingResponse)
async def health():
    return {"message": "ok"}

@router.post("/echo", response_model=health_schema.EchoResponse)
async def echo(req: health_schema.EchoRequest):
    return {"text": req.text}
