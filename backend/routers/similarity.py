from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SimilarityRequest(BaseModel):
    text_a: str
    text_b: str


class SimilarityResponse(BaseModel):
    score: float
    method: str


@router.post("/compare", response_model=SimilarityResponse)
def compare(body: SimilarityRequest):
    # Placeholder — reemplazar con el algoritmo real
    words_a = set(body.text_a.lower().split())
    words_b = set(body.text_b.lower().split())
    intersection = words_a & words_b
    union = words_a | words_b
    score = len(intersection) / len(union) if union else 0.0
    return SimilarityResponse(score=round(score, 4), method="jaccard")
