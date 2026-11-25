import { useEffect, useState } from "react";
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
      try {
        const res = await axios.get(`${API_BASE}/api/telemetry`);
        if (active) {
          setLiveTelemetry(res.data);
          setOffline(false);
        }
      } catch {
        if (active) setOffline(true);
      }
    };

    loadConfig();
    pollTelemetry();
    const timer = setInterval(pollTelemetry, 1500);
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
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans">
      <header className="mb-5 flex flex-wrap items-center gap-3 pb-3 border-b border-slate-700">
        <Activity className="h-7 w-7 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AegisAI v2 Crowd Safety Control Room</h1>
          <p className="text-xs text-slate-400">{telemetry.venue_name} • Self-Hosted Edge Physics Engine</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {offline && !demoMode && (
            <span className="text-xs text-amber-400">Local backend offline — switch to Demo Playback</span>
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

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="flex flex-col gap-5">
          <PhysicsPanel telemetry={telemetry} />
          <LLMPanel telemetry={telemetry} demoMode={demoMode} />
        </div>

        <div className="flex flex-col gap-5">
          <BEVHeatmap telemetry={telemetry} config={config} />
        </div>

        <div className="flex flex-col gap-5">
          <LiveCamera
            totalPeople={telemetry.total_people}
            demoMode={demoMode}
            onOpenCalibrate={() => setShowCalibrate(true)}
          />
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
