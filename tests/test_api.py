import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from main import app
from vision.tracker import SimpleIOUTracker


def test_iou_tracker_preserves_person_id():
    tracker = SimpleIOUTracker(iou_threshold=0.3)
    frame1 = tracker.update([(100, 100, 160, 260)])
    frame2 = tracker.update([(105, 102, 165, 262)])
    assert frame1[0][0] == frame2[0][0]


def test_telemetry_and_config_endpoints():
    client = TestClient(app)
    cfg_resp = client.get("/api/config")
    assert cfg_resp.status_code == 200
    assert "venue_id" in cfg_resp.json()

    tel_resp = client.get("/api/telemetry")
    assert tel_resp.status_code == 200
    data = tel_resp.json()
    assert "overall_risk" in data
    assert "zones" in data
