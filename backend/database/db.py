import threading

class Database:
    def __init__(self):
        self.lock = threading.Lock()
        self.state = {
            "total_people": 0,
            "zones": {
                "left": 0,
                "center": 0,
                "right": 0
            },
            "risk_level": "LOW",
            "guards_needed": 0,
            "prediction": {
                "zone": "None",
                "predicted_count": 0,
                "congestion_warning": False
            },
            "frame": None
        }

    def update_crowd_data(self, total, zones, risk, guards):
        with self.lock:
            self.state["total_people"] = total
            self.state["zones"] = zones
            self.state["risk_level"] = risk
            self.state["guards_needed"] = sum(guards.values()) if isinstance(guards, dict) else guards
            self.state["guards_allocated"] = guards if isinstance(guards, dict) else {}

    def update_prediction(self, prediction_data):
        with self.lock:
            self.state["prediction"] = prediction_data

    def update_frame(self, frame):
        with self.lock:
            self.state["frame"] = frame

    def get_frame(self):
        with self.lock:
            return self.state["frame"]

    def get_state(self):
        with self.lock:
            import copy
            safe_state = {k: v for k, v in self.state.items() if k != "frame"}
            return copy.deepcopy(safe_state)

db = Database()
