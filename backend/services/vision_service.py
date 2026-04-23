import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import db

def get_crowd_data():
    state = db.get_state()
    return {
        "total_people": state.get("total_people", 0),
        "zones": state.get("zones", {}),
        "risk_level": state.get("risk_level", "LOW"),
        "guards_needed": state.get("guards_needed", 0),
        "guards_allocated": state.get("guards_allocated", {})
    }
