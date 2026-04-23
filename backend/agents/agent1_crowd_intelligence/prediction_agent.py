import cv2
from ultralytics import YOLO


class PredictionAgent:

    def __init__(self):

        import os
        import sys
        
        # Determine paths dynamically assuming it's run from backend/main.py
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "yolov8x.pt")
        
        # Load YOLO model
        self.model = YOLO(model_path)

    def detect_people(self, frame):

        # Resize frame for consistent detection
        frame = cv2.resize(frame, (1280, 720))

        height, width, _ = frame.shape

        # Draw zone divider lines
        cv2.line(frame, (width // 3, 0), (width // 3, height), (0, 255, 0), 2)
        cv2.line(frame, (2 * width // 3, 0), (2 * width // 3, height), (0, 255, 0), 2)

        # Zone labels
        cv2.putText(frame, "LEFT ZONE", (40, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.putText(frame, "CENTER ZONE", (width // 2 - 120, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.putText(frame, "RIGHT ZONE", (width - 220, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        # Run YOLO detection
        results = self.model(
            frame,
            imgsz=1600,
            conf=0.10,
            classes=[0]   # detect only person class
        )

        boxes_list = []

        left = 0
        center = 0
        right = 0

        for r in results:

            boxes = r.boxes.xyxy
            classes = r.boxes.cls

            for box, cls in zip(boxes, classes):

                if int(cls) != 0:
                    continue

                x1, y1, x2, y2 = map(int, box)

                # Draw bounding box
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)

                cx = (x1 + x2) // 2
                cy = (y1 + y2) // 2

                # Draw center point
                cv2.circle(frame, (cx, cy), 4, (0, 0, 255), -1)

                # Zone classification
                if cx < width / 3:
                    left += 1
                elif cx < 2 * width / 3:
                    center += 1
                else:
                    right += 1

                boxes_list.append((x1, y1, x2, y2))

        total = left + center + right

        zones = {
            "left": left,
            "center": center,
            "right": right
        }

        # Display statistics on video
        cv2.putText(frame, f"Total People: {total}",
                    (20, height - 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

        cv2.putText(frame, f"Left: {left}",
                    (20, height - 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        cv2.putText(frame, f"Center: {center}",
                    (200, height - 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        cv2.putText(frame, f"Right: {right}",
                    (420, height - 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        return total, boxes_list, zones, frame