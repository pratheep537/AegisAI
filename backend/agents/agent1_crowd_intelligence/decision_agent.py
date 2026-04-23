class DecisionAgent:

    def decide(self, risk_level, zones):

        # Find the most crowded zone
        max_zone = max(zones, key=zones.get)

        if risk_level == "LOW":
            action = "Area Safe"
            alert = "No action required"

        elif risk_level == "MEDIUM":
            action = "Monitor Crowd"
            alert = f"Monitor activity near {max_zone} zone"

        else:
            action = "Deploy Security"
            alert = f"ALERT: Send staff to {max_zone} zone immediately"

        return action, alert