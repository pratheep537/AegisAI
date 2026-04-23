import threading
import time
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.agent3_prediction.forecast_agent import ForecastAgent
from database.db import db

def start_prediction_pipeline():
    agent = ForecastAgent()
    print("[Prediction Pipeline] Started")
    
    while True:
        state = db.get_state()
        zones = state.get("zones", {})
        
        if zones and sum(zones.values()) > 0:
            prediction = agent.forecast(zones)
            db.update_prediction(prediction)
        
        # Run forecast every 5 seconds
        time.sleep(5)

def run_prediction_thread():
    t = threading.Thread(target=start_prediction_pipeline, daemon=True)
    t.start()
