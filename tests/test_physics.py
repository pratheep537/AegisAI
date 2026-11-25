import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from physics.crowd_physics import CrowdPhysicsEngine, TrackedPerson


def _sample_config():
    return {
        "venue_id": "test-venue",
        "venue_name": "Test Concourse",
        "calibration": {
            "image_points_px": [[0, 0], [1000, 0], [1000, 1000], [0, 1000]],
            "world_size_meters": {"width": 10.0, "height": 10.0},
        },
        "thresholds": {
            "elevated_density_pm2": 2.0,
            "high_density_pm2": 3.5,
            "critical_density_pm2": 5.0,
            "turbulence_pressure_limit": 0.02,
            "ttcd_warning_minutes": 3.0,
        },
        "zones": [
            {
                "id": "gate_a",
                "name": "Gate A",
                "polygon_meters": [[2.0, 2.0], [7.0, 2.0], [7.0, 7.0], [2.0, 7.0]],
                "area_m2": 25.0,
                "upstream_gates": ["North Turnstile"],
                "relief_exits": ["Side Exit 2"],
            }
        ],
        "tripwires": [
            {
                "id": "tw_in",
                "zone_id": "gate_a",
                "direction": "in",
                "line_meters": [[2.0, 2.0], [7.0, 2.0]],
            },
            {
                "id": "tw_out",
                "zone_id": "gate_a",
                "direction": "out",
                "line_meters": [[2.0, 7.0], [7.0, 7.0]],
            },
        ],
    }


def test_homography_projects_center_accurately():
    engine = CrowdPhysicsEngine(_sample_config())
    x, y = engine.pixel_to_meters(500, 500)
    assert x == pytest.approx(5.0, abs=0.05)
    assert y == pytest.approx(5.0, abs=0.05)


def test_density_and_fruin_risk_levels():
    engine = CrowdPhysicsEngine(_sample_config())
    # 100 people in 25 m^2 => 4.0 people/m^2 => HIGH risk
    tracks = [TrackedPerson(i, 450, 450) for i in range(100)]
    report = engine.update(tracks, timestamp=10.0)
    zone = report["zones"]["gate_a"]

    assert zone["count"] == 100
    assert zone["density_pm2"] == 4.0
    assert zone["risk_level"] == "HIGH"
    assert "North Turnstile" in zone["playbook"]["directive"]


def test_tripwire_inflow_and_exact_ttcd():
    engine = CrowdPhysicsEngine(_sample_config())

    # Frame 1: 15 people standing just outside the inflow line (y = 1.0 m -> v = 100 px)
    outside = [TrackedPerson(i, 400 + i * 10, 100) for i in range(15)]
    engine.update(outside, timestamp=1.0)

    # Frame 2: All 15 cross into the zone (y = 3.0 m -> v = 300 px), plus 35 already inside (50 total => 2.0 p/m^2)
    crossed = [TrackedPerson(i, 400 + i * 10, 300) for i in range(15)]
    stationary = [TrackedPerson(100 + i, 500, 500) for i in range(35)]
    report = engine.update(crossed + stationary, timestamp=2.0)

    zone = report["zones"]["gate_a"]
    assert zone["inflow_per_min"] == 15.0
    assert zone["outflow_per_min"] == 0.0
    # Remaining capacity = (5.0 - 2.0) * 25 = 75 people; at 15/min => exactly 5.0 min
    assert zone["ttcd_minutes"] == pytest.approx(5.0, abs=0.05)


def test_helbing_pressure_detects_counterflow_turbulence():
    cfg = _sample_config()
    cfg["zones"][0]["area_m2"] = 1.0
    engine = CrowdPhysicsEngine(cfg)

    # 4 people in 1 m^2 moving in opposing directions (counter-flow turbulence)
    t1 = [
        TrackedPerson(1, 450, 300),
        TrackedPerson(2, 450, 600),
        TrackedPerson(3, 500, 300),
        TrackedPerson(4, 500, 600),
    ]
    engine.update(t1, timestamp=1.0)

    t2 = [
        TrackedPerson(1, 450, 400),  # +1.0 m/s
        TrackedPerson(2, 450, 500),  # -1.0 m/s
        TrackedPerson(3, 500, 400),  # +1.0 m/s
        TrackedPerson(4, 500, 500),  # -1.0 m/s
    ]
    report = engine.update(t2, timestamp=2.0)
    zone = report["zones"]["gate_a"]

    assert zone["turbulence_detected"] is True
    assert zone["helbing_pressure"] >= 3.5
    assert zone["risk_level"] == "CRITICAL"