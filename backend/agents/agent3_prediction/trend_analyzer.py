import pandas as pd
import os
import sys

# Add backend to sys.path so we can import easily
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import DATASET_PATH

class TrendAnalyzer:
    def __init__(self):
        self.dataset_path = DATASET_PATH

    def get_recent_history(self, zone="center", window=4):
        # Mocking fetching real-time recorded history from a DB using the dataset.
        try:
            df = pd.read_csv(self.dataset_path)
            # Basic mapping center -> Center, left -> Gate etc just for testing
            # Or just take top rows
            zone_data = df[df['zone_id'].str.contains(zone, case=False, na=False)]
            if not zone_data.empty:
                counts = zone_data['crowd_count'].tail(window).tolist()
                if len(counts) == window:
                    return counts
        except Exception as e:
            pass
        
        # Example default mapping if file fails or zone not found clearly
        return [31, 34, 38, 41]
