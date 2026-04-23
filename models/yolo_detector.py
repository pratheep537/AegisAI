from ultralytics import YOLO

class YOLODetector:

    def __init__(self):
        self.model = YOLO("yolov8x.pt")

    def detect_people(self, frame):

        results = self.model(frame)

        people_boxes = []

        for r in results:
            for box in r.boxes:
                cls = int(box.cls[0])

                if cls == 0:  # person class
                    people_boxes.append(box.xyxy[0].tolist())

        return people_boxes