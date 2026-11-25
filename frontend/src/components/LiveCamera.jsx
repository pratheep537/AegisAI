import { useState } from "react";
import { Camera, Crosshair, RefreshCw, Users } from "lucide-react";
import { API_BASE } from "../config";

export default function LiveCamera({ totalPeople, demoMode, onOpenCalibrate }) {
  const [streamError, setStreamError] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  const handleRetry = () => {
    setStreamError(false);
    setStreamKey((prev) => prev + 1);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden relative">
      <div className="p-4 flex items-center justify-between border-b border-slate-700 bg-slate-800/90">
        <div className="flex items-center gap-2">
          <Camera className="text-rose-400 w-5 h-5" />
          <h2 className="text-lg font-semibold">Camera &amp; Edge Vision</h2>
        </div>

        <button
          onClick={onOpenCalibrate}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
        >
          <Crosshair className="w-3.5 h-3.5" />
          Calibrate Floor
        </button>
      </div>

      <div className="bg-black relative flex items-center justify-center min-h-[260px] p-2">
        {demoMode ? (
          <div className="text-center px-6 py-8 text-slate-300">
            <Camera className="w-10 h-10 mx-auto mb-2 text-sky-400 opacity-70" />
            <p className="text-sm font-semibold">Browser Demo Playback Active</p>
            <p className="text-xs text-slate-400 mt-1">
              Run <code className="text-emerald-400">docker compose up</code> locally to connect live RTSP / CCTV cameras with YOLO26n ONNX.
            </p>
          </div>
        ) : !streamError ? (
          <img
            key={streamKey}
            src={`${API_BASE}/video-feed?k=${streamKey}`}
            alt="Live AegisAI vision feed"
            className="w-full h-full object-contain rounded-lg"
            onError={() => setStreamError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-3 py-8">
            <Camera className="w-10 h-10 opacity-30" />
            <p className="text-xs">Vision stream disconnected or waiting for backend.</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect Feed
            </button>
          </div>
        )}

        <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur border border-slate-600/50 rounded-lg px-3 py-2 flex items-center gap-2.5">
          <Users className="text-blue-400 w-5 h-5" />
          <div>
            <p className="text-[10px] text-slate-400 uppercase">Tracked</p>
            <p className="text-xl font-black text-white leading-none">{totalPeople || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
