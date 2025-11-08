from pydantic import BaseModel
from typing import List, Literal


class Landmark(BaseModel):
    x: float
    y: float
    z: float
    v: float  # visibility


class Frame(BaseModel):
    landmarks: List[Landmark]  # 21 landmarks total


class AttemptRequest(BaseModel):
    word: str
    frames: List[Frame]


class WordInfo(BaseModel):
    id: str
    display_name: str
    difficulty: Literal["easy", "medium", "hard"]


class AttemptResult(BaseModel):
    word: str
    score: float
    passed: bool
    tips: List[str]

