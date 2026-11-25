import { useEffect, useRef } from "react";
import { Map } from "lucide-react";

export default function BEVHeatmap({ telemetry, config }) {
  const canvasRef = useRef(null);
  const points = telemetry?.bev_points || [];
  const inZoneCount = points.filter((p) => p.in_zone).length;
  const worldW = config?.calibration?.world_size_meters?.width || 10;
  const worldH = config?.calibration?.world_size_meters?.height || 6;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const pad = 26;

    const ww = config.calibration?.world_size_meters?.width || 10;
    const wh = config.calibration?.world_size_meters?.height || 6;
    const pts = telemetry?.bev_points || [];

    const toPx = (xm, ym) => [
      pad + (xm / ww) * (w - pad * 2),
      pad + (ym / wh) * (h - pad * 2),
    ];

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x <= ww; x += 1) {
      const [px] = toPx(x, 0);
      ctx.beginPath();
      ctx.moveTo(px, pad);
      ctx.lineTo(px, h - pad);
      ctx.stroke();
    }
    for (let y = 0; y <= wh; y += 1) {
      const [, py] = toPx(0, y);
      ctx.beginPath();
      ctx.moveTo(pad, py);
      ctx.lineTo(w - pad, py);
      ctx.stroke();
    }

    (config.zones || []).forEach((z) => {
      const poly = z.polygon_meters || [];
      if (poly.length < 3) return;
      const risk = telemetry?.zones?.[z.id]?.risk_level || "SAFE";
      const fillMap = {
        SAFE: "rgba(16, 185, 129, 0.14)",
        ELEVATED: "rgba(234, 179, 8, 0.18)",
        HIGH: "rgba(249, 115, 22, 0.24)",
        CRITICAL: "rgba(239, 68, 68, 0.30)",
      };
      ctx.beginPath();
      poly.forEach(([xm, ym], idx) => {
        const [px, py] = toPx(xm, ym);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = fillMap[risk] || fillMap.SAFE;
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    (config.tripwires || []).forEach((tw) => {
      const [a, b] = tw.line_meters || [];
      if (!a || !b) return;
      const [ax, ay] = toPx(a[0], a[1]);
      const [bx, by] = toPx(b[0], b[1]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = tw.direction === "in" ? "#f59e0b" : "#10b981";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    pts.forEach((pt) => {
      const [rawX, rawY] = toPx(pt.x, pt.y);
      const px = Math.max(8, Math.min(w - 8, rawX));
      const py = Math.max(8, Math.min(h - 8, rawY));

      const glow = ctx.createRadialGradient(px, py, 2, px, py, 16);
      glow.addColorStop(0, pt.in_zone ? "rgba(56, 189, 248, 0.45)" : "rgba(250, 204, 21, 0.35)");
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = pt.in_zone ? "#38bdf8" : "#facc15";
      ctx.fill();

      if (pts.length <= 35) {
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText(`#${pt.id}`, px + 6, py + 3);
      }
    });
  }, [telemetry, config]);

  return (
    <div className="bg-slate-800 rounded-xl p-3.5 shadow-lg border border-slate-700 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-2.5 border-b border-slate-700 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Bird&apos;s-Eye Metric Floor Map</h2>
        </div>
        <span className="text-xs text-slate-300 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">
          In Zone: <strong className="text-sky-400">{inZoneCount}</strong> / {points.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 bg-slate-950 rounded-lg p-2 border border-slate-700/60 flex items-center justify-center overflow-hidden">
        <canvas ref={canvasRef} width={560} height={380} className="max-w-full max-h-full w-auto h-auto rounded block" />
      </div>

      <div className="shrink-0 mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <span className="text-amber-400">--- Inflow</span>
        <span className="text-emerald-400">--- Outflow</span>
        <span className="text-sky-400">● In Zone</span>
        <span className="text-yellow-400">● Outside</span>
        <span className="text-slate-300 font-mono">{worldW}m × {worldH}m</span>
      </div>
    </div>
  );
}
