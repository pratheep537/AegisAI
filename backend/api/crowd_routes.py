from fastapi import APIRouter
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.vision_service import get_crowd_data

router = APIRouter()

@router.get("/crowd-data")
def read_crowd_data():
    return get_crowd_data()
