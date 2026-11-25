import { useEffect, useRef } from "react";
import { Map } from "lucide-react";

export default function BEVHeatmap({ telemetry, config }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const worldW = config.calibration?.world_size_meters?.width || 12;
    const worldH = config.calibration?.world_size_meters?.height || 18;
    const toPx = (xm, ym) => [(xm / worldW) * w, (ym / worldH) * h];

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = 0; x <= worldW; x += 2) {
      const [px] = toPx(x, 0);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }
    for (let y = 0; y <= worldH; y += 2) {
      const [, py] = toPx(0, y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
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

    (telemetry?.bev_points || []).forEach((pt) => {
      const [px, py] = toPx(pt.x, pt.y);
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();
    });
  }, [telemetry, config]);

  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 flex flex-col">
      <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Bird&apos;s-Eye Metric Floor Map</h2>
        </div>
        <span className="text-xs text-slate-400">Anonymized Homography (m)</span>
      </div>
      <div className="flex justify-center bg-slate-950 rounded-lg p-2 border border-slate-700/60">
        <canvas ref={canvasRef} width={360} height={300} className="w-full max-w-[360px] h-auto rounded" />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 px-1">
        <span className="text-amber-400">--- Inflow Tripwire</span>
        <span className="text-emerald-400">--- Outflow Tripwire</span>
        <span className="text-sky-400">● Footpoint (No ID)</span>
      </div>
    </div>
  );
}
