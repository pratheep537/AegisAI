export const DEMO_CONFIG = {
  venue_id: "stadium-gate-north",
  venue_name: "North Concourse & Exit Tunnel (Demo Playback)",
  camera: { source: "demo", target_fps: 5, privacy_blur_faces: true },
  calibration: {
    image_points_px: [[110, 210], [1170, 210], [1275, 718], [5, 718]],
    world_size_meters: { width: 10.0, height: 6.0 },
  },
  zones: [
    {
      id: "chokepoint_tunnel",
      name: "Concourse Core",
      polygon_meters: [[0.8, 0.8], [9.2, 0.8], [9.2, 5.2], [0.8, 5.2]],
      area_m2: 37.0,
      upstream_gates: ["Gate N1", "Gate N2"],
      relief_exits: ["Emergency Corridor E3"],
    },
  ],
  tripwires: [
    { id: "inflow_north", zone_id: "chokepoint_tunnel", direction: "in", line_meters: [[0.8, 0.8], [9.2, 0.8]] },
    { id: "outflow_south", zone_id: "chokepoint_tunnel", direction: "out", line_meters: [[0.8, 5.2], [9.2, 5.2]] },
  ],
};

function makePoints(count, seed) {
  const pts = [];
  for (let i = 0; i < count; i += 1) {
    const x = 1.1 + (((i * 37 + seed * 13) % 78) / 10);
    const y = 1.1 + (((i * 29 + seed * 19) % 38) / 10);
    pts.push({ id: i + 1, x: Number(x.toFixed(2)), y: Number(y.toFixed(2)), in_zone: true });
  }
  return pts;
}

const SCENARIO = [
  { count: 52, density: 1.41, qIn: 24, qOut: 22, pressure: 0.004, ttcd: null, risk: "SAFE", action: "FLOW NOMINAL", directive: "Concourse Core operating within safe density limits." },
  { count: 84, density: 2.27, qIn: 48, qOut: 20, pressure: 0.011, ttcd: 3.6, risk: "ELEVATED", action: "MONITOR FLOW & STAGE MARSHALS", directive: "Elevated density in Concourse Core: Keep Gate N1, Gate N2 metered and lanes clear." },
  { count: 138, density: 3.73, qIn: 66, qOut: 18, pressure: 0.019, ttcd: 1.0, risk: "HIGH", action: "THROTTLE UPSTREAM GATES", directive: "HIGH risk in Concourse Core (TTCD 1.0 min): Throttle Gate N1, Gate N2 by 50% and prepare Emergency Corridor E3." },
  { count: 185, density: 5.0, qIn: 74, qOut: 14, pressure: 0.034, ttcd: 0.0, risk: "CRITICAL", action: "HALT INFLOW & OPEN RELIEF EXITS", directive: "CRITICAL in Concourse Core: Close Gate N1, Gate N2 immediately, open Emergency Corridor E3, and broadcast calm-dispersal audio." },
  { count: 108, density: 2.92, qIn: 18, qOut: 52, pressure: 0.009, ttcd: null, risk: "ELEVATED", action: "MONITOR FLOW & STAGE MARSHALS", directive: "Relief outflow active: Concourse Core decompressing steadily." },
];

export const DEMO_FRAMES = SCENARIO.map((s, idx) => ({
  venue_id: DEMO_CONFIG.venue_id,
  venue_name: DEMO_CONFIG.venue_name,
  timestamp: 1700000000 + idx * 5,
  total_people: s.count,
  overall_risk: s.risk,
  zones: {
    chokepoint_tunnel: {
      name: "Concourse Core",
      count: s.count,
      area_m2: 37.0,
      density_pm2: s.density,
      inflow_per_min: s.qIn,
      outflow_per_min: s.qOut,
      helbing_pressure: s.pressure,
      turbulence_detected: s.pressure >= 0.02,
      ttcd_minutes: s.ttcd,
      risk_level: s.risk,
      playbook: { action: s.action, directive: s.directive },
    },
  },
  active_playbooks: s.risk === "HIGH" || s.risk === "CRITICAL"
    ? [{ zone_id: "chokepoint_tunnel", risk: s.risk, action: s.action, directive: s.directive }]
    : [],
  bev_points: makePoints(Math.min(s.count, 120), idx + 1),
}));
