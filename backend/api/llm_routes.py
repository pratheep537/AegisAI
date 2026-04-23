from fastapi import APIRouter
from pydantic import BaseModel
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.llm_service import ask_llm

router = APIRouter()

class AskRequest(BaseModel):
    question: str

@router.post("/ask-ai")
async def ask_ai(request: AskRequest):
    answer = await ask_llm(request.question)
    return {"response": answer}
