import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Data paths
VIDEO_PATH = os.path.join(BASE_DIR, "data", "crowd_video.mp4")
DATASET_PATH = os.path.join(BASE_DIR, "data", "stadium_dataset.csv")

# Model path
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "models", "yolov8x.pt")

# Server settings
HOST = "0.0.0.0"
PORT = 8000
