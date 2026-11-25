from pathlib import Path

import cv2
import numpy as np
import onnxruntime as ort


class ONNXPersonDetector:
    """Runs YOLO26n (NMS-free or raw 84-channel) ONNX models without PyTorch."""

    def __init__(self, model_path: str | Path, conf_threshold: float = 0.15, imgsz: int = 640):
        self.model_path = str(model_path)
        self.conf_threshold = conf_threshold
        self.imgsz = imgsz
        self._logged_shape = False

        available = ort.get_available_providers()
        providers = (
            ["CUDAExecutionProvider", "CPUExecutionProvider"]
            if "CUDAExecutionProvider" in available
            else ["CPUExecutionProvider"]
        )
        self.session = ort.InferenceSession(self.model_path, providers=providers)
        self.input_name = self.session.get_inputs()[0].name
        print(f"[ONNXDetector] Loaded {self.model_path} on {self.session.get_providers()[0]}")

    def _letterbox(self, frame: np.ndarray) -> tuple[np.ndarray, float, tuple[int, int]]:
        h, w = frame.shape[:2]
        scale = min(self.imgsz / w, self.imgsz / h)
        nw, nh = round(w * scale), round(h * scale)
        resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_LINEAR)

        pad_w, pad_h = (self.imgsz - nw) // 2, (self.imgsz - nh) // 2
        canvas = np.full((self.imgsz, self.imgsz, 3), 114, dtype=np.uint8)
        canvas[pad_h : pad_h + nh, pad_w : pad_w + nw] = resized

        rgb = cv2.cvtColor(canvas, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        blob = np.transpose(rgb, (2, 0, 1))[np.newaxis, ...]
        return blob, scale, (pad_w, pad_h)

    def detect(self, frame: np.ndarray) -> list[tuple[int, int, int, int]]:
        h, w = frame.shape[:2]
        blob, scale, (pad_w, pad_h) = self._letterbox(frame)
        outputs = self.session.run(None, {self.input_name: blob})[0]

        if not self._logged_shape:
            print(f"[ONNXDetector] Output shape={outputs.shape}, min={outputs.min():.3f}, max={outputs.max():.3f}")
            self._logged_shape = True

        boxes: list[tuple[int, int, int, int]] = []

        # Case 1: End-to-end NMS-free output -> (1, N, 6) [x1, y1, x2, y2, score, cls]
        if outputs.ndim == 3 and outputs.shape[-1] == 6:
            rows = outputs[0].copy()
            if rows.size > 0 and float(np.max(rows[:, :4])) <= 1.5:
                rows[:, :4] *= self.imgsz
            for x1, y1, x2, y2, score, cls_id in rows:
                if score < self.conf_threshold or round(float(cls_id)) != 0:
                    continue
                bx1 = int(np.clip((x1 - pad_w) / scale, 0, w - 1))
                by1 = int(np.clip((y1 - pad_h) / scale, 0, h - 1))
                bx2 = int(np.clip((x2 - pad_w) / scale, 0, w - 1))
                by2 = int(np.clip((y2 - pad_h) / scale, 0, h - 1))
                if bx2 > bx1 and by2 > by1:
                    boxes.append((bx1, by1, bx2, by2))
            return boxes

        # Case 2: Standard YOLO output -> (1, 84, N) or (1, N, 84)
        raw = outputs[0]
        preds = raw.T if raw.shape[0] < raw.shape[1] else raw
        class_scores = preds[:, 4:]
        if float(np.max(class_scores)) > 1.0 or float(np.min(class_scores)) < 0.0:
            class_scores = 1.0 / (1.0 + np.exp(-np.clip(class_scores, -20.0, 20.0)))

        person_scores = class_scores[:, 0]
        best_cls = np.argmax(class_scores, axis=1)
        mask = (best_cls == 0) & (person_scores >= self.conf_threshold)

        filtered = preds[mask].copy()
        scores = person_scores[mask]

        if filtered.size > 0 and float(np.max(filtered[:, :4])) <= 1.5:
            filtered[:, :4] *= self.imgsz

        raw_boxes = []
        for row in filtered:
            cx, cy, bw, bh = row[:4]
            x1 = (cx - bw / 2.0 - pad_w) / scale
            y1 = (cy - bh / 2.0 - pad_h) / scale
            raw_boxes.append([int(x1), int(y1), int(bw / scale), int(bh / scale)])

        if raw_boxes:
            indices = cv2.dnn.NMSBoxes(raw_boxes, scores.tolist(), self.conf_threshold, 0.45)
            if len(indices) > 0:
                for idx in np.array(indices).reshape(-1):
                    x, y, bw, bh = raw_boxes[int(idx)]
                    bx1, by1 = max(0, x), max(0, y)
                    bx2, by2 = min(w - 1, x + bw), min(h - 1, y + bh)
                    if bx2 > bx1 and by2 > by1:
                        boxes.append((bx1, by1, bx2, by2))

        return boxes


def blur_heads(frame: np.ndarray, boxes: list[tuple[int, int, int, int]]) -> np.ndarray:
    """Privacy-first filter: blurs upper 28% (head region) of every detected person."""
    for x1, y1, x2, y2 in boxes:
        head_y2 = y1 + max(10, int((y2 - y1) * 0.28))
        roi = frame[y1:head_y2, x1:x2]
        if roi.size > 0:
            frame[y1:head_y2, x1:x2] = cv2.GaussianBlur(roi, (23, 23), 15)
    return frame
