import threading
import time
import os
import sys

# Add backend to sys.path so we can import easily
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.agent1_crowd_intelligence.perception_agent import PerceptionAgent
from agents.agent1_crowd_intelligence.prediction_agent import PredictionAgent
from agents.agent1_crowd_intelligence.risk_agent import RiskAgent
from agents.agent1_crowd_intelligence.decision_agent import DecisionAgent
from agents.agent1_crowd_intelligence.allocation_agent import AllocationAgent
from agents.agent1_crowd_intelligence.simulation_agent import SimulationAgent
from database.db import db
from config import VIDEO_PATH

def start_vision_pipeline():
    print("[Vision Pipeline] Initializing models...")
    perception = PerceptionAgent(VIDEO_PATH)
    prediction = PredictionAgent()
    risk_agent = RiskAgent()
    decision_agent = DecisionAgent()
    allocation_agent = AllocationAgent()
    simulation_agent = SimulationAgent()

    print("[Vision Pipeline] Started")

    while True:
        try:
            frame = perception.get_frame()
        except Exception as e:
            print(f"[Vision Pipeline] Frame read error: {e}")
            frame = None

        if frame is None:
            # Loop the video for continuous running
            perception.release()
            perception = PerceptionAgent(VIDEO_PATH)
            time.sleep(0.5)
            continue
            
        # 1. Detect people
        total, boxes, zones, out_frame = prediction.detect_people(frame)

        # 2. Risk analysis
        risk_level = risk_agent.analyze(total)

        # 3. Decision
        action, alert = decision_agent.decide(risk_level, zones)

        # 4. Allocation
        guards_allocation = allocation_agent.allocate(zones)

        # 5. Simulation (optional usage to calculate reduced crowd)
        reduced_count = simulation_agent.simulate(total)

        # Update database state
        db.update_crowd_data(total, zones, risk_level, guards_allocation)
        db.update_frame(out_frame)

        # Sleep a little to not max out CPU loop
        time.sleep(0.01)

def run_vision_thread():
    t = threading.Thread(target=start_vision_pipeline, daemon=True)
    t.start()
