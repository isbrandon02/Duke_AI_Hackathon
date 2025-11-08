from pydantic import BaseModel

class PingResponse(BaseModel):
    message: str

class EchoRequest(BaseModel):
    text: str

class EchoResponse(BaseModel):
    text: str
