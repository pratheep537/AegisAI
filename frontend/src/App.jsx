import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Activity, PlayCircle, Radio } from "lucide-react";
import { API_BASE } from "./config";
import { DEMO_CONFIG, DEMO_FRAMES } from "./demoData";
import BEVHeatmap from "./components/BEVHeatmap";
import CalibrationModal from "./components/CalibrationModal";
import LiveCamera from "./components/LiveCamera";
import LLMPanel from "./components/LLMPanel";
import PhysicsPanel from "./components/PhysicsPanel";

function App() {
  const [demoMode, setDemoMode] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [config, setConfig] = useState(DEMO_CONFIG);
  const [offline, setOffline] = useState(false);
  const [showCalibrate, setShowCalibrate] = useState(false);
  const pollingRef = useRef(false);

  useEffect(() => {
    if (demoMode) return undefined;
    let active = true;

    const loadConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/config`);
        if (active) setConfig(res.data);
      } catch {
        // Keep fallback config until backend is online
      }
    };

    const pollTelemetry = async () => {
      if (pollingRef.current) return;
      pollingRef.current = true;
      try {
        const res = await axios.get(`${API_BASE}/api/telemetry`);
        if (active) {
          setLiveTelemetry(res.data);
          setOffline(false);
        }
      } catch {
        if (active) setOffline(true);
      } finally {
        pollingRef.current = false;
      }
    };

    loadConfig();
    pollTelemetry();
    const timer = setInterval(pollTelemetry, 400);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [demoMode]);

  useEffect(() => {
    if (!demoMode) return undefined;
    const timer = setInterval(() => {
      setDemoIdx((prev) => (prev + 1) % DEMO_FRAMES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [demoMode]);

  const telemetry = demoMode ? DEMO_FRAMES[demoIdx] : liveTelemetry || DEMO_FRAMES[0];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 p-3 flex flex-col font-sans">
      <header className="shrink-0 mb-3 flex items-center gap-3 pb-2.5 border-b border-slate-700/80">
        <Activity className="h-6 w-6 text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight leading-tight truncate">
            AegisAI v2 Crowd Safety Control Room
          </h1>
          <p className="text-[11px] text-slate-400 truncate">
            {telemetry.venue_name} • Self-Hosted Edge Physics Engine
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          {offline && !demoMode && (
            <span className="text-xs text-amber-400 hidden md:inline">
              Local backend offline — switch to Demo Playback
            </span>
          )}
          <button
            onClick={() => setDemoMode((m) => !m)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              demoMode
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            {demoMode ? <PlayCircle className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
            {demoMode ? "Mode: Demo Playback" : "Mode: Live Self-Hosted"}
          </button>
        </div>
      </header>

      {/* Fixed 1-page grid: Left = Bird's-Eye Map | Center = Ops Copilot | Right = Camera + Physics Telemetry */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        <div className="lg:col-span-4 min-h-0 h-full">
          <BEVHeatmap telemetry={telemetry} config={config} />
        </div>

        <div className="lg:col-span-3 min-h-0 h-full">
          <LLMPanel telemetry={telemetry} demoMode={demoMode} />
        </div>

        <div className="lg:col-span-5 min-h-0 h-full flex flex-col gap-3">
          <div className="flex-[1.35] min-h-0">
            <LiveCamera
              totalPeople={telemetry.total_people}
              demoMode={demoMode}
              onOpenCalibrate={() => setShowCalibrate(true)}
            />
          </div>
          <div className="flex-[0.65] min-h-0">
            <PhysicsPanel telemetry={telemetry} />
          </div>
        </div>
      </main>

      {showCalibrate && (
        <CalibrationModal
          key="calibration-modal"
          config={config}
          demoMode={demoMode}
          onClose={() => setShowCalibrate(false)}
          onSaved={(updated) => setConfig(updated)}
        />
      )}
    </div>
  );
}

export default App;
