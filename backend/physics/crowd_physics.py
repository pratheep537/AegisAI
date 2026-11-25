import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np


@dataclass
class TrackedPerson:
    track_id: int
    foot_u: float
    foot_v: float


def _cross_2d(o: tuple[float, float], a: tuple[float, float], b: tuple[float, float]) -> float:
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])


def _crossed_forward(
    p_prev: tuple[float, float],
    p_curr: tuple[float, float],
    line_a: tuple[float, float],
    line_b: tuple[float, float],
) -> bool:
    """True when movement p_prev -> p_curr crosses segment A->B from negative to positive side."""
    d1 = _cross_2d(line_a, line_b, p_prev)
    d2 = _cross_2d(line_a, line_b, p_curr)
    if not (d1 < 0.0 and d2 >= 0.0):
        return False

    d3 = _cross_2d(p_prev, p_curr, line_a)
    d4 = _cross_2d(p_prev, p_curr, line_b)
    return (d3 * d4) <= 0.0


class CrowdPhysicsEngine:
    """Converts tracked pixel detections into physical density, turbulence, TTCD, and playbooks."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.thresholds = config["thresholds"]
        self.zones = config["zones"]
        self.tripwires = config.get("tripwires", [])

        # Build pixel -> meter homography matrix
        cal = config["calibration"]
        src = np.array(cal["image_points_px"], dtype=np.float32)
        w = float(cal["world_size_meters"]["width"])
        h = float(cal["world_size_meters"]["height"])
        dst = np.array([[0.0, 0.0], [w, 0.0], [w, h], [0.0, h]], dtype=np.float32)
        self.homography = cv2.getPerspectiveTransform(src, dst)

        # Precompute zone polygons in meters
        self._zone_polys = {
            z["id"]: np.array(z["polygon_meters"], dtype=np.float32)
            for z in self.zones
        }

        # Tracking history: track_id -> (x_m, y_m, timestamp)
        self._last_positions: dict[int, tuple[float, float, float]] = {}

        # Rolling 60-second crossing timestamps per zone
        self._inflow_events: dict[str, deque[float]] = {z["id"]: deque() for z in self.zones}
        self._outflow_events: dict[str, deque[float]] = {z["id"]: deque() for z in self.zones}

    @classmethod
    def from_file(cls, path: str | Path) -> "CrowdPhysicsEngine":
        with open(path, "r", encoding="utf-8") as f:
            return cls(json.load(f))

    def pixel_to_meters(self, u: float, v: float) -> tuple[float, float]:
        pt = np.array([[[float(u), float(v)]]], dtype=np.float32)
        mapped = cv2.perspectiveTransform(pt, self.homography)[0][0]
        return float(mapped[0]), float(mapped[1])

    def _classify_risk(
        self, density_pm2: float, pressure: float, ttcd_minutes: float | None
    ) -> str:
        t = self.thresholds
        if density_pm2 >= t["critical_density_pm2"] or (
            density_pm2 >= t["high_density_pm2"] and pressure >= t["turbulence_pressure_limit"]
        ):
            return "CRITICAL"
        if density_pm2 >= t["high_density_pm2"] or (
            ttcd_minutes is not None and ttcd_minutes <= t["ttcd_warning_minutes"]
        ):
            return "HIGH"
        if density_pm2 >= t["elevated_density_pm2"]:
            return "ELEVATED"
        return "SAFE"

    def _build_playbook(
        self, zone: dict[str, Any], risk: str, ttcd_minutes: float | None, turbulence: bool
    ) -> dict[str, str]:
        gates = ", ".join(zone.get("upstream_gates", [])) or "upstream entries"
        relief = ", ".join(zone.get("relief_exits", [])) or "secondary exits"

        if risk == "CRITICAL":
            return {
                "action": "HALT INFLOW & OPEN RELIEF EXITS",
                "directive": (
                    f"CRITICAL in {zone['name']}: Close {gates} immediately, "
                    f"open {relief}, and broadcast calm-dispersal audio."
                ),
            }
        if risk == "HIGH":
            reason = (
                f"TTCD {ttcd_minutes:.1f} min" if ttcd_minutes is not None else "high compression"
            )
            return {
                "action": "THROTTLE UPSTREAM GATES",
                "directive": (
                    f"HIGH risk in {zone['name']} ({reason}): Throttle {gates} by 50% "
                    f"and prepare {relief}."
                ),
            }
        if risk == "ELEVATED" or turbulence:
            return {
                "action": "MONITOR FLOW & STAGE MARSHALS",
                "directive": f"Elevated density in {zone['name']}: Keep {gates} metered and lanes clear.",
            }
        return {
            "action": "FLOW NOMINAL",
            "directive": f"{zone['name']} operating within safe density limits.",
        }

    def _prune_old_events(self, queue: deque[float], now: float, window_s: float = 60.0) -> None:
        cutoff = now - window_s
        while queue and queue[0] < cutoff:
            queue.popleft()

    def update(self, tracks: list[TrackedPerson], timestamp: float) -> dict[str, Any]:
        """Process one frame of tracked footpoints and return full venue physics telemetry."""
        bev_points: list[dict[str, Any]] = []
        zone_counts: dict[str, int] = {z["id"]: 0 for z in self.zones}
        zone_velocities: dict[str, list[tuple[float, float]]] = {z["id"]: [] for z in self.zones}

        active_ids: set[int] = set()

        for person in tracks:
            active_ids.add(person.track_id)
            xm, ym = self.pixel_to_meters(person.foot_u, person.foot_v)
            vx, vy = 0.0, 0.0
            has_velocity = False

            prev = self._last_positions.get(person.track_id)
            if prev is not None:
                px, py, pt = prev
                dt = timestamp - pt
                if dt > 0.05:
                    vx = (xm - px) / dt
                    vy = (ym - py) / dt
                    has_velocity = True

                # Check virtual tripwire crossings
                for tw in self.tripwires:
                    a = (float(tw["line_meters"][0][0]), float(tw["line_meters"][0][1]))
                    b = (float(tw["line_meters"][1][0]), float(tw["line_meters"][1][1]))
                    if _crossed_forward((px, py), (xm, ym), a, b):
                        if tw["direction"] == "in":
                            self._inflow_events[tw["zone_id"]].append(timestamp)
                        elif tw["direction"] == "out":
                            self._outflow_events[tw["zone_id"]].append(timestamp)

            self._last_positions[person.track_id] = (xm, ym, timestamp)
            bev_points.append({"id": person.track_id, "x": round(xm, 2), "y": round(ym, 2)})

            # Assign person to any matching polygon zone
            for z in self.zones:
                zid = z["id"]
                if cv2.pointPolygonTest(self._zone_polys[zid], (xm, ym), False) >= 0:
                    zone_counts[zid] += 1
                    if has_velocity:
                        zone_velocities[zid].append((vx, vy))

        # Drop stale tracks older than 5 seconds
        stale_ids = [
            tid for tid, (_, _, t) in self._last_positions.items()
            if tid not in active_ids and (timestamp - t) > 5.0
        ]
        for tid in stale_ids:
            del self._last_positions[tid]

        # Compute physics per zone
        risk_rank = {"SAFE": 0, "ELEVATED": 1, "HIGH": 2, "CRITICAL": 3}
        overall_risk = "SAFE"
        zones_report: dict[str, Any] = {}
        active_playbooks: list[dict[str, Any]] = []

        for z in self.zones:
            zid = z["id"]
            area = max(float(z["area_m2"]), 0.1)
            count = zone_counts[zid]
            density = count / area

            # Helbing crowd pressure: P = rho * (Var(vx) + Var(vy))
            vels = zone_velocities[zid]
            if len(vels) >= 2:
                arr = np.array(vels, dtype=np.float64)
                vel_var = float(np.var(arr[:, 0]) + np.var(arr[:, 1]))
            else:
                vel_var = 0.0
            pressure = density * vel_var
            turbulence = pressure >= self.thresholds["turbulence_pressure_limit"]

            # Rolling 60s inflow / outflow rates (people per minute)
            self._prune_old_events(self._inflow_events[zid], timestamp)
            self._prune_old_events(self._outflow_events[zid], timestamp)
            q_in_pm = float(len(self._inflow_events[zid]))
            q_out_pm = float(len(self._outflow_events[zid]))
            net_flux_pm = q_in_pm - q_out_pm

            # Exact Time-to-Critical-Density (minutes)
            crit_rho = float(self.thresholds["critical_density_pm2"])
            if density >= crit_rho:
                ttcd_minutes: float | None = 0.0
            elif net_flux_pm > 0.1:
                remaining_people = (crit_rho - density) * area
                ttcd_minutes = round(remaining_people / net_flux_pm, 2)
            else:
                ttcd_minutes = None

            risk = self._classify_risk(density, pressure, ttcd_minutes)
            if risk_rank[risk] > risk_rank[overall_risk]:
                overall_risk = risk

            playbook = self._build_playbook(z, risk, ttcd_minutes, turbulence)
            if risk in ("HIGH", "CRITICAL"):
                active_playbooks.append({"zone_id": zid, "risk": risk, **playbook})

            zones_report[zid] = {
                "name": z["name"],
                "count": count,
                "area_m2": area,
                "density_pm2": round(density, 2),
                "inflow_per_min": q_in_pm,
                "outflow_per_min": q_out_pm,
                "helbing_pressure": round(pressure, 4),
                "turbulence_detected": turbulence,
                "ttcd_minutes": ttcd_minutes,
                "risk_level": risk,
                "playbook": playbook,
            }

        return {
            "venue_id": self.config["venue_id"],
            "venue_name": self.config["venue_name"],
            "timestamp": round(timestamp, 2),
            "total_people": len(tracks),
            "overall_risk": overall_risk,
            "zones": zones_report,
            "active_playbooks": active_playbooks,
            "bev_points": bev_points,
        }