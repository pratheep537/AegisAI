import { useState } from "react";
import axios from "axios";
import { Crosshair, Save, X } from "lucide-react";
import { API_BASE } from "../config";

export default function CalibrationModal({ config, demoMode, onClose, onSaved }) {
  const initialPts = config?.calibration?.image_points_px || [[180, 260], [1100, 260], [1240, 690], [40, 690]];
  const [points, setPoints] = useState(initialPts);
  const [widthM, setWidthM] = useState(config?.calibration?.world_size_meters?.width || 12);
  const [heightM, setHeightM] = useState(config?.calibration?.world_size_meters?.height || 18);
  const [saving, setSaving] = useState(false);

  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const u = Math.round(((e.clientX - rect.left) / rect.width) * 1280);
    const v = Math.round(((e.clientY - rect.top) / rect.height) * 720);
    setPoints((prev) => (prev.length >= 4 ? [[u, v]] : [...prev, [u, v]]));
  };

  const handleSave = async () => {
    if (points.length !== 4) return;
    const updated = {
      ...config,
      calibration: {
        image_points_px: points,
        world_size_meters: { width: Number(widthM), height: Number(heightM) },
      },
    };
    if (demoMode) {
      onSaved(updated);
      onClose();
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/api/config`, updated);
      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-xl max-w-2xl w-full p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Crosshair className="text-emerald-400 w-5 h-5" />
            <h3 className="text-lg font-semibold">4-Point Floor Homography Calibration</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-3">
          Click 4 floor corners clockwise (Top-Left → Top-Right → Bottom-Right → Bottom-Left) on the 1280×720 camera plane.
        </p>

        <div
          onClick={handleCanvasClick}
          className="relative w-full aspect-video bg-slate-950 border border-emerald-500/40 rounded-lg cursor-crosshair overflow-hidden mb-4"
        >
          <svg viewBox="0 0 1280 720" className="w-full h-full">
            {points.length === 4 && (
              <polygon
                points={points.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="rgba(16,185,129,0.2)"
                stroke="#10b981"
                strokeWidth="4"
              />
            )}
            {points.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="14" fill="#10b981" />
                <text x={x} y={y + 5} textAnchor="middle" fill="#020617" fontSize="16" fontWeight="bold">
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="text-xs text-slate-300">
            Real Floor Width (meters)
            <input
              type="number"
              step="0.5"
              value={widthM}
              onChange={(e) => setWidthM(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-slate-300">
            Real Floor Depth (meters)
            <input
              type="number"
              step="0.5"
              value={heightM}
              onChange={(e) => setHeightM(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm"
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => setPoints([])} className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg">
            Reset Points
          </button>
          <button
            onClick={handleSave}
            disabled={points.length !== 4 || saving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-lg disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Apply Calibration"}
          </button>
        </div>
      </div>
    </div>
  );
}
