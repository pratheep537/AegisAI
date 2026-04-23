from fastapi import APIRouter
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.prediction_service import get_prediction

router = APIRouter()

@router.get("/prediction")
def read_prediction():
    return get_prediction()
