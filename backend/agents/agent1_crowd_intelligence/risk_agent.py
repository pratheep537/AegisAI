class RiskAgent:

    def analyze(self, people_count):

        if people_count < 20:
            level = "LOW"

        elif people_count < 50:
            level = "MEDIUM"

        else:
            level = "HIGH"

        return level