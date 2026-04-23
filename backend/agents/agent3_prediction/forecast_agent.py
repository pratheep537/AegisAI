from .trend_analyzer import TrendAnalyzer
from .congestion_predictor import CongestionPredictor

class ForecastAgent:
    def __init__(self):
        self.trend_analyzer = TrendAnalyzer()
        self.predictor = CongestionPredictor()

    def forecast(self, current_zones):
        # We find the most crowded zone to forecast, or just forecast center
        if not current_zones:
            target_zone = "center"
        else:
            target_zone = max(current_zones, key=current_zones.get)
        
        history = self.trend_analyzer.get_recent_history(zone=target_zone)
        predicted_count = self.predictor.predict(history)
        
        congestion_warning = predicted_count > 50

        return {
            "zone": target_zone,
            "predicted_count": predicted_count,
            "congestion_warning": congestion_warning
        }
