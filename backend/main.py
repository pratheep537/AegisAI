import asyncio
import json
import os
import sys
import threading
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import cv2
import numpy as np
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from physics.crowd_physics import CrowdPhysicsEngine, TrackedPerson
from services.copilot import OpsCopilot
from vision.onnx_detector import ONNXPersonDetector, blur_heads
from vision.tracker import SimpleIOUTracker

CONFIG_PATH = BACKEND_DIR / "config" / "venue_config.json"
MODEL_PATH = BACKEND_DIR / "models" / "yolo26n.onnx"


class RuntimeState:
    def __init__(self):
        self.lock = threading.Lock()
        self.config: dict[str, Any] = self._load_config()
        self.physics = CrowdPhysicsEngine(self.config)
        self.telemetry: dict[str, Any] = self.physics.update([], time.time())
        self.latest_frame: np.ndarray | None = None
        self.last_client_ping: float = time.time()
        self.stop_event = threading.Event()

    def _load_config(self) -> dict[str, Any]:
        with open(CONFIG_PATH, encoding="utf-8") as f:
            return json.load(f)

    def reload_config(self, new_config: dict[str, Any]) -> None:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(new_config, f, indent=2)
        with self.lock:
            self.config = new_config
            self.physics = CrowdPhysicsEngine(new_config)

    def touch_client(self) -> None:
        self.last_client_ping = time.time()


state = RuntimeState()
copilot = OpsCopilot()


def _resolve_source(source: str) -> str | int:
    if str(source).isdigit():
        return int(source)
    p = Path(source)
    if p.exists():
        return str(p)
    rel = BACKEND_DIR.parent / source
    return str(rel) if rel.exists() else source


def _vision_worker() -> None:
    detector = ONNXPersonDetector(MODEL_PATH) if MODEL_PATH.exists() else None
    if detector is None:
        print(f"[Vision] {MODEL_PATH} missing. Run `python backend/vision/export_model.py` to enable detection.")

    tracker = SimpleIOUTracker()
    cap: cv2.VideoCapture | None = None

    while not state.stop_event.is_set():
        if time.time() - state.last_client_ping > 30.0:
            time.sleep(0.5)
            continue

        with state.lock:
            cfg = state.config
        cam_cfg = cfg["camera"]
        target_fps = max(1, int(cam_cfg.get("target_fps", 5)))
        frame_interval = 1.0 / target_fps

        if cap is None or not cap.isOpened():
            src = _resolve_source(cam_cfg["source"])
            cap = cv2.VideoCapture(src)
            if not cap.isOpened():
                time.sleep(2.0)
                continue

        t0 = time.time()
        ok, frame = cap.read()
        if not ok:
            cap.release()
            cap = None
            continue

        frame = cv2.resize(frame, (1280, 720))
        boxes = detector.detect(frame) if detector is not None else []
        tracked = tracker.update(boxes)

        if cam_cfg.get("privacy_blur_faces", True) and boxes:
            frame = blur_heads(frame, boxes)

        persons: list[TrackedPerson] = []
        for tid, (x1, y1, x2, y2) in tracked:
            persons.append(TrackedPerson(track_id=tid, foot_u=(x1 + x2) / 2.0, foot_v=float(y2)))
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(
                frame, f"#{tid}", (x1, max(16, y1 - 6)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1
            )

        with state.lock:
            telemetry = state.physics.update(persons, time.time())
            state.telemetry = telemetry

            cal_pts = np.array(state.config["calibration"]["image_points_px"], dtype=np.int32)
            cv2.polylines(frame, [cal_pts], isClosed=True, color=(16, 185, 129), thickness=2)
            cv2.putText(
                frame,
                f"Risk: {telemetry['overall_risk']} | People: {telemetry['total_people']}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (16, 185, 129),
                2,
            )
            state.latest_frame = cv2.resize(frame, (640, 360))

        elapsed = time.time() - t0
        if elapsed < frame_interval:
            time.sleep(frame_interval - elapsed)

    if cap is not None:
        cap.release()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    worker = threading.Thread(target=_vision_worker, daemon=True)
    worker.start()
    yield
    state.stop_event.set()


app = FastAPI(title="AegisAI v2 Crowd Safety Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str


@app.get("/api/telemetry")
def get_telemetry():
    state.touch_client()
    with state.lock:
        return state.telemetry


@app.get("/api/config")
def get_config():
    with state.lock:
        return state.config


@app.put("/api/config")
def update_config(new_config: dict[str, Any]):
    state.reload_config(new_config)
    return {"status": "updated", "venue_id": new_config.get("venue_id")}


@app.post("/ask-ai")
async def ask_ai(request: AskRequest):
    state.touch_client()
    with state.lock:
        snapshot = dict(state.telemetry)
    answer = await asyncio.to_thread(copilot.ask, request.question, snapshot)
    return {"response": answer}


async def _mjpeg_generator():
    while True:
        state.touch_client()
        with state.lock:
            frame = None if state.latest_frame is None else state.latest_frame.copy()
        if frame is None:
            await asyncio.sleep(0.15)
            continue
        ok, buf = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 65])
        if ok:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"
        await asyncio.sleep(0.15)


@app.get("/video-feed")
async def video_feed():
    return StreamingResponse(
        _mjpeg_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
