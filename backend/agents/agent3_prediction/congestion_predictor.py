import numpy as np
from sklearn.linear_model import LinearRegression

class CongestionPredictor:
    def __init__(self):
        self.model = LinearRegression()

    def predict(self, historical_counts):
        if not historical_counts:
            return 0
        
        # X is time steps [0, 1, 2, 3] etc.
        X = np.array(range(len(historical_counts))).reshape(-1, 1)
        y = np.array(historical_counts)

        self.model.fit(X, y)

        # Predict the next time step (representing +5 mins in abstract logic)
        next_step = np.array([[len(historical_counts)]])
        predicted_value = self.model.predict(next_step)[0]

        return int(max(0, predicted_value))
