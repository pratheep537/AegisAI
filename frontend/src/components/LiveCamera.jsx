import { useEffect, useRef, useState } from "react";
import { Camera, Crosshair, RefreshCw, Users } from "lucide-react";
import { API_BASE } from "../config";

export default function LiveCamera({ totalPeople, demoMode, onOpenCalibrate }) {
  const [streamError, setStreamError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef(null);

  useEffect(() => {
    if (demoMode || streamError) return undefined;
    const img = imgRef.current;
    if (!img) return undefined;

    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    img.src = `${API_BASE}/video-feed?t=${token}`;

    return () => {
      img.src = "";
    };
  }, [demoMode, streamError, retryCount]);

  const handleRetry = () => {
    setStreamError(false);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 h-full flex flex-col overflow-hidden min-h-0">
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-slate-700 bg-slate-800/90 shrink-0">
        <div className="flex items-center gap-2">
          <Camera className="text-rose-400 w-4 h-4" />
          <h2 className="text-sm font-semibold">Camera &amp; Edge Vision</h2>
        </div>

        <div className="flex items-center gap-2">
          {!demoMode && (
            <button
              onClick={handleRetry}
              title="Reload video stream"
              className="p-1.5 text-slate-300 hover:text-white bg-slate-700/70 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onOpenCalibrate}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Calibrate Floor
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-black relative flex items-center justify-center p-1 overflow-hidden">
        {demoMode ? (
          <div className="text-center px-6 py-4 text-slate-300">
            <Camera className="w-8 h-8 mx-auto mb-2 text-sky-400 opacity-70" />
            <p className="text-sm font-semibold">Browser Demo Playback Active</p>
            <p className="text-xs text-slate-400 mt-1">
              Run <code className="text-emerald-400">docker compose up</code> locally for live RTSP / CCTV feeds.
            </p>
          </div>
        ) : !streamError ? (
          <img
            ref={imgRef}
            alt="Live AegisAI vision feed"
            className="max-w-full max-h-full w-auto h-auto object-contain rounded"
            onError={() => setStreamError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2 py-4">
            <Camera className="w-8 h-8 opacity-30" />
            <p className="text-xs">Vision stream disconnected.</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect Feed
            </button>
          </div>
        )}

        <div className="absolute bottom-2.5 left-2.5 bg-slate-900/85 backdrop-blur border border-slate-600/50 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
          <Users className="text-blue-400 w-4 h-4" />
          <div>
            <p className="text-[9px] text-slate-400 uppercase leading-none">Tracked</p>
            <p className="text-base font-black text-white leading-tight">{totalPeople || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
