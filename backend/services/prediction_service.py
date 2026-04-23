import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import db

def get_prediction():
    state = db.get_state()
    return state.get("prediction", {})
