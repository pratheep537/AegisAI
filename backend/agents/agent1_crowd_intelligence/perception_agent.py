import cv2


class PerceptionAgent:

    def __init__(self, video_path):

        self.cap = cv2.VideoCapture(video_path)

    def get_frame(self):

        ret, frame = self.cap.read()

        if not ret:
            return None

        return frame

    def release(self):

        self.cap.release()